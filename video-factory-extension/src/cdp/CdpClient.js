// Video Factory — CDP Client
// Chromium DevTools Protocol を使ってAntigravityのメインウィンドウに接続する
//
// 重要な発見 (2026-03-16):
// Antigravityのチャット UI (.antigravity-agent-side-panel) は
// メインドキュメントに直接レンダリングされている。
// iframe 内の webview ではないため、メインページのターゲットに接続する。

const http = require('http');
const WebSocket = require('ws');

class CdpClient {
  constructor({ port, log, workspaceName }) {
    this.port = port;
    this.log = log;
    this.workspaceName = workspaceName || '';
    this.ws = null;
    this.targetId = null;
    this._msgId = 0;
    this._pendingCalls = new Map();
    this._connected = false;
  }

  get isConnected() {
    return this._connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // ─── ターゲット探索 ─────────────────────────────────────────

  async discoverTargets() {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${this.port}/json`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            resolve(targets);
          } catch (e) {
            reject(new Error(`Failed to parse targets: ${e.message}`));
          }
        });
      });
      req.on('error', (e) => reject(new Error(`CDP port ${this.port} not reachable: ${e.message}`)));
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error(`CDP port ${this.port} timeout`));
      });
    });
  }

  /**
   * メインウィンドウのターゲットを探す
   *
   * チャットUIはメインドキュメントに直接レンダリングされているため、
   * iframe ではなく type: "page" のメインウィンドウに接続する。
   */
  findMainWindow(targets) {
    const pageTargets = targets.filter(t => t.type === 'page' && t.title);

    // 最優先: ワークスペース名が指定されている場合はそれに一致するもの
    // Antigravityのタイトルは「{ワークスペース名} - Antigravity - ...」の形式
    if (this.workspaceName) {
      const exactMatch = pageTargets.find(t =>
        t.title.includes('Antigravity') && t.title.includes(this.workspaceName)
      );
      if (exactMatch) {
        this.log(`[CDP] Found workspace match: "${exactMatch.title.substring(0, 50)}"`);
        return exactMatch;
      }
      this.log(`[CDP] ⚠️ No page matching workspace "${this.workspaceName}", trying all Antigravity targets`);
    }

    // フォールバック: Antigravity の page ターゲット
    const mainPage = pageTargets.find(t => t.title.includes('Antigravity'));
    if (mainPage) {
      this.log(`[CDP] Found main window: "${mainPage.title.substring(0, 50)}"`);
      return mainPage;
    }

    // フォールバック: vscode-file:// のページ
    const vscodePage = targets.find(t =>
      t.type === 'page' && t.url && t.url.startsWith('vscode-file://')
    );
    if (vscodePage) {
      this.log(`[CDP] Found main window (vscode-file): "${(vscodePage.title || '').substring(0, 50)}"`);
      return vscodePage;
    }

    // フォールバック: type: "page" の最初のターゲット
    const anyPage = targets.find(t => t.type === 'page');
    if (anyPage) {
      this.log(`[CDP] Fallback: first page target: "${(anyPage.title || 'untitled').substring(0, 50)}"`);
      return anyPage;
    }

    this.log(`[CDP] Available targets: ${targets.map(t => `${t.type}:${(t.title || 'untitled').substring(0, 30)}`).join(', ')}`);
    return null;
  }

  // 旧API互換のため残す
  findAgentPanel(targets) {
    return this.findMainWindow(targets);
  }

  // ─── WebSocket接続 ──────────────────────────────────────────

  async connect() {
    const targets = await this.discoverTargets();
    const target = this.findMainWindow(targets);

    if (!target) {
      throw new Error('Main window not found. Is Antigravity running with --remote-debugging-port?');
    }

    this.targetId = target.id;
    const wsUrl = target.webSocketDebuggerUrl;

    if (!wsUrl) {
      throw new Error(`No webSocketDebuggerUrl for target ${target.id}`);
    }

    this.log(`[CDP] Connecting to ${wsUrl.substring(0, 60)}...`);

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        this._connected = true;
        this.log(`[CDP] Connected to target ${target.id.substring(0, 8)}`);
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id && this._pendingCalls.has(msg.id)) {
            const { resolve, reject, timer } = this._pendingCalls.get(msg.id);
            this._pendingCalls.delete(msg.id);
            clearTimeout(timer);
            if (msg.error) {
              reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            } else {
              resolve(msg.result);
            }
          }
        } catch (e) {
          this.log(`[CDP] Parse error: ${e.message}`);
        }
      });

      this.ws.on('close', () => {
        this._connected = false;
        this.log('[CDP] Connection closed');
        // 全pending呼び出しをreject
        for (const [id, handler] of this._pendingCalls) {
          clearTimeout(handler.timer);
          handler.reject(new Error('Connection closed'));
        }
        this._pendingCalls.clear();
      });

      this.ws.on('error', (e) => {
        this.log(`[CDP] WebSocket error: ${e.message}`);
      });
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
  }

  // ─── Runtime.evaluate ──────────────────────────────────────

  async evaluate(expression, timeout = 10000) {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }

    const id = ++this._msgId;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pendingCalls.delete(id);
        reject(new Error(`evaluate timeout (id=${id})`));
      }, timeout);

      this._pendingCalls.set(id, { resolve, reject, timer });

      this.ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression,
          returnByValue: true,
          awaitPromise: false,
        }
      }));
    }).then(result => {
      if (result && result.result) {
        return result.result.value;
      }
      return undefined;
    });
  }

  // ─── 任意のCDPメソッド呼び出し ─────────────────────────────

  async cdpCall(method, params = {}, timeout = 10000) {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }

    const id = ++this._msgId;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pendingCalls.delete(id);
        reject(new Error(`cdpCall timeout (${method}, id=${id})`));
      }, timeout);

      this._pendingCalls.set(id, { resolve, reject, timer });

      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // ─── CDP Input.insertText ──────────────────────────────────
  // E2Eテスト (2026-03-16) で唯一確実にLexicalエディタに
  // テキストを注入できることが確認された方法

  async insertText(text) {
    return this.cdpCall('Input.insertText', { text });
  }

  // ─── 接続状態の検証 ────────────────────────────────────────

  async ping() {
    try {
      const result = await this.evaluate(`'pong'`, 3000);
      return result === 'pong';
    } catch {
      return false;
    }
  }

  // ─── エージェントパネルの存在確認 ──────────────────────────

  async checkAgentPanel() {
    try {
      const result = await this.evaluate(`(function() {
        var panel = document.querySelector('.antigravity-agent-side-panel');
        var input = document.querySelector('#antigravity\\\\.agentSidePanelInputBox div[contenteditable="true"]');
        return JSON.stringify({
          panelExists: !!panel,
          inputExists: !!input,
          panelVisible: panel ? panel.style.display !== 'none' : false
        });
      })()`, 5000);
      return JSON.parse(result || '{}');
    } catch {
      return { panelExists: false, inputExists: false, panelVisible: false };
    }
  }

  // ─── 再接続 ────────────────────────────────────────────────

  async reconnect() {
    this.disconnect();
    await this.connect();
  }
}

module.exports = { CdpClient };
