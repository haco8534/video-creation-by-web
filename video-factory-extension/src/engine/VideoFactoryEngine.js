// Video Factory — Main Engine
// ステートマシン + メインループ

const { PatternDetector } = require('./PatternDetector');
const {
  buildObserverScript,
  buildStatusReadScript,
  buildSendMessageScript,
  buildNewChatScript,
  buildIsProcessingScript,
} = require('../scripts/DomObserver');

const STATES = {
  IDLE: 'IDLE',
  QUOTA_CHECK: 'QUOTA_CHECK',
  QUOTA_LOW: 'QUOTA_LOW',
  STARTING_CHAT: 'STARTING_CHAT',
  SENDING_THEME: 'SENDING_THEME',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  RATE_LIMITED: 'RATE_LIMITED',
  WAITING_HUMAN: 'WAITING_HUMAN',
  ALL_DONE: 'ALL_DONE',
  STOPPED: 'STOPPED',
};

const AUTO_CONFIRM_MESSAGE = 'はい、続けてください。ワークフローの最後まで一気に実行してください。';
const STUCK_NUDGE_MESSAGE = 'まだ処理中ですか？続行してください。';

class VideoFactoryEngine {
  constructor({ cdp, queue, config, log, notify, onStateChange }) {
    this.cdp = cdp;
    this.queue = queue;
    this.config = config;
    this.log = log;
    this.notify = notify;
    this.onStateChange = onStateChange || (() => {});
    this.detector = new PatternDetector();

    this.state = STATES.IDLE;
    this.currentTheme = null;
    this._running = false;
    this._stuckRetried = false;
  }

  setState(newState) {
    const old = this.state;
    this.state = newState;
    this.log(`[Engine] ${old} → ${newState}`);
    this.onStateChange(newState, this.currentTheme);
  }

  // ─── メインループ ──────────────────────────────────────────

  async start() {
    if (this._running) {
      this.log('[Engine] Already running');
      return;
    }

    this._running = true;
    this.log('🏭 Video Factory started');
    this.notify('Video Factory を開始しました');

    try {
      // CDP接続
      if (!this.cdp.isConnected) {
        this.log('[Engine] Connecting to CDP...');
        await this.cdp.connect();
      }

      // MutationObserverを注入
      await this._injectObserver();

      // メインループ
      while (this._running) {
        // 次のテーマを取得
        this.currentTheme = this.queue.getNextPending();

        if (!this.currentTheme) {
          this.setState(STATES.ALL_DONE);
          this.log('✅ 全テーマ処理完了');
          this.notify('全ての動画が生成されました');
          break;
        }

        // クォータチェック
        this.setState(STATES.QUOTA_CHECK);
        const canProceed = await this._checkQuota();
        if (!canProceed) {
          this.setState(STATES.QUOTA_LOW);
          this.notify(`クォータ残量が${this.config.quotaThresholdPercent}%以下。自動実行を一時停止。`);
          break;
        }

        this.log(`📝 次のテーマ: ${this.currentTheme.title}`);

        // 新しいチャットを開始
        this.setState(STATES.STARTING_CHAT);
        const chatStarted = await this._startNewChat();
        if (!chatStarted) {
          this.log('⚠️ New Chat の開始に失敗。リトライします...');
          await this._sleep(5000);
          continue;
        }

        await this._sleep(3000); // UIが安定するまで待つ

        // プロンプトを送信
        this.setState(STATES.SENDING_THEME);
        const prompt = this._buildPrompt(this.currentTheme.title);
        await this._sendMessage(prompt);
        this.queue.updateStatus(this.currentTheme.id, 'in_progress');

        // Observerを再注入（新しい会話でDOMが変わるため）
        await this._sleep(2000);
        await this._injectObserver();

        // 完了を待つ
        this.setState(STATES.PROCESSING);
        const result = await this._waitForCompletion();

        // 結果に応じて処理
        await this._handleResult(result);

        // 次のテーマとの間に少し待つ
        await this._sleep(10000);
      }
    } catch (e) {
      this.log(`❌ Engine error: ${e.message}`);
      this.notify(`エラー: ${e.message}`);
    } finally {
      this._running = false;
      if (this.state !== STATES.ALL_DONE && this.state !== STATES.QUOTA_LOW) {
        this.setState(STATES.STOPPED);
      }
    }
  }

  stop() {
    this._running = false;
    this.log('⏹️ Video Factory stopped');
    this.setState(STATES.STOPPED);
  }

  get isRunning() {
    return this._running;
  }

  // ─── 完了待ち ──────────────────────────────────────────────

  async _waitForCompletion() {
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const startTime = Date.now();
    this._stuckRetried = false;

    while (this._running && (Date.now() - startTime < timeoutMs)) {
      // CDP接続チェック
      if (!this.cdp.isConnected) {
        this.log('[Engine] CDP disconnected. Reconnecting...');
        try {
          await this.cdp.reconnect();
          await this._injectObserver();
        } catch (e) {
          this.log(`[Engine] Reconnect failed: ${e.message}`);
          await this._sleep(30000);
          continue;
        }
      }

      // ステータスを読み取り
      const status = await this._readAndEvaluate();

      switch (status) {
        case 'completed':
          return 'completed';

        case 'needs_auto_confirm':
          this.log('🤖 確認プロンプト検知 → 自動応答');
          await this._sendMessage(AUTO_CONFIRM_MESSAGE);
          await this._sleep(3000);
          break;

        case 'rate_limited':
          return 'rate_limited';

        case 'needs_human':
          this.setState(STATES.WAITING_HUMAN);
          this.notify('⚠️ 人間の操作が必要です。Antigravityを確認してください。');
          // 人間が対応するまで長めに待つ
          await this._sleep(60000);
          this.setState(STATES.PROCESSING);
          break;

        case 'stuck':
          if (!this._stuckRetried) {
            this.log('⏳ 5分間変化なし → 復帰を試みる');
            await this._sendMessage(STUCK_NUDGE_MESSAGE);
            this._stuckRetried = true;
            await this._sleep(30000);
          } else {
            return 'failed'; // 2度目のスタック → 失敗
          }
          break;

        case 'processing':
        default:
          // まだ処理中 — 何もしない
          break;
      }

      await this._sleep(this.config.pollIntervalMs);
    }

    return 'failed'; // タイムアウト
  }

  // ─── 結果ハンドリング ──────────────────────────────────────

  async _handleResult(result) {
    switch (result) {
      case 'completed':
        this.setState(STATES.COMPLETED);
        this.queue.updateStatus(this.currentTheme.id, 'done');
        this.log(`✅ ${this.currentTheme.title} 完了`);
        this.notify(`✅ ${this.currentTheme.title} が完了しました`);
        break;

      case 'rate_limited':
        this.setState(STATES.RATE_LIMITED);
        const cooldown = this.config.rateLimitCooldownMinutes;
        this.log(`⏳ レートリミット検知。${cooldown}分待機...`);
        this.notify(`レートリミット到達。${cooldown}分後に再開します。`);
        this.queue.updateStatus(this.currentTheme.id, 'pending');
        await this._sleep(cooldown * 60 * 1000);
        break;

      case 'failed':
        const theme = this.currentTheme;
        const retryCount = (theme.retryCount || 0) + 1;

        if (retryCount >= this.config.maxRetries) {
          this.queue.updateStatus(theme.id, 'failed');
          this.log(`❌ ${theme.title} 失敗（リトライ上限 ${this.config.maxRetries} 回）`);
          this.notify(`❌ ${theme.title} が失敗しました`);
        } else {
          this.queue.updateStatus(theme.id, 'pending');
          this.log(`🔄 ${theme.title} リトライ予定 (${retryCount}/${this.config.maxRetries})`);
        }
        break;
    }
  }

  // ─── CDP操作 ───────────────────────────────────────────────

  async _injectObserver() {
    try {
      const result = await this.cdp.evaluate(buildObserverScript());
      this.log(`[Engine] Observer: ${result}`);
    } catch (e) {
      this.log(`[Engine] Observer injection failed: ${e.message}`);
    }
  }

  async _readAndEvaluate() {
    try {
      const raw = await this.cdp.evaluate(buildStatusReadScript());
      if (!raw) return 'processing';

      const { chatText, lastDomChange, ready, inputExists, panelExists } = JSON.parse(raw);

      // パネルが存在しない場合はエラー状態
      if (!panelExists) {
        this.log('[Engine] Agent panel not found in main DOM');
        return 'processing';
      }

      if (!inputExists || !chatText) return 'processing';

      // 処理中かどうかも追加チェック
      try {
        const procRaw = await this.cdp.evaluate(buildIsProcessingScript());
        if (procRaw) {
          const proc = JSON.parse(procRaw);
          if (proc.isProcessing) {
            // まだ処理中の場合はdetectorのevaluateを飛ばす
            return 'processing';
          }
        }
      } catch (_) { /* ignore */ }

      return this.detector.evaluate(chatText, lastDomChange);
    } catch (e) {
      this.log(`[Engine] Status read error: ${e.message}`);
      return 'processing';
    }
  }

  async _sendMessage(text) {
    try {
      // ===== E2Eテスト確認済みの送信方法 (2026-03-16) =====
      // Step1: 入力欄にフォーカス
      await this.cdp.evaluate(`(function() {
        var input = document.querySelector(
          '#antigravity\\\\.agentSidePanelInputBox div[contenteditable="true"]'
        );
        if (input) { input.click(); input.focus(); }
      })()`);

      await this._sleep(300);

      // Step2: CDP Input.insertText でテキスト注入
      await this.cdp.insertText(text);

      await this._sleep(500);

      // Step3: CDP Input.dispatchKeyEvent で Enter キー送信
      // ※ ボタンクリック (Runtime.evaluate) では送信できない
      // ※ CDP Enterキーが唯一確実に動く方法
      await this.cdp.cdpCall('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'Enter',
        code: 'Enter',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
        text: '\r'
      });

      this.log(`[Engine] Sent: ${text.substring(0, 40)}...`);
      return true;
    } catch (e) {
      this.log(`[Engine] Send failed: ${e.message}`);
      return false;
    }
  }

  async _startNewChat() {
    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!this._running) return false;

      try {
        const result = await this.cdp.evaluate(buildNewChatScript());
        this.log(`[Engine] New chat (attempt ${attempt}/${maxAttempts}): ${result}`);

        if (result && result.includes('clicked')) {
          return true;
        }

        if (result === 'new-chat-disabled') {
          // AIが応答中 or 別の会話がアクティブ。60秒待ってリトライ
          if (attempt === 1) {
            this.notify('現在の会話が終了するまで待機中...');
          }
          this.log(`[Engine] New Chat disabled. Waiting 60s (${attempt}/${maxAttempts})...`);
          await this._sleep(60000);
          continue;
        }

        // not-found の場合はすぐfail
        return false;
      } catch (e) {
        this.log(`[Engine] New chat error (attempt ${attempt}): ${e.message}`);
        if (attempt < maxAttempts) await this._sleep(5000);
      }
    }
    this.notify('New Chat を開始できませんでした。現在の会話を終了してから再試行してください。');
    return false;
  }

  async _checkQuota() {
    try {
      // クォータ表示をCDPで読み取る試み
      const quotaText = await this.cdp.evaluate(`(function() {
        // パターン1: プログレスバー
        var bar = document.querySelector('[data-testid="quota-progress"], .quota-bar, [class*="quota"]');
        if (bar) {
          var w = parseFloat(bar.style.width || '0');
          if (w > 0) return JSON.stringify({ used: w, remaining: 100 - w, source: 'bar' });
        }

        // パターン2: テキスト表示
        var els = document.querySelectorAll('[class*="quota"], [class*="usage"], [class*="limit"]');
        for (var i = 0; i < els.length; i++) {
          var text = els[i].textContent || '';
          var match = text.match(/(\\d+)\\s*%/) || text.match(/(\\d+)\\s*\\/\\s*(\\d+)/);
          if (match) {
            if (match[2]) return JSON.stringify({ remaining: (parseInt(match[1]) / parseInt(match[2])) * 100, source: 'text' });
            return JSON.stringify({ remaining: parseInt(match[1]), source: 'text' });
          }
        }

        return null;
      })()`);

      if (!quotaText) {
        this.log('[Engine] クォータ残量を読み取れません。続行します。');
        return true; // フォールバック: 続行
      }

      const quota = JSON.parse(quotaText);
      this.log(`📊 クォータ残量: ${quota.remaining.toFixed(1)}% (${quota.source})`);

      if (quota.remaining <= this.config.quotaThresholdPercent) {
        this.log(`⏸️ クォータ残量が${this.config.quotaThresholdPercent}%以下。`);
        return false;
      }

      return true;
    } catch (e) {
      this.log(`[Engine] Quota check error: ${e.message}. Continuing.`);
      return true; // エラー時はフォールバックで続行
    }
  }

  // ─── プロンプト構成 ──────────────────────────────────────────

  _buildPrompt(themeTitle) {
    // ワークフローのスラッシュコマンド (例: /create-video-full) は
    // CDP経由のInput.insertTextではサジェストメニューが発動しないため、
    // 自然言語でワークフロー参照を指示するプロンプトを構成する。
    //
    // Antigravityは .agents/workflows/ 内のファイルを読めるので、
    // ファイルパスを参照してワークフローを実行させる。

    const workflowCmd = this.config.workflowCommand || '/create-video-full';
    const workflowFile = workflowCmd.replace(/^\//, '') + '.md';

    return [
      `テーマ「${themeTitle}」で動画を自動生成してください。`,
      '',
      `ワークフロー .agents/workflows/${workflowFile} を読んで、`,
      'Phase A → Phase B → Phase C → Phase D をすべて自律実行してください。',
      '',
      '途中で質問や確認をせず、最後まで一気通貫で実行して、',
      '完了したら最終完了報告だけ返してください。',
    ].join('\n');
  }

  // ─── ユーティリティ ────────────────────────────────────────

  _sleep(ms) {
    return new Promise(resolve => {
      const timer = setTimeout(resolve, ms);
      // 停止要求があった場合に即座に抜ける
      const check = setInterval(() => {
        if (!this._running) {
          clearTimeout(timer);
          clearInterval(check);
          resolve();
        }
      }, 1000);
    });
  }
}

module.exports = { VideoFactoryEngine, STATES };
