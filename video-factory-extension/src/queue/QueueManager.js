// Video Factory — Queue Manager
// themes_queue.json の読み書き

const fs = require('fs');
const path = require('path');

class QueueManager {
  constructor({ filePath, log }) {
    this.filePath = filePath;
    this.log = log;
    this._data = null;
  }

  // ─── 初期化 ────────────────────────────────────────────────

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      const initial = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        settings: {
          quotaThresholdPercent: 20,
          rateLimitCooldownMinutes: 300,
          maxRetries: 2,
        },
        themes: []
      };
      fs.writeFileSync(this.filePath, JSON.stringify(initial, null, 2), 'utf-8');
      this.log(`[Queue] Created ${this.filePath}`);
    }
  }

  // ─── 読み込み ──────────────────────────────────────────────

  load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      this._data = JSON.parse(raw);
      return this._data;
    } catch (e) {
      this.log(`[Queue] Load error: ${e.message}`);
      return null;
    }
  }

  save() {
    if (!this._data) return;
    this._data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.filePath, JSON.stringify(this._data, null, 2), 'utf-8');
  }

  get settings() {
    if (!this._data) this.load();
    return this._data?.settings || {};
  }

  get themes() {
    if (!this._data) this.load();
    return this._data?.themes || [];
  }

  // ─── テーマ操作 ────────────────────────────────────────────

  getNextPending() {
    this.load();
    return this.themes.find(t => t.status === 'pending') || null;
  }

  updateStatus(themeId, status) {
    this.load();
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) return;

    theme.status = status;

    if (status === 'in_progress') {
      theme.startedAt = new Date().toISOString();
    }
    if (status === 'done') {
      theme.completedAt = new Date().toISOString();
    }
    if (status === 'pending' && theme.retryCount !== undefined) {
      theme.retryCount = (theme.retryCount || 0) + 1;
    }

    this.save();
    this.log(`[Queue] ${theme.title} → ${status}`);
  }

  addTheme(title, { status = 'pending', completedAt = null } = {}) {
    this.load();
    const id = title.replace(/[^\w]/g, '_').toLowerCase().substring(0, 50);

    // 重複チェック
    if (this.themes.some(t => t.title === title)) {
      this.log(`[Queue] Already exists: ${title}`);
      return false;
    }

    this._data.themes.push({
      id,
      title,
      status,
      startedAt: status === 'done' ? (completedAt || new Date().toISOString()) : null,
      completedAt: status === 'done' ? (completedAt || new Date().toISOString()) : null,
      retryCount: 0,
    });

    this.save();
    this.log(`[Queue] Added: ${title} (${status})`);
    return true;
  }

  /**
   * 完成品フォルダと照合して、既に完成しているテーマを done に更新
   * @param {string} completedDir - 完成品フォルダのパス
   * @returns {number} 更新したテーマ数
   */
  syncWithCompletedFolder(completedDir) {
    if (!fs.existsSync(completedDir)) return 0;

    this.load();
    const completedFolders = fs.readdirSync(completedDir)
      .filter(name => {
        const fullPath = path.join(completedDir, name);
        return fs.statSync(fullPath).isDirectory() && name !== '投稿済み';
      });

    let updated = 0;
    for (const theme of this.themes) {
      if (theme.status === 'done') continue;

      // テーマタイトルが完成品フォルダ名に含まれるか、逆も確認
      const match = completedFolders.find(folder =>
        folder.includes(theme.title) || theme.title.includes(folder)
      );

      if (match) {
        theme.status = 'done';
        theme.completedAt = theme.completedAt || new Date().toISOString();
        updated++;
        this.log(`[Queue] Synced as done: ${theme.title} (matched: ${match})`);
      }
    }

    if (updated > 0) this.save();
    return updated;
  }

  // ─── 統計 ──────────────────────────────────────────────────

  getStats() {
    this.load();
    const themes = this.themes;
    return {
      total: themes.length,
      pending: themes.filter(t => t.status === 'pending').length,
      inProgress: themes.filter(t => t.status === 'in_progress').length,
      done: themes.filter(t => t.status === 'done').length,
      failed: themes.filter(t => t.status === 'failed').length,
    };
  }

  getSummaryText() {
    const s = this.getStats();
    return `📊 Queue: ${s.done}/${s.total} done | ${s.pending} pending | ${s.failed} failed`;
  }
}

module.exports = { QueueManager };
