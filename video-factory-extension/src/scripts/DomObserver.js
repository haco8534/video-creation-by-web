// Video Factory — DOM Observer Script
// CDP経由でエージェントパネルに注入するスクリプト群
//
// 重要な発見 (2026-03-16):
// Antigravityのチャット UI は iframe の中ではなく、メインドキュメントに
// .antigravity-agent-side-panel として直接レンダリングされている。
// 入力は Lexical エディタ (contenteditable div) で、textarea ではない。

/**
 * 注入スクリプトを生成する
 * Observerはチャットテキストの読み取りと最終変更時刻の更新だけを行い、
 * 重い判定ロジックは拡張機能側のポーリングで実行する
 */
function buildObserverScript() {
  return `(function() {
    // 既存のObserverがあれば切断
    if (window.__VF_OBSERVER) {
      try { window.__VF_OBSERVER.disconnect(); } catch(e) {}
    }

    window.__VF_LAST_DOM_CHANGE = Date.now();
    window.__VF_CHAT_TEXT = '';
    window.__VF_READY = false;

    // エージェントサイドパネル → 会話コンテナを探す
    function findChatContainer() {
      // 最優先: #conversation (実際のDOM構造で確認済み)
      var conv = document.querySelector('#conversation');
      if (conv) return conv;

      // フォールバック1: サイドパネル内の会話エリア
      var panel = document.querySelector('.antigravity-agent-side-panel');
      if (panel) return panel;

      // フォールバック2: 一般的なセレクタ
      var container = document.querySelector('[class*="conversation"], [class*="chat"]');
      if (container) return container;

      return document.body;
    }

    var container = findChatContainer();
    window.__VF_READY = !!container && container !== document.body;

    var observer = new MutationObserver(function() {
      window.__VF_LAST_DOM_CHANGE = Date.now();

      if (!container || !container.isConnected) {
        container = findChatContainer();
      }

      if (container) {
        window.__VF_CHAT_TEXT = container.innerText || '';
      }
    });

    // メインドキュメントを監視（チャットUIはメインDOMにある）
    observer.observe(document.documentElement || document, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.__VF_OBSERVER = observer;

    // フォールバック: 10秒ごとにスキャン
    if (window.__VF_FALLBACK_INTERVAL) {
      clearInterval(window.__VF_FALLBACK_INTERVAL);
    }
    window.__VF_FALLBACK_INTERVAL = setInterval(function() {
      window.__VF_LAST_DOM_CHANGE = window.__VF_LAST_DOM_CHANGE || Date.now();
      if (container && container.isConnected) {
        window.__VF_CHAT_TEXT = container.innerText || '';
      }
    }, 10000);

    return 'observer-installed';
  })()`;
}

/**
 * チャットテキストと最終変更時刻を取得するスクリプト
 */
function buildStatusReadScript() {
  return `(function() {
    // 入力欄の存在もチェック（チャット画面かどうかの判定に使う）
    var inputExists = !!document.querySelector(
      '#antigravity\\\\.agentSidePanelInputBox div[contenteditable="true"][data-lexical-editor="true"]'
    );
    var panelExists = !!document.querySelector('.antigravity-agent-side-panel');

    return JSON.stringify({
      chatText: (window.__VF_CHAT_TEXT || '').slice(-5000),
      lastDomChange: window.__VF_LAST_DOM_CHANGE || 0,
      ready: !!window.__VF_READY,
      inputExists: inputExists,
      panelExists: panelExists
    });
  })()`;
}

/**
 * チャット入力欄にテキストを注入して送信するスクリプト
 *
 * Antigravityの入力欄は Lexical エディタ (contenteditable div) なので、
 * React/Lexical のイベントフローに合わせた入力が必要
 */
function buildSendMessageScript(text) {
  const escaped = JSON.stringify(text);
  return `(function() {
    // Lexical contenteditable入力欄を探す（実際のDOM構造で確認済み）
    var input = document.querySelector(
      '#antigravity\\\\.agentSidePanelInputBox div[contenteditable="true"][data-lexical-editor="true"]'
    );

    // フォールバック: 汎用セレクタ
    if (!input) {
      input = document.querySelector('.antigravity-agent-side-panel div[contenteditable="true"]');
    }
    if (!input) {
      input = document.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
    }

    if (!input) return 'input-not-found';

    // input にフォーカスを当てる
    input.focus();

    // Lexical エディタへの入力 (E2Eテスト結果 2026-03-16):
    //   ✅ execCommand('insertText') は正常に動作する（唯一確実な方法）
    //   ❌ selectAll+delete/forwardDelete はLexicalでは効かない
    //   ❌ innerHTML直接変更はLexicalの状態を壊す
    //   ❌ Ctrl+AのKeyboardEventはLexicalに無視される
    //
    // 新しい会話を開始した直後は入力欄が空なのでクリア不要。
    // insertText でテキストを直接追加する。
    document.execCommand('insertText', false, ${escaped});

    // 少し待ってから送信
    setTimeout(function() {
      // 方法1: inputBox内の最後のボタン
      // テスト結果: テキスト入力後にボタンが4つに増え、最後のボタンが送信ボタン
      var inputBox = document.querySelector('#antigravity\\\\.agentSidePanelInputBox');
      if (inputBox) {
        var btns = inputBox.querySelectorAll('button');
        var lastBtn = btns[btns.length - 1];
        if (lastBtn && !lastBtn.disabled) {
          lastBtn.click();
          return;
        }
      }

      // 方法2: data-tooltip-id で特定（バージョン違いへのフォールバック）
      var sendBtn = document.querySelector('button[data-tooltip-id="input-send-button-send-tooltip"]');
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
        return;
      }

      // 方法3: Enter キーイベント
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13,
        bubbles: true, cancelable: true
      }));
    }, 500);

    return 'message-sent';
  })()`;
}

/**
 * 新しい会話を開始するスクリプト
 */
function buildNewChatScript() {
  return `(function() {
    // 最優先: data-tooltip-idで特定（実際のDOM構造で確認済み）
    var newChatBtn = document.querySelector('a[data-tooltip-id="new-conversation-tooltip"]');
    if (newChatBtn) {
      // disabled チェック（cursor-not-allowed クラスがある場合）
      if (newChatBtn.classList.contains('cursor-not-allowed')) {
        return 'new-chat-disabled';
      }
      newChatBtn.click();
      return 'new-chat-clicked';
    }

    // フォールバック1: サイドパネル内の + アイコン
    var panel = document.querySelector('.antigravity-agent-side-panel');
    if (panel) {
      var links = panel.querySelectorAll('a, button');
      for (var i = 0; i < links.length; i++) {
        var el = links[i];
        var label = (el.getAttribute('aria-label') || '').toLowerCase();
        var title = (el.getAttribute('title') || '').toLowerCase();
        if (label.includes('new') || title.includes('new')) {
          el.click();
          return 'new-chat-clicked-fallback';
        }
      }
    }

    // フォールバック2: 全ドキュメントで探す
    var buttons = document.querySelectorAll('button, [role="button"], a');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = (btn.textContent || '').trim().toLowerCase();
      var label = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (text.includes('new chat') || text.includes('new conversation')
          || label.includes('new chat') || label.includes('new conversation')) {
        btn.click();
        return 'new-chat-clicked-generic';
      }
    }

    return 'new-chat-not-found';
  })()`;
}

/**
 * 現在のチャットが処理中かどうかを判定するスクリプト
 * 送信ボタンの状態、スピナーの有無などをチェック
 */
function buildIsProcessingScript() {
  return `(function() {
    // 送信ボタンが無効化されているか
    var sendBtn = document.querySelector('button[data-tooltip-id="input-send-button-send-tooltip"]');
    var sendBtnDisabled = sendBtn ? sendBtn.disabled : false;

    // スピナー/ローディングインジケータが表示されているか
    var panel = document.querySelector('.antigravity-agent-side-panel');
    var hasSpinner = false;
    var hasStopBtn = false;

    if (panel) {
      // codicon-loading / codicon-sync-spin などのスピナーアイコン
      hasSpinner = !!panel.querySelector('.codicon-loading, .codicon-sync.codicon-modifier-spin, [class*="spinner"], [class*="loading"]');

      // 停止ボタンの存在（処理中を示す）
      var btns = panel.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        var label = (btns[i].getAttribute('aria-label') || '').toLowerCase();
        if (label.includes('stop') || label.includes('cancel')) {
          hasStopBtn = true;
          break;
        }
      }
    }

    return JSON.stringify({
      sendBtnDisabled: sendBtnDisabled,
      hasSpinner: hasSpinner,
      hasStopBtn: hasStopBtn,
      isProcessing: sendBtnDisabled || hasSpinner || hasStopBtn
    });
  })()`;
}

module.exports = {
  buildObserverScript,
  buildStatusReadScript,
  buildSendMessageScript,
  buildNewChatScript,
  buildIsProcessingScript,
};
