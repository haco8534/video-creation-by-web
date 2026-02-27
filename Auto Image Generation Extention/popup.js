/**
 * Gemini Image Auto Generator - Popup Script
 * キュー管理、CSV読込、状態管理、Content Scriptとの通信
 */

// ===== DOM References =====
const el = {
  promptInput: document.getElementById('promptInput'),
  addBtn: document.getElementById('addBtn'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  clearBtn: document.getElementById('clearBtn'),
  queueList: document.getElementById('queueList'),
  queueCount: document.getElementById('queueCount'),
  statusIndicator: document.getElementById('statusIndicator'),
  statusText: document.getElementById('statusText'),
  statusCount: document.getElementById('statusCount'),
  progressSection: document.getElementById('progressSection'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  timeoutInput: document.getElementById('timeoutInput'),
  delayInput: document.getElementById('delayInput'),
  lineCount: document.getElementById('lineCount'),
  // Tabs
  tabText: document.getElementById('tabText'),
  tabCsv: document.getElementById('tabCsv'),
  panelText: document.getElementById('panelText'),
  panelCsv: document.getElementById('panelCsv'),
  // CSV
  dropZone: document.getElementById('dropZone'),
  csvFileInput: document.getElementById('csvFileInput'),
  csvColumnSelect: document.getElementById('csvColumnSelect'),
  csvHasHeader: document.getElementById('csvHasHeader'),
  csvPreview: document.getElementById('csvPreview'),
  csvPreviewList: document.getElementById('csvPreviewList'),
  csvPreviewCount: document.getElementById('csvPreviewCount'),
  csvImportBtn: document.getElementById('csvImportBtn'),
};

// ===== State =====
let queue = [];
let csvParsedData = [];
let state = {
  status: 'idle',
  currentIndex: -1,
  totalCount: 0,
  completedCount: 0,
};

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  renderQueue();
  updateUI();
  loadSettings();

  // Core Events
  el.addBtn.addEventListener('click', handleAddPrompts);
  el.startBtn.addEventListener('click', handleStart);
  el.stopBtn.addEventListener('click', handleStop);
  el.clearBtn.addEventListener('click', handleClear);
  el.timeoutInput.addEventListener('change', saveSettings);
  el.delayInput.addEventListener('change', saveSettings);

  // Line count
  el.promptInput.addEventListener('input', updateLineCount);
  updateLineCount();

  // Tab switching
  el.tabText.addEventListener('click', () => switchTab('text'));
  el.tabCsv.addEventListener('click', () => switchTab('csv'));

  // CSV drag & drop
  el.dropZone.addEventListener('click', () => el.csvFileInput.click());
  el.csvFileInput.addEventListener('change', handleFileSelect);
  el.dropZone.addEventListener('dragover', handleDragOver);
  el.dropZone.addEventListener('dragleave', handleDragLeave);
  el.dropZone.addEventListener('drop', handleDrop);
  el.csvImportBtn.addEventListener('click', handleCsvImport);
  el.csvColumnSelect.addEventListener('change', () => { if (csvParsedData.length) renderCsvPreview(); });
  el.csvHasHeader.addEventListener('change', () => { if (csvParsedData.length) renderCsvPreview(); });

  // Ctrl+Enter for quick add
  el.promptInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') handleAddPrompts();
  });

  // Messages from background
  chrome.runtime.onMessage.addListener(handleMessage);
});

// ===== Tab Switching =====
function switchTab(tab) {
  el.tabText.classList.toggle('active', tab === 'text');
  el.tabCsv.classList.toggle('active', tab === 'csv');
  el.panelText.classList.toggle('active', tab === 'text');
  el.panelCsv.classList.toggle('active', tab === 'csv');
}

// ===== Text Input: Add Prompts =====
function handleAddPrompts() {
  const text = el.promptInput.value.trim();
  if (!text) return;

  // 1行 = 1プロンプト（空行は無視）
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return;

  lines.forEach(line => {
    queue.push({
      id: Date.now() + Math.random(),
      text: line,
      status: 'pending',
    });
  });

  el.promptInput.value = '';
  updateLineCount();
  saveQueue();
  renderQueue();
  updateUI();
}

function updateLineCount() {
  const text = el.promptInput.value;
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  el.lineCount.textContent = `${lines.length}行`;
}

// ===== CSV Import =====
function handleDragOver(e) {
  e.preventDefault();
  el.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  el.dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  el.dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    csvParsedData = parseCSV(text);
    renderCsvPreview();
  };
  reader.readAsText(file, 'UTF-8');
}

/**
 * CSVパーサー（ダブルクォート対応）
 */
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const lines = text.split('\n');

  for (const line of lines) {
    if (inQuotes) {
      current += '\n' + line;
    } else {
      current = line;
    }

    // クォートの数をカウント
    const quoteCount = (current.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;

    if (!inQuotes) {
      // 行を解析
      const cols = parseCSVLine(current);
      if (cols.length > 0) rows.push(cols);
      current = '';
    }
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',' || char === '\t') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function renderCsvPreview() {
  if (csvParsedData.length === 0) {
    el.csvPreview.style.display = 'none';
    return;
  }

  const hasHeader = el.csvHasHeader.checked;
  const colIndex = el.csvColumnSelect.value;

  let dataRows = hasHeader ? csvParsedData.slice(1) : csvParsedData;

  // 自動検出: 最も長い文字列がある列を使う
  let targetCol = parseInt(colIndex);
  if (colIndex === 'auto') {
    if (dataRows.length > 0) {
      const colCount = Math.max(...dataRows.map(r => r.length));
      let maxAvgLen = 0;
      targetCol = 0;
      for (let c = 0; c < colCount; c++) {
        const avgLen = dataRows.reduce((sum, row) => sum + (row[c]?.length || 0), 0) / dataRows.length;
        if (avgLen > maxAvgLen) {
          maxAvgLen = avgLen;
          targetCol = c;
        }
      }
    } else {
      targetCol = 0;
    }
  }

  // プロンプトを抽出
  const prompts = dataRows
    .map(row => row[targetCol]?.trim())
    .filter(p => p && p.length > 0);

  el.csvPreview.style.display = 'flex';
  el.csvPreviewCount.textContent = `${prompts.length}件`;

  // プレビュー表示（最大20件）
  const previewItems = prompts.slice(0, 20);
  el.csvPreviewList.innerHTML = previewItems.map((p, i) => `
    <div class="csv-preview-item">
      <span class="csv-preview-item-num">${i + 1}.</span>
      <span class="csv-preview-item-text" title="${escapeHtml(p)}">${escapeHtml(p)}</span>
    </div>
  `).join('');

  if (prompts.length > 20) {
    el.csvPreviewList.innerHTML += `
      <div class="csv-preview-item">
        <span class="csv-preview-item-text" style="color: var(--text-muted);">... 他 ${prompts.length - 20}件</span>
      </div>
    `;
  }

  // データを保存（インポート用）
  el.csvImportBtn._prompts = prompts;
}

function handleCsvImport() {
  const prompts = el.csvImportBtn._prompts;
  if (!prompts || prompts.length === 0) return;

  prompts.forEach(text => {
    queue.push({
      id: Date.now() + Math.random(),
      text: text,
      status: 'pending',
    });
  });

  // リセット
  csvParsedData = [];
  el.csvPreview.style.display = 'none';
  el.csvFileInput.value = '';

  saveQueue();
  renderQueue();
  updateUI();
}

// ===== Queue Management =====
function handleDeleteItem(id) {
  queue = queue.filter(item => item.id !== id);
  saveQueue();
  renderQueue();
  updateUI();
}

function handleClear() {
  if (state.status === 'running') return;
  queue = [];
  state = { status: 'idle', currentIndex: -1, totalCount: 0, completedCount: 0 };
  saveQueue();
  saveState();
  renderQueue();
  updateUI();
}

// ===== Start / Stop =====
async function handleStart() {
  const pendingItems = queue.filter(item => item.status === 'pending');
  if (pendingItems.length === 0) return;

  const tabs = await chrome.tabs.query({ url: 'https://gemini.google.com/*' });
  if (tabs.length === 0) {
    setStatus('error', 'Geminiのタブが見つかりません');
    return;
  }

  state.status = 'running';
  state.totalCount = pendingItems.length;
  state.completedCount = 0;
  state.currentIndex = 0;

  saveState();
  updateUI();

  const settings = getSettings();
  chrome.runtime.sendMessage({
    type: 'START_PROCESSING',
    queue: pendingItems.map(item => ({ id: item.id, text: item.text })),
    tabId: tabs[0].id,
    settings: settings,
  });
}

function handleStop() {
  chrome.runtime.sendMessage({ type: 'STOP_PROCESSING' });
  state.status = 'idle';
  state.currentIndex = -1;
  queue.forEach(item => { if (item.status === 'active') item.status = 'pending'; });
  saveQueue();
  saveState();
  renderQueue();
  updateUI();
}

// ===== Message Handler =====
function handleMessage(message) {
  switch (message.type) {
    case 'ITEM_STARTED':
      queue.forEach(item => { if (item.id === message.itemId) item.status = 'active'; });
      state.currentIndex = message.index;
      break;
    case 'ITEM_COMPLETED':
      queue.forEach(item => { if (item.id === message.itemId) item.status = 'completed'; });
      state.completedCount++;
      break;
    case 'ITEM_ERROR':
      queue.forEach(item => { if (item.id === message.itemId) item.status = 'error'; });
      break;
    case 'ALL_COMPLETED':
      state.status = 'completed';
      state.currentIndex = -1;
      break;
    case 'PROCESSING_ERROR':
      state.status = 'error';
      setStatus('error', message.error || 'エラーが発生しました');
      break;
  }
  saveQueue();
  saveState();
  renderQueue();
  updateUI();
}

// ===== Rendering =====
function renderQueue() {
  const container = el.queueList;
  container.innerHTML = '';

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="queue-empty">
        <div class="empty-icon">📋</div>
        <p>プロンプトが登録されていません</p>
      </div>`;
    el.queueCount.textContent = '0件';
    return;
  }

  el.queueCount.textContent = `${queue.length}件`;

  queue.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = `queue-item ${item.status}`;
    const icon = item.status === 'active' ? '⏳' : item.status === 'completed' ? '✅' : item.status === 'error' ? '❌' : '';
    const canDelete = item.status !== 'active';

    div.innerHTML = `
      <span class="queue-item-number">${index + 1}.</span>
      <span class="queue-item-text">${escapeHtml(item.text)}</span>
      ${icon ? `<span class="queue-item-status">${icon}</span>` : ''}
      ${canDelete ? `<button class="queue-item-delete" data-id="${item.id}" title="削除">✕</button>` : ''}
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('.queue-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => handleDeleteItem(parseFloat(e.currentTarget.dataset.id)));
  });
}

function updateUI() {
  const isRunning = state.status === 'running';
  const hasPending = queue.some(item => item.status === 'pending');

  el.startBtn.disabled = !hasPending || isRunning;
  el.startBtn.style.display = isRunning ? 'none' : 'flex';
  el.stopBtn.style.display = isRunning ? 'flex' : 'none';
  el.clearBtn.disabled = isRunning;
  el.addBtn.disabled = isRunning;
  el.promptInput.disabled = isRunning;

  const indicator = el.statusIndicator;
  indicator.className = 'status-indicator';

  switch (state.status) {
    case 'idle':
      indicator.classList.add('idle');
      setStatus('idle', '待機中');
      break;
    case 'running':
      indicator.classList.add('running');
      setStatus('running', `処理中... (${state.completedCount + 1}/${state.totalCount})`);
      break;
    case 'completed':
      indicator.classList.add('completed');
      setStatus('completed', `完了！ ${state.completedCount}件処理`);
      break;
    case 'error':
      indicator.classList.add('error');
      break;
  }

  if (state.status === 'running' || state.status === 'completed') {
    el.progressSection.style.display = 'flex';
    const pct = state.totalCount > 0 ? (state.completedCount / state.totalCount) * 100 : 0;
    el.progressFill.style.width = `${pct}%`;
    el.progressText.textContent = `${state.completedCount} / ${state.totalCount}`;
  } else {
    el.progressSection.style.display = 'none';
  }
}

function setStatus(type, text) {
  el.statusText.textContent = text;
  el.statusIndicator.className = `status-indicator ${type}`;
}

// ===== Persistence =====
async function saveQueue() { await chrome.storage.local.set({ queue }); }
async function saveState() { await chrome.storage.local.set({ processingState: state }); }

async function loadState() {
  const data = await chrome.storage.local.get(['queue', 'processingState']);
  if (data.queue) queue = data.queue;
  if (data.processingState) {
    state = data.processingState;
    if (state.status === 'running') {
      try {
        const resp = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
        if (!resp || resp.status !== 'running') {
          state.status = 'idle';
          queue.forEach(item => { if (item.status === 'active') item.status = 'pending'; });
        }
      } catch {
        state.status = 'idle';
        queue.forEach(item => { if (item.status === 'active') item.status = 'pending'; });
      }
    }
  }
}

function getSettings() {
  return {
    timeout: parseInt(el.timeoutInput.value) || 300,
    delay: parseInt(el.delayInput.value) || 3,
  };
}
function saveSettings() { chrome.storage.local.set({ settings: getSettings() }); }
async function loadSettings() {
  const data = await chrome.storage.local.get(['settings']);
  if (data.settings) {
    el.timeoutInput.value = data.settings.timeout || 300;
    el.delayInput.value = data.settings.delay || 3;
  }
}

// ===== Util =====
function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
