/**
 * Gemini Image Auto Generator - Content Script
 * GeminiのWebページ上で動作し、プロンプトの自動入力・送信・完了検知を行う
 * 
 * 実際のGemini DOM構造に基づいたセレクタを使用
 */

(() => {
    'use strict';

    // ===== DOM Selectors =====
    // 実際のGemini DOM構造から特定したセレクタ
    const SELECTORS = {
        // チャット入力欄（Quillエディタ or 初期textarea）
        inputField: [
            'rich-textarea .ql-editor[contenteditable="true"]',
            '.ql-editor[contenteditable="true"]',
            'div.ql-editor.textarea',
            '.initial-input-area-container > textarea',
        ],
        // 送信ボタン（日本語・英語両対応）
        sendButton: [
            'button[aria-label="メッセージを送信"]',
            'button[aria-label="Send message"]',
            'button.send-button',
            '.send-button-container button',
        ],
        // レスポンスブロック（カスタム要素）
        responseBlock: 'model-response',
        // 会話コンテナ
        conversationContainer: '.conversation-container',
        // レスポンス本文のmarkdownコンテナ（aria-busyで完了判定に使う）
        markdownContent: '.markdown.markdown-main-panel',
        // message-content要素
        messageContent: 'message-content',
        // レスポンスフッター（completeクラスで完了判定）
        responseFooter: '.response-footer',
        // アバタースピナー（生成中はvisibility: visibleになる）
        avatarSpinner: '.avatar_spinner_animation',
        // 処理状態ヘッダー
        processingState: '.response-container-header-processing-state',
        // 停止されたレスポンス
        stoppedMessage: '.stopped-draft-message',
        // ローディングスピナー（mat-progress-spinner）
        loadingSpinner: 'mat-progress-spinner[mode="indeterminate"]',
    };

    // ===== State =====
    let isProcessing = false;
    let currentItemId = null;
    let abortController = null;

    // ===== Message Handling =====
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case 'PROCESS_PROMPT':
                handleProcessPrompt(message);
                sendResponse({ ok: true });
                break;
            case 'STOP':
                handleStop();
                sendResponse({ ok: true });
                break;
        }
        return true;
    });

    // Content Scriptの準備完了を通知
    chrome.runtime.sendMessage({ type: 'CONTENT_READY' }).catch(() => { });

    // ===== Core Processing =====

    async function handleProcessPrompt(message) {
        const { prompt, itemId, timeout, delay } = message;
        isProcessing = true;
        currentItemId = itemId;
        abortController = new AbortController();

        try {
            // 1. 現在のmodel-responseの数を記録
            const initialResponseCount = document.querySelectorAll(SELECTORS.responseBlock).length;
            console.log(`[GeminiAuto] Processing: "${prompt.substring(0, 50)}..."`,
                `Initial model-response count: ${initialResponseCount}`);

            // 2. 入力欄にプロンプトを設定
            await typePrompt(prompt);
            await sleep(500);

            // 3. 送信
            await sendMessage();
            await sleep(1500); // 送信後少し待つ

            // 4. 画像生成の完了を待機
            await waitForCompletion(initialResponseCount, timeout || 300000);

            // 5. 完了通知
            console.log(`[GeminiAuto] ✅ Completed: "${prompt.substring(0, 50)}..."`);
            chrome.runtime.sendMessage({
                type: 'ITEM_COMPLETED',
                itemId: itemId,
            });

        } catch (err) {
            console.error(`[GeminiAuto] ❌ Error:`, err);
            if (err.name !== 'AbortError') {
                chrome.runtime.sendMessage({
                    type: 'ITEM_ERROR',
                    itemId: itemId,
                    error: err.message,
                });
            }
        } finally {
            isProcessing = false;
            currentItemId = null;
            abortController = null;
        }
    }

    function handleStop() {
        if (abortController) {
            abortController.abort();
        }
        isProcessing = false;
    }

    // ===== DOM Interaction =====

    /**
     * 入力欄にプロンプトを入力する
     */
    async function typePrompt(text) {
        const inputEl = findElement(SELECTORS.inputField);
        if (!inputEl) {
            throw new Error('入力欄が見つかりません。Geminiのチャット画面を開いているか確認してください。');
        }

        console.log(`[GeminiAuto] Input element found: <${inputEl.tagName}> contentEditable=${inputEl.contentEditable}`);

        if (inputEl.contentEditable === 'true' || inputEl.getAttribute('contenteditable') === 'true') {
            // Quill Editorの場合（contenteditable div）
            inputEl.focus();
            await sleep(100);

            // 既存テキストをクリア
            inputEl.innerHTML = '';

            // テキストを<p>タグで設定（Quillの形式に合わせる）
            const p = document.createElement('p');
            p.textContent = text;
            inputEl.appendChild(p);

            // input イベントを発火してAngularの状態を更新
            dispatchInputEvents(inputEl);

        } else if (inputEl.tagName === 'TEXTAREA' || inputEl.tagName === 'INPUT') {
            // 初期入力エリア（textarea）の場合
            inputEl.focus();
            await sleep(100);

            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            )?.set;

            if (nativeSetter) {
                nativeSetter.call(inputEl, text);
            } else {
                inputEl.value = text;
            }

            dispatchInputEvents(inputEl);
        }

        await sleep(200);
        console.log('[GeminiAuto] ✅ Prompt typed');
    }

    /**
     * 送信ボタンをクリック or Enterキー送信
     */
    async function sendMessage() {
        await sleep(300);

        const sendBtn = findElement(SELECTORS.sendButton);
        if (sendBtn && !sendBtn.disabled) {
            sendBtn.click();
            console.log('[GeminiAuto] ✅ Send button clicked');
            return;
        }

        // フォールバック: Enterキーで送信
        const inputEl = findElement(SELECTORS.inputField);
        if (inputEl) {
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
            });
            inputEl.dispatchEvent(enterEvent);
            console.log('[GeminiAuto] ✅ Enter key dispatched (fallback)');
        } else {
            throw new Error('送信ボタンも入力欄も見つかりません。');
        }
    }

    /**
     * レスポンスの完了を待機する
     * 
     * 検知方法:
     * 1. 新しい model-response 要素が出現したか
     * 2. 最後の .markdown の aria-busy が "false" か
     * 3. .response-footer に "complete" クラスがあるか
     * 4. アバタースピナーが非表示か
     */
    function waitForCompletion(initialResponseCount, timeout) {
        return new Promise((resolve, reject) => {
            const signal = abortController?.signal;
            if (signal?.aborted) {
                reject(new DOMException('Aborted', 'AbortError'));
                return;
            }

            let timeoutId;
            let checkInterval;
            let observer;

            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (checkInterval) clearInterval(checkInterval);
                if (observer) observer.disconnect();
            };

            // タイムアウト
            timeoutId = setTimeout(() => {
                cleanup();
                const currentCount = document.querySelectorAll(SELECTORS.responseBlock).length;
                if (currentCount > initialResponseCount) {
                    console.log('[GeminiAuto] ⚠ Timeout but response exists, treating as complete');
                    resolve();
                } else {
                    reject(new Error(`タイムアウト（${timeout / 1000}秒）: レスポンスが検出されませんでした`));
                }
            }, timeout);

            // 中断ハンドラ
            if (signal) {
                signal.addEventListener('abort', () => {
                    cleanup();
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            }

            // 完了チェック関数
            const checkCompletion = () => {
                // 1. 新しいmodel-responseが追加されたか
                const currentResponseCount = document.querySelectorAll(SELECTORS.responseBlock).length;
                if (currentResponseCount <= initialResponseCount) {
                    return false; // まだレスポンスが来ていない
                }

                // 2. 最後のmodel-response内のmarkdownのaria-busyを確認
                const allMarkdowns = document.querySelectorAll(SELECTORS.markdownContent);
                if (allMarkdowns.length > 0) {
                    const lastMarkdown = allMarkdowns[allMarkdowns.length - 1];
                    const ariaBusy = lastMarkdown.getAttribute('aria-busy');
                    if (ariaBusy === 'true') {
                        console.log('[GeminiAuto] ⏳ aria-busy is still true, waiting...');
                        return false; // まだ生成中
                    }
                }

                // 3. response-footerにcompleteクラスがあるか確認
                const allFooters = document.querySelectorAll(SELECTORS.responseFooter);
                if (allFooters.length > 0) {
                    const lastFooter = allFooters[allFooters.length - 1];
                    if (!lastFooter.classList.contains('complete')) {
                        console.log('[GeminiAuto] ⏳ Response footer not complete yet...');
                        return false;
                    }
                }

                // 4. アバタースピナーが非表示か確認
                const spinners = document.querySelectorAll(SELECTORS.avatarSpinner);
                for (const spinner of spinners) {
                    const style = window.getComputedStyle(spinner);
                    if (style.visibility === 'visible' && style.opacity !== '0') {
                        console.log('[GeminiAuto] ⏳ Avatar spinner still visible...');
                        return false;
                    }
                }

                // すべての条件をクリア → 完了
                return true;
            };

            // 2秒ごとにチェック
            checkInterval = setInterval(() => {
                if (checkCompletion()) {
                    console.log('[GeminiAuto] ✅ Response completed!');
                    cleanup();
                    resolve();
                }
            }, 2000);

            // MutationObserverでDOMの変化も監視（チェック間隔の補助）
            observer = new MutationObserver(() => {
                // DOM変化があったら即座にチェック（ただし連続呼び出しを防ぐためデバウンス）
                // setIntervalで十分なので、ここでは特に何もしない
                // ただし、DOMに大きな変化があった場合のログ用
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-busy', 'class', 'style'],
            });
        });
    }

    // ===== Helper Functions =====

    /**
     * セレクタリストから最初にマッチする要素を返す
     */
    function findElement(selectorList) {
        if (typeof selectorList === 'string') {
            return document.querySelector(selectorList);
        }
        for (const selector of selectorList) {
            try {
                const el = document.querySelector(selector);
                if (el) return el;
            } catch (e) {
                // Invalid selectorは無視
            }
        }
        return null;
    }

    /**
     * 入力イベントをディスパッチ（Angular/Reactの状態同期用）
     */
    function dispatchInputEvents(element) {
        const events = [
            new Event('input', { bubbles: true, cancelable: true }),
            new Event('change', { bubbles: true, cancelable: true }),
            new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
            }),
        ];

        events.forEach(event => {
            try {
                element.dispatchEvent(event);
            } catch (e) {
                // ignore
            }
        });
    }

    /**
     * 指定ミリ秒待機
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    console.log('[GeminiAuto] Content script loaded on', window.location.href);
})();
