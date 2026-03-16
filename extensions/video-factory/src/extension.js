// Video Factory — VSCode Extension Entry Point

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { CdpClient } = require('./cdp/CdpClient');
const { QueueManager } = require('./queue/QueueManager');
const { VideoFactoryEngine, STATES } = require('./engine/VideoFactoryEngine');

let engine = null;
let statusBarItem = null;
let outputChannel = null;

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  if (outputChannel) {
    outputChannel.appendLine(`${ts} ${msg}`);
  }
}

function notify(msg) {
  vscode.window.showInformationMessage(`🏭 ${msg}`);
}

function getConfig() {
  const cfg = vscode.workspace.getConfiguration('videoFactory');
  return {
    cdpPort: cfg.get('cdpPort', 9000),
    quotaThresholdPercent: cfg.get('quotaThresholdPercent', 20),
    rateLimitCooldownMinutes: cfg.get('rateLimitCooldownMinutes', 300),
    maxRetries: cfg.get('maxRetries', 2),
    workflowCommand: cfg.get('workflowCommand', '/create-video-full'),
    pollIntervalMs: cfg.get('pollIntervalMs', 10000),
    timeoutMinutes: cfg.get('timeoutMinutes', 90),
  };
}

function getQueueFilePath() {
  const cfg = vscode.workspace.getConfiguration('videoFactory');
  const custom = cfg.get('queueFile', '');

  if (custom) return custom;

  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return path.join(folders[0].uri.fsPath, 'themes_queue.json');
  }

  return path.join(require('os').homedir(), 'themes_queue.json');
}

/**
 * themes/ 配下のサブフォルダ内にある themes_queue.json を検索し、
 * まだワークスペースのキューに取り込まれていないテーマを自動マージする。
 */
function autoImportFromThemeProposals() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return;

  const wsRoot = folders[0].uri.fsPath;
  const themeDir = path.join(wsRoot, 'themes');
  if (!fs.existsSync(themeDir)) return;

  // themes/ 配下のサブフォルダから themes_queue.json を探す
  const sourceFiles = [];
  try {
    const entries = fs.readdirSync(themeDir);
    for (const entry of entries) {
      const entryPath = path.join(themeDir, entry);
      if (!fs.statSync(entryPath).isDirectory()) continue;
      
      const queueFile = path.join(entryPath, 'themes_queue.json');
      if (fs.existsSync(queueFile)) {
        sourceFiles.push(queueFile);
      }
    }

    // ルート直下の themes_queue.json もチェック
    const rootQueue = path.join(themeDir, 'themes_queue.json');
    if (fs.existsSync(rootQueue)) {
      sourceFiles.push(rootQueue);
    }
  } catch (e) {
    log(`[AutoImport] Error scanning themes: ${e.message}`);
    return;
  }

  if (sourceFiles.length === 0) return;

  const queuePath = getQueueFilePath();
  const queue = new QueueManager({ filePath: queuePath, log });
  queue.ensureFile();

  let totalAdded = 0;
  for (const sourceFile of sourceFiles) {
    try {
      const raw = fs.readFileSync(sourceFile, 'utf-8');
      const data = JSON.parse(raw);

      if (!data.themes || !Array.isArray(data.themes)) continue;

      for (const theme of data.themes) {
        if (!theme.title) continue;
        const opts = {};
        if (theme.status === 'done') {
          opts.status = 'done';
          opts.completedAt = theme.completedAt;
        }
        if (queue.addTheme(theme.title, opts)) {
          totalAdded++;
        }
      }
    } catch (e) {
      log(`[AutoImport] Error reading ${sourceFile}: ${e.message}`);
    }
  }

  if (totalAdded > 0) {
    log(`[AutoImport] ${totalAdded} themes imported from ${sourceFiles.length} source(s)`);

    // 完成品フォルダとも同期
    const completedDir = path.join(wsRoot, '完成品');
    const synced = queue.syncWithCompletedFolder(completedDir);
    if (synced > 0) log(`[AutoImport] Synced ${synced} themes as done`);
  }
}

// ─── ステータスバー ──────────────────────────────────────────

function updateStatusBar(state, theme) {
  if (!statusBarItem) return;

  const isRunning = engine && engine.isRunning;

  if (isRunning) {
    const stateLabels = {
      [STATES.QUOTA_CHECK]: '$(sync~spin) Quota Check',
      [STATES.QUOTA_LOW]: '$(warning) Quota Low',
      [STATES.STARTING_CHAT]: '$(sync~spin) New Chat',
      [STATES.SENDING_THEME]: '$(sync~spin) Sending',
      [STATES.PROCESSING]: '$(sync~spin) Processing',
      [STATES.COMPLETED]: '$(check) Done!',
      [STATES.RATE_LIMITED]: '$(clock) Rate Limit',
      [STATES.WAITING_HUMAN]: '$(alert) ⚠️ Human',
      [STATES.ALL_DONE]: '$(check-all) All Done!',
      [STATES.STOPPED]: '$(debug-stop) Stopped',
    };
    statusBarItem.text = stateLabels[state] || `$(sync~spin) ${state}`;
    statusBarItem.command = 'videoFactory.toggle';  // クリックで停止
  } else {
    statusBarItem.text = '$(play) Factory';
    statusBarItem.command = 'videoFactory.toggle';  // クリックで開始
  }

  // ツールチップ
  const action = isRunning ? 'クリックで停止' : 'クリックで開始';
  const themeInfo = theme ? `\nTheme: ${theme.title}` : '';
  statusBarItem.tooltip = `Video Factory: ${state || 'Idle'}${themeInfo}\n${action}`;

  // 色分け
  if (state === STATES.PROCESSING || state === STATES.STARTING_CHAT || state === STATES.SENDING_THEME) {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else if (state === STATES.WAITING_HUMAN || state === STATES.QUOTA_LOW) {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else {
    statusBarItem.backgroundColor = undefined;
  }
}

// ─── コマンド ────────────────────────────────────────────────

async function toggleFactory() {
  if (engine && engine.isRunning) {
    stopFactory();
  } else {
    await startFactory();
  }
}

async function startFactory() {
  if (engine && engine.isRunning) {
    vscode.window.showWarningMessage('Video Factory はすでに実行中です');
    return;
  }

  const config = getConfig();
  const queuePath = getQueueFilePath();

  log(`[Main] Config: port=${config.cdpPort}, queue=${queuePath}`);

  // ワークスペース名を取得（CDPターゲット選択に使用）
  const wsFolders = vscode.workspace.workspaceFolders;
  const workspaceName = wsFolders && wsFolders.length > 0
    ? path.basename(wsFolders[0].uri.fsPath)
    : '';

  log(`[Main] Workspace: "${workspaceName}"`);

  const cdp = new CdpClient({ port: config.cdpPort, log, workspaceName });
  const queue = new QueueManager({ filePath: queuePath, log });

  queue.ensureFile();

  // 完成品フォルダと同期
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    const completedDir = path.join(folders[0].uri.fsPath, '完成品');
    const synced = queue.syncWithCompletedFolder(completedDir);
    if (synced > 0) log(`[Main] Synced ${synced} themes as done`);
  }

  const stats = queue.getStats();
  log(`[Main] ${queue.getSummaryText()}`);

  if (stats.pending === 0) {
    const action = await vscode.window.showWarningMessage(
      'キューにpendingテーマがありません。',
      'テーマをインポート',
      'テーマを追加',
      'キャンセル'
    );
    if (action === 'テーマをインポート') {
      await importThemes();
    } else if (action === 'テーマを追加') {
      await addTheme();
    }
    return;
  }

  engine = new VideoFactoryEngine({
    cdp, queue, config, log, notify,
    onStateChange: updateStatusBar,
  });

  outputChannel.show(true);
  updateStatusBar(STATES.IDLE, null);
  engine.start(); // awaitしない（バックグラウンドで実行）
}

function stopFactory() {
  if (engine && engine.isRunning) {
    engine.stop();
    log('[Main] Stop requested');
    notify('Video Factory を停止しました');
    updateStatusBar(STATES.STOPPED, null);
  } else {
    vscode.window.showInformationMessage('Video Factory は実行されていません');
  }
}

async function showQueue() {
  const queuePath = getQueueFilePath();
  const queue = new QueueManager({ filePath: queuePath, log });
  queue.ensureFile();

  const data = queue.load();
  if (!data) {
    vscode.window.showErrorMessage('キューファイルの読み込みに失敗しました');
    return;
  }

  // クイックピックで表示
  const items = data.themes.map(t => {
    const icon = { pending: '⏳', in_progress: '🔄', done: '✅', failed: '❌' }[t.status] || '❓';
    return {
      label: `${icon} ${t.title}`,
      description: t.status,
      detail: t.completedAt ? `Completed: ${t.completedAt}` : (t.startedAt ? `Started: ${t.startedAt}` : ''),
    };
  });

  const stats = queue.getStats();
  items.unshift({
    label: `📊 Total: ${stats.total} | Done: ${stats.done} | Pending: ${stats.pending} | Failed: ${stats.failed}`,
    description: '',
    detail: `Queue file: ${queuePath}`,
  });

  const selected = await vscode.window.showQuickPick(items, {
    title: 'Video Factory Queue',
    placeHolder: 'テーマ一覧（テーマを選択して操作）',
  });

  // テーマ選択時のアクション
  if (selected && selected.description) {
    const themeTitle = selected.label.substring(2); // アイコン分を除去
    const actions = ['Done に変更', 'Pending に戻す', 'Failed に変更', 'キューファイルを開く'];
    const action = await vscode.window.showQuickPick(actions, {
      title: `${themeTitle}`,
      placeHolder: '操作を選択',
    });

    if (action === 'キューファイルを開く') {
      const doc = await vscode.workspace.openTextDocument(queuePath);
      await vscode.window.showTextDocument(doc);
    } else if (action) {
      const statusMap = { 'Done に変更': 'done', 'Pending に戻す': 'pending', 'Failed に変更': 'failed' };
      const newStatus = statusMap[action];
      if (newStatus) {
        const theme = data.themes.find(t => t.title === themeTitle.trim());
        if (theme) {
          queue.updateStatus(theme.id, newStatus);
          vscode.window.showInformationMessage(`${themeTitle} → ${newStatus}`);
        }
      }
    }
  }
}

async function addTheme() {
  const title = await vscode.window.showInputBox({
    prompt: '追加するテーマのタイトルを入力してください',
    placeHolder: '例: コンコルドの誤り',
  });

  if (!title) return;

  const queuePath = getQueueFilePath();
  const queue = new QueueManager({ filePath: queuePath, log });
  queue.ensureFile();

  const added = queue.addTheme(title);
  if (added) {
    vscode.window.showInformationMessage(`🎬 テーマを追加しました: ${title}`);
    log(`[Main] Theme added: ${title}`);
  } else {
    vscode.window.showWarningMessage(`このテーマはすでにキューに存在します: ${title}`);
  }
}

// ─── themesインポート ──────────────────────────────────────

async function importThemes() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showErrorMessage('ワークスペースが開かれていません');
    return;
  }

  const wsRoot = folders[0].uri.fsPath;

  // themesファイルを探す
  const themeMdPath = path.join(wsRoot, 'themes', 'theme_proposals.md');
  if (!fs.existsSync(themeMdPath)) {
    vscode.window.showErrorMessage(`themesファイルが見つかりません: ${themeMdPath}`);
    return;
  }

  const content = fs.readFileSync(themeMdPath, 'utf-8');

  // 推薦テーマ（🏆推薦）を抽出
  const themes = parseThemeProposals(content);

  if (themes.length === 0) {
    vscode.window.showWarningMessage('themesファイルからテーマを抽出できませんでした');
    return;
  }

  // ユーザーにインポートするテーマを選択させる
  const items = themes.map(t => ({
    label: t.title,
    description: t.recommended ? '🏆推薦' : '',
    detail: t.oneLiner || '',
    picked: t.recommended,  // 推薦テーマはデフォルト選択
  }));

  const selected = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    title: 'インポートするテーマを選択',
    placeHolder: `${themes.length}件のテーマが見つかりました。推薦テーマはデフォルトで選択済みです。`,
  });

  if (!selected || selected.length === 0) return;

  // キューに追加
  const queuePath = getQueueFilePath();
  const queue = new QueueManager({ filePath: queuePath, log });
  queue.ensureFile();

  let addedCount = 0;
  for (const item of selected) {
    if (queue.addTheme(item.label)) {
      addedCount++;
    }
  }

  // 完成品フォルダと同期（既に完成済みのテーマを done に）
  const completedDir = path.join(wsRoot, '完成品');
  const synced = queue.syncWithCompletedFolder(completedDir);

  const syncMsg = synced > 0 ? `\n（${synced}件は完成品フォルダと照合してdone済み）` : '';
  vscode.window.showInformationMessage(
    `🎬 ${addedCount}件のテーマをキューに追加しました（${selected.length - addedCount}件は重複スキップ）${syncMsg}`
  );
  log(`[Main] Imported ${addedCount} themes, synced ${synced} as done`);
}

/**
 * theme_proposals.md からテーマ一覧を抽出する
 * テーブル行: | # | テーマ名 | 視点タイプ | 一行説明 |
 * 推薦判定: 🏆推薦 が同行にある
 */
function parseThemeProposals(content) {
  const themes = [];
  const lines = content.split('\n');

  // テーブル行を解析（テーマ一覧テーブル）
  for (const line of lines) {
    // | 1 | 自由意志は... | 通説崩壊 | ... | の形式
    const tableMatch = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (tableMatch) {
      const [, num, title, category, oneLiner] = tableMatch;
      if (num === '#') continue; // ヘッダー行

      themes.push({
        num: parseInt(num),
        title: title.trim(),
        category: category.trim(),
        oneLiner: oneLiner.trim(),
        recommended: false,
      });
    }
  }

  // スコアリングテーブルから推薦テーマを特定
  for (const line of lines) {
    if (line.includes('🏆推薦')) {
      // | 1 | 自由意志は存在するか | 5 | 4 | 5 | 5 | 5 | 24 | 🏆推薦 |
      const match = line.match(/^\|\s*(\d+)\s*\|/);
      if (match) {
        const num = parseInt(match[1]);
        const theme = themes.find(t => t.num === num);
        if (theme) {
          theme.recommended = true;
        }
      }
    }
  }

  return themes;
}

// ─── キューファイルを開く ────────────────────────────────────

async function openQueueFile() {
  const queuePath = getQueueFilePath();
  const queue = new QueueManager({ filePath: queuePath, log });
  queue.ensureFile();

  const doc = await vscode.workspace.openTextDocument(queuePath);
  await vscode.window.showTextDocument(doc);
}

// ─── Activation / Deactivation ───────────────────────────────

function activate(context) {
  outputChannel = vscode.window.createOutputChannel('Video Factory');

  // ステータスバー（右下、クリックでトグル）
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
  statusBarItem.text = '$(play) Factory';
  statusBarItem.tooltip = 'Video Factory: Idle\nクリックで開始';
  statusBarItem.command = 'videoFactory.toggle';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // コマンド登録
  context.subscriptions.push(
    vscode.commands.registerCommand('videoFactory.toggle', toggleFactory),
    vscode.commands.registerCommand('videoFactory.start', startFactory),
    vscode.commands.registerCommand('videoFactory.stop', stopFactory),
    vscode.commands.registerCommand('videoFactory.showQueue', showQueue),
    vscode.commands.registerCommand('videoFactory.addTheme', addTheme),
    vscode.commands.registerCommand('videoFactory.importThemes', importThemes),
    vscode.commands.registerCommand('videoFactory.openQueueFile', openQueueFile),
    outputChannel,
  );

  log('[Main] Video Factory extension activated');

  // themes/ からの自動インポート
  try {
    autoImportFromThemeProposals();
  } catch (e) {
    log(`[Main] AutoImport error: ${e.message}`);
  }
}

function deactivate() {
  if (engine && engine.isRunning) {
    engine.stop();
  }
}

module.exports = { activate, deactivate };
