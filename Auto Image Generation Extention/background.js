/**
 * Gemini Image Auto Generator - Background Script (Service Worker)
 * 状態管理、Popup ↔ Content Script間のメッセージルーティング
 */

// ===== State =====
let isRunning = false;
let currentTabId = null;
let processingQueue = [];
let currentIndex = 0;
let settings = { timeout: 300, delay: 3 };

// ===== Message Handling =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'START_PROCESSING':
            handleStartProcessing(message);
            sendResponse({ ok: true });
            break;

        case 'STOP_PROCESSING':
            handleStopProcessing();
            sendResponse({ ok: true });
            break;

        case 'GET_STATUS':
            sendResponse({ status: isRunning ? 'running' : 'idle' });
            break;

        case 'ITEM_COMPLETED':
            handleItemCompleted(message);
            break;

        case 'ITEM_ERROR':
            handleItemError(message);
            break;

        case 'CONTENT_READY':
            // Content Scriptの準備完了
            sendResponse({ ok: true });
            break;
    }
    return true; // 非同期レスポンスを有効化
});

// ===== Processing Logic =====

async function handleStartProcessing(message) {
    isRunning = true;
    currentTabId = message.tabId;
    processingQueue = message.queue;
    currentIndex = 0;
    settings = message.settings || { timeout: 300, delay: 3 };

    updateBadge();

    // 最初のアイテムを開始
    processNextItem();
}

function handleStopProcessing() {
    isRunning = false;
    currentTabId = null;
    processingQueue = [];
    currentIndex = 0;
    chrome.action.setBadgeText({ text: '' });

    // Content Scriptに停止を通知
    if (currentTabId) {
        chrome.tabs.sendMessage(currentTabId, { type: 'STOP' }).catch(() => { });
    }
}

async function processNextItem() {
    if (!isRunning || currentIndex >= processingQueue.length) {
        // 全件完了
        isRunning = false;
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });

        // Popupに通知
        broadcastMessage({ type: 'ALL_COMPLETED' });

        // 完了状態を保存
        await chrome.storage.local.set({
            processingState: {
                status: 'completed',
                currentIndex: -1,
                totalCount: processingQueue.length,
                completedCount: processingQueue.length,
            }
        });
        return;
    }

    const item = processingQueue[currentIndex];

    // Popupに開始通知
    broadcastMessage({
        type: 'ITEM_STARTED',
        itemId: item.id,
        index: currentIndex,
    });

    // Content Scriptにプロンプト送信
    try {
        await chrome.tabs.sendMessage(currentTabId, {
            type: 'PROCESS_PROMPT',
            prompt: item.text,
            itemId: item.id,
            timeout: settings.timeout * 1000,
            delay: settings.delay * 1000,
        });
    } catch (err) {
        console.error('Content Scriptへの送信失敗:', err);
        broadcastMessage({
            type: 'PROCESSING_ERROR',
            error: 'Content Scriptとの通信に失敗しました。ページをリロードしてください。',
        });
        isRunning = false;
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }

    updateBadge();
}

function handleItemCompleted(message) {
    // Popupに完了通知
    broadcastMessage({
        type: 'ITEM_COMPLETED',
        itemId: message.itemId,
    });

    currentIndex++;
    updateBadge();

    // 次のアイテムへ（少し待機）
    setTimeout(() => {
        processNextItem();
    }, settings.delay * 1000);
}

function handleItemError(message) {
    // Popupにエラー通知
    broadcastMessage({
        type: 'ITEM_ERROR',
        itemId: message.itemId,
        error: message.error,
    });

    currentIndex++;
    updateBadge();

    // エラーでも次に進む
    setTimeout(() => {
        processNextItem();
    }, settings.delay * 1000);
}

// ===== Utilities =====

function updateBadge() {
    if (!isRunning) return;
    const remaining = processingQueue.length - currentIndex;
    chrome.action.setBadgeText({ text: String(remaining) });
    chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
}

function broadcastMessage(message) {
    // Popupに送信（開いていれば受信される）
    chrome.runtime.sendMessage(message).catch(() => {
        // Popupが閉じている場合はエラーになるが無視
    });
}

// ===== Initialization =====
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
    console.log('Gemini Image Auto Generator installed.');
});
