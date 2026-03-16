// Video Factory — Pattern Detector
// AIの出力テキストを分析して、5つの状態を検知する

class PatternDetector {
  constructor() {
    // ===== 完了パターン =====
    // いずれか1つでも含まれていたら完了候補（idle判定と組み合わせ）
    this.completionPatterns = [
      // 明示的な完了報告キーワード
      '最終完了報告',
      '全フェーズ完了',
      'Phase D',
      '完成品フォルダ',
      '完成品/',
      'YouTube投稿チェックリスト',
      'YouTube投稿可能',
      'YouTube概要欄',
      'remotion render',    // Phase D の最終出力に含まれる
      '全ての工程が完了',
      '動画生成が完了',
      '以上で完了',
    ];

    // 完了の確度を上げるためのスコアリング — 2つ以上マッチで完了
    this.completionThreshold = 2;

    // ===== 自動応答すべき確認パターン =====
    this.autoConfirmPatterns = [
      // Phase間の確認
      'Phase B に進みますか', 'Phase C に進みますか', 'Phase D に進みますか',
      '次のフェーズに進', '次のステップに進',
      // 一般的な確認
      'このまま進めてもよいですか', '続けてもよろしいですか', '続行しますか',
      '実行してもよいですか', '進めてよろしいですか', 'よろしいですか',
      '問題ありませんか', '確認してください', 'いかがでしょうか',
    ];

    // ===== 人間の介入が必要なパターン =====
    this.humanInterventionPatterns = [
      // VOICEVOX
      'VOICEVOXを起動', 'VOICEVOXが起動していない', 'ECONNREFUSED',
      // 環境
      'ffmpegがインストールされていない', 'npm install', 'node_modulesが見つかりません',
      // パーミッション
      'アクセスが拒否されました', 'Permission denied', 'EPERM',
    ];
    // 注意: 'npx remotion render' は Phase D の完了出力に含まれるため
    //       人間介入パターンからは除外済み

    // ===== レートリミットパターン =====
    this.rateLimitPatterns = [
      'rate limit', 'Rate limit', '429', 'Too Many Requests',
      'quota exceeded', 'Quota exceeded', 'RESOURCE_EXHAUSTED',
      'リクエスト数の上限', 'しばらく待って',
    ];

    // ===== タイムアウト設定 =====
    this.idleThresholdMs = 5000;        // 完了判定用: 5秒
    this.waitingThresholdMs = 10000;     // 確認待ち判定用: 10秒
    this.stuckThresholdMs = 5 * 60000;  // スタック判定用: 5分
  }

  /**
   * メインの判定関数 — 優先順位に沿って状態を返す
   * @param {string} chatText - チャット全文
   * @param {number} lastDomChange - 最後のDOM変更タイムスタンプ (ms)
   * @returns {string} 'completed' | 'needs_human' | 'rate_limited' | 'needs_auto_confirm' | 'stuck' | 'processing'
   */
  evaluate(chatText, lastDomChange) {
    const now = Date.now();
    const idleMs = now - lastDomChange;

    // 1. レートリミットか
    if (this._isRateLimited(chatText)) {
      return 'rate_limited';
    }

    // 2. 完了したか（最優先! 完了出力には人間介入パターンも含まれるため）
    if (this._isCompleted(chatText, idleMs)) {
      return 'completed';
    }

    // 3. 人間の介入が必要か
    if (this._needsHumanIntervention(chatText, idleMs)) {
      return 'needs_human';
    }

    // 4. 不要な確認を求めているか
    if (this._needsAutoConfirm(chatText, idleMs)) {
      return 'needs_auto_confirm';
    }

    // 5. スタックしているか
    if (idleMs > this.stuckThresholdMs) {
      return 'stuck';
    }

    return 'processing';
  }

  // ─── 個別判定 ──────────────────────────────────────────────

  _isCompleted(chatText, idleMs) {
    if (idleMs < this.idleThresholdMs) return false;

    const tail = chatText.slice(-3000);

    // スコアリング: マッチするパターンの数で判定
    const matchCount = this.completionPatterns.filter(p => tail.includes(p)).length;
    return matchCount >= this.completionThreshold;
  }

  _needsAutoConfirm(chatText, idleMs) {
    if (idleMs < this.waitingThresholdMs) return false;

    const tail = chatText.slice(-1500);
    const hasPattern = this.autoConfirmPatterns.some(p => tail.includes(p));

    // 完了や人間介入でないことも確認
    return hasPattern
      && !this._isCompleted(chatText, idleMs)
      && !this._needsHumanIntervention(chatText, idleMs);
  }

  _needsHumanIntervention(chatText, idleMs) {
    if (idleMs < this.waitingThresholdMs) return false;

    const tail = chatText.slice(-2000);
    return this.humanInterventionPatterns.some(p => tail.includes(p));
  }

  _isRateLimited(chatText) {
    const tail = chatText.slice(-1000);
    return this.rateLimitPatterns.some(p => tail.includes(p));
  }
}

module.exports = { PatternDetector };
