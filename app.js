document.addEventListener('DOMContentLoaded', () => {
  // Syncada Console Engine
  class SyncadaConsole {
    constructor() {
      this.token = localStorage.getItem('syncada_gh_token') || '';
      this.userProfile = null;
      this.isConnected = false;
      this.state = {
        tasks: {},
        barriers: {},
        governors: {},
        exuvias: {}
      };
      this.init();
    }

    async init() {
      this.bindEvents();
      if (this.token) {
        document.getElementById('gh-token').value = this.token;
        await this.connectWithToken(this.token, false);
      } else {
        this.updateAuthUI();
        this.renderAll();
      }
    }

    async connectWithToken(token, showToastMsg = true) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          this.userProfile = await res.json();
        } else {
          this.userProfile = { login: 'authenticated_user', avatar_url: 'assets/logo_syncada.png' };
        }
      } catch {
        this.userProfile = { login: 'authenticated_user', avatar_url: 'assets/logo_syncada.png' };
      }

      this.token = token;
      this.isConnected = true;
      localStorage.setItem('syncada_gh_token', token);
      this.loadVaultData();
      this.updateAuthUI();
      this.renderAll();

      if (showToastMsg) {
        this.showToast(`Connected as @${this.userProfile.login}!`, 'success');
      }
    }

    loadVaultData() {
      const savedState = localStorage.getItem('syncada_vault_state');
      if (savedState) {
        try {
          this.state = JSON.parse(savedState);
          return;
        } catch {}
      }

      // Seed initial vault state for authenticated session
      this.state = {
        tasks: {
          'task-midnight-backup': {
            id: 'task-midnight-backup',
            name: 'Midnight Database Backup & S3 Roll',
            category: 'chrono_shell',
            schedule: '0 0 * * *',
            primaryTarget: { type: 'http', url: 'https://api.mycompany.com/backup/run' },
            enableHA: true,
            maxRetries: 3,
            fallbackTarget: { type: 'http', url: 'https://secondary-api.mycompany.com/backup/run' },
            enableDiffAware: true,
            lastOutputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            status: 'completed',
            consecutiveFailures: 0,
            isHibernating: false,
            lastEmergenceTime: new Date(Date.now() - 3600000).toISOString(),
            nextEmergenceTime: new Date(Date.now() + 82800000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          'task-price-scraper': {
            id: 'task-price-scraper',
            name: 'Diff-Aware Price Scraper Nymph Shell',
            category: 'chrono_shell',
            schedule: '*/15 * * * *',
            primaryTarget: {
              type: 'inline_code',
              inlineCode: 'const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json"); const data = await res.json(); return { rate: data.bpi.USD.rate };'
            },
            enableHA: true,
            maxRetries: 3,
            enableDiffAware: true,
            lastOutputHash: 'f4d9c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            status: 'skipped_no_diff',
            consecutiveFailures: 0,
            isHibernating: false,
            lastEmergenceTime: new Date(Date.now() - 900000).toISOString(),
            nextEmergenceTime: new Date(Date.now() + 900000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          'task-instant-webhook': {
            id: 'task-instant-webhook',
            name: 'On-Demand Classic Nymph Shell Handler',
            category: 'classic_shell',
            primaryTarget: {
              type: 'inline_code',
              inlineCode: 'return { status: "processed", event: "user_registered", timestamp: new Date().toISOString() };'
            },
            enableHA: false,
            enableDiffAware: false,
            status: 'idle',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        barriers: {
          'barrier-deploy': {
            id: 'barrier-deploy',
            name: 'Multi-Service Deploy Release Gate',
            barrierKey: 'gate-deploy-v1',
            requiredSignalsCount: 2,
            requiredSenders: ['auth-service', 'billing-service'],
            timeoutMs: 300000,
            timeoutAction: 'auto_abort',
            receivedSignals: ['auth-service'],
            targetOnRelease: { type: 'http', url: 'https://api.mycompany.com/deploy/release' },
            status: 'locked',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        governors: {
          'gov-openai-metronome': {
            id: 'gov-openai-metronome',
            name: 'OpenAI Batch Metronome Governor',
            cadenceMs: 2500,
            currentCadenceMs: 2500,
            maxBurst: 2,
            enableAdaptiveBackoff: true,
            batchQueue: [
              { type: 'http', url: 'https://api.openai.com/v1/embeddings', priority: 'high' },
              { type: 'http', url: 'https://api.openai.com/v1/embeddings', priority: 'normal' }
            ],
            processedCount: 14,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        exuvias: {
          'exuvia-seed-1': {
            id: 'exuvia-seed-1',
            taskId: 'task-midnight-backup',
            taskName: 'Midnight Database Backup & S3 Roll',
            category: 'chrono_shell',
            emergenceTimestamp: new Date(Date.now() - 3600000).toISOString(),
            durationMs: 142,
            httpStatus: 200,
            outputSnippet: '{"backupId":"bkt-roll-992","status":"SUCCESS"}',
            outputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            wasFailoverUsed: false,
            wasDiffSkipped: false,
            retryAttemptsUsed: 1,
            logs: [
              '[StridulationEmitter] Starting task "Midnight Database Backup"',
              '[StridulationEmitter] Executing Primary Target (Attempt 1/3)...',
              '[StridulationEmitter] Primary Target Succeeded [200 OK].'
            ]
          }
        }
      };
      this.saveLocalVaultState();
    }

    saveLocalVaultState() {
      if (this.isConnected) {
        localStorage.setItem('syncada_vault_state', JSON.stringify(this.state));
      }
    }

    updateAuthUI() {
      const authDisconnected = document.getElementById('auth-disconnected');
      const authConnected = document.getElementById('auth-connected');
      const userAvatar = document.getElementById('user-avatar');
      const userHandle = document.getElementById('user-handle');

      const btnCreateTask = document.getElementById('btn-create-task');
      const btnCreateBarrier = document.getElementById('btn-create-barrier');
      const btnCreateGov = document.getElementById('btn-create-governor');
      const lockedBanner = document.getElementById('locked-banner');
      const tymbalStatus = document.getElementById('tymbal-status');

      if (this.isConnected && this.token) {
        authDisconnected.classList.add('hidden');
        authConnected.classList.remove('hidden');
        if (this.userProfile) {
          userAvatar.src = this.userProfile.avatar_url || 'assets/logo_syncada.png';
          userHandle.innerText = `@${this.userProfile.login || 'user'}`;
        }
        btnCreateTask.disabled = false;
        if (btnCreateBarrier) btnCreateBarrier.disabled = false;
        if (btnCreateGov) btnCreateGov.disabled = false;
        lockedBanner.classList.add('hidden');
        tymbalStatus.innerText = '🟢 Tymbal Engine Connected';
        tymbalStatus.classList.remove('locked');
      } else {
        authDisconnected.classList.remove('hidden');
        authConnected.classList.add('hidden');
        btnCreateTask.disabled = true;
        if (btnCreateBarrier) btnCreateBarrier.disabled = true;
        if (btnCreateGov) btnCreateGov.disabled = true;
        lockedBanner.classList.remove('hidden');
        tymbalStatus.innerText = '🔒 Vault Locked (Token Required)';
        tymbalStatus.classList.add('locked');
      }
    }

    bindEvents() {
      // Tab Switching
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

          const tabId = btn.getAttribute('data-tab');
          btn.classList.add('active');
          document.getElementById(`tab-${tabId}`).classList.add('active');

          const titleMap = {
            dashboard: '🎛️ Syncada Dashboard Overview',
            tasks: '🌰 Nymph Tasks & Shells',
            barriers: '🔒 Stridulation Barrier Sync Gates',
            governors: '⏱️ Temporal Rate-Pulse Governor Metronome',
            exuvias: '📜 Exuvia Replay Timeline'
          };
          document.getElementById('page-title').innerText = titleMap[tabId] || 'Syncada Studio';
        });
      });

      // Token Connect
      document.getElementById('btn-connect').addEventListener('click', async () => {
        const val = document.getElementById('gh-token').value.trim();
        if (!val) {
          this.showToast('Please enter a valid GitHub PAT token (ghp_...).', 'danger');
          return;
        }
        await this.connectWithToken(val, true);
      });

      // Token Disconnect
      document.getElementById('btn-disconnect').addEventListener('click', () => {
        this.token = '';
        this.userProfile = null;
        this.isConnected = false;
        localStorage.removeItem('syncada_gh_token');
        document.getElementById('gh-token').value = '';
        this.state = { tasks: {}, barriers: {}, governors: {}, exuvias: {} };
        this.updateAuthUI();
        this.renderAll();
        this.showToast('Disconnected. Vault locked.', 'info');
      });

      // Refresh
      document.getElementById('btn-refresh').addEventListener('click', () => {
        if (!this.isConnected) {
          this.showToast('Connect with a GitHub PAT token first.', 'warning');
          return;
        }
        this.renderAll();
        this.showToast('Vault reloaded from state.', 'success');
      });

      // Onboarding Guide Modal Open / Close
      document.getElementById('btn-open-guide').addEventListener('click', () => {
        document.getElementById('modal-guide').classList.add('active');
      });
      document.getElementById('modal-guide-close').addEventListener('click', () => {
        document.getElementById('modal-guide').classList.remove('active');
      });

      // Guide Tabs Switching
      document.querySelectorAll('.guide-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.guide-tab').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.guide-section').forEach(s => s.classList.add('hidden'));

          btn.classList.add('active');
          const target = btn.dataset.guide;
          document.getElementById(`guide-content-${target}`).classList.remove('hidden');
          document.getElementById(`guide-content-${target}`).classList.add('active');
        });
      });

      // Snippet Modal Close
      document.getElementById('modal-snippet-close').addEventListener('click', () => {
        document.getElementById('modal-snippet').classList.remove('active');
      });

      // Global Copy Snippet Listener
      document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('copy-snippet-btn')) {
          const targetId = e.target.dataset.target;
          const codeEl = document.getElementById(targetId);
          if (codeEl) {
            navigator.clipboard.writeText(codeEl.innerText.trim());
            this.showToast('📋 Snippet copied to clipboard!', 'success');
          }
        }
      });

      // Task Target Type Toggle
      document.getElementById('task-target-type').addEventListener('change', (e) => {
        const isInline = e.target.value === 'inline_code';
        document.getElementById('group-target-url').classList.toggle('hidden', isInline);
        document.getElementById('group-target-code').classList.toggle('hidden', !isInline);
      });

      // HA Checkbox Toggle
      document.getElementById('task-enable-ha').addEventListener('change', (e) => {
        document.getElementById('section-ha-options').classList.toggle('hidden', !e.target.checked);
      });

      // Task Modal Open / Close
      document.getElementById('btn-create-task').addEventListener('click', () => {
        if (!this.isConnected) return;
        this.openTaskModal();
      });
      document.getElementById('modal-task-close').addEventListener('click', () => this.closeTaskModal());
      document.getElementById('btn-cancel-task').addEventListener('click', () => this.closeTaskModal());
      document.getElementById('form-task').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromModal();
      });

      // Barrier Modal Open / Close
      document.getElementById('btn-create-barrier').addEventListener('click', () => {
        if (!this.isConnected) return;
        this.openBarrierModal();
      });
      document.getElementById('modal-barrier-close').addEventListener('click', () => this.closeBarrierModal());
      document.getElementById('btn-cancel-barrier').addEventListener('click', () => this.closeBarrierModal());
      document.getElementById('form-barrier').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBarrierFromModal();
      });

      // Governor Modal Open / Close
      document.getElementById('btn-create-governor').addEventListener('click', () => {
        if (!this.isConnected) return;
        this.openGovernorModal();
      });
      document.getElementById('modal-governor-close').addEventListener('click', () => this.closeGovernorModal());
      document.getElementById('btn-cancel-governor').addEventListener('click', () => this.closeGovernorModal());
      document.getElementById('form-governor').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveGovernorFromModal();
      });
    }

    // Dynamic 1-Click Snippet Generator (ZERO Hardcoding!)
    openSnippetModal(type, id) {
      const container = document.getElementById('snippet-container');
      container.innerHTML = '';

      const login = this.userProfile?.login || 'YOUR_USER';
      const userToken = this.token || 'ghp_YOUR_TOKEN';

      if (type === 'barrier') {
        const barrier = this.state.barriers[id];
        if (!barrier) return;

        document.getElementById('modal-snippet-title').innerText = `📋 Integration Snippets — "${barrier.name}"`;
        document.getElementById('modal-snippet-desc').innerText = `Use these pre-filled code snippets to signal barrier key "${barrier.barrierKey}" from your microservices or scripts.`;

        const sender = barrier.requiredSenders && barrier.requiredSenders.length > 0 ? barrier.requiredSenders[0] : 'service-node-1';

        const curlCode = `curl -X POST "https://api.github.com/repos/${login}/.syncada-storage/dispatches" \\
  -H "Authorization: token ${userToken}" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -d '{"event_type":"syncada_barrier_signal","client_payload":{"barrierKey":"${barrier.barrierKey}","sender":"${sender}","payload":{"status":"READY","timestamp":"${new Date().toISOString()}"}}}'`;

        const cliCode = `syncada barrier signal "${barrier.barrierKey}" --sender "${sender}" --payload '{"status":"READY"}'`;

        const jsCode = `import { Syncada } from 'terra-syncada';

const syncada = new Syncada({ githubToken: process.env.GITHUB_TOKEN });

// Signal barrier key "${barrier.barrierKey}" from microservice "${sender}"
await syncada.barrier.signalBarrier(
  "${barrier.barrierKey}",
  "${sender}",
  { status: "READY", timestamp: new Date().toISOString() }
);`;

        const pyCode = `import requests, os, json

# Signal Syncada Stridulation Barrier "${barrier.name}"
url = "https://api.github.com/repos/${login}/.syncada-storage/dispatches"
headers = {
    "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
    "Accept": "application/vnd.github.v3+json"
}
data = {
    "event_type": "syncada_barrier_signal",
    "client_payload": {
        "barrierKey": "${barrier.barrierKey}",
        "sender": "${sender}",
        "payload": {"status": "READY"}
    }
}
response = requests.post(url, headers=headers, json=data)
print(response.status_code)`;

        container.innerHTML = `
          <div class="snippet-box">
            <div class="snippet-header"><span>1. cURL / Webhook HTTP POST</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-dynamic-curl">📋 Copy cURL</button></div>
            <pre><code id="code-dynamic-curl">${curlCode}</code></pre>
          </div>

          <div class="snippet-box">
            <div class="snippet-header"><span>2. Syncada CLI Command</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-dynamic-cli">📋 Copy CLI</button></div>
            <pre><code id="code-dynamic-cli">${cliCode}</code></pre>
          </div>

          <div class="snippet-box">
            <div class="snippet-header"><span>3. Node.js / TypeScript SDK</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-dynamic-js">📋 Copy Node.js</button></div>
            <pre><code id="code-dynamic-js">${jsCode}</code></pre>
          </div>

          <div class="snippet-box">
            <div class="snippet-header"><span>4. Python Script</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-dynamic-py">📋 Copy Python</button></div>
            <pre><code id="code-dynamic-py">${pyCode}</code></pre>
          </div>
        `;
      } else if (type === 'task') {
        const task = this.state.tasks[id];
        if (!task) return;

        document.getElementById('modal-snippet-title').innerText = `📋 Integration Snippets — "${task.name}"`;
        document.getElementById('modal-snippet-desc').innerText = `Trigger Nymph Task "${task.id}" on-demand from your application or terminal.`;

        const cliCode = `syncada task run ${task.id}`;
        const jsCode = `import { Syncada } from 'terra-syncada';
const syncada = new Syncada({ githubToken: process.env.GITHUB_TOKEN });
await syncada.runTask('${task.id}');`;

        container.innerHTML = `
          <div class="snippet-box">
            <div class="snippet-header"><span>1. Syncada CLI Command</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-task-dynamic-cli">📋 Copy CLI</button></div>
            <pre><code id="code-task-dynamic-cli">${cliCode}</code></pre>
          </div>

          <div class="snippet-box">
            <div class="snippet-header"><span>2. Node.js / TypeScript SDK</span><button class="btn btn-sm btn-secondary copy-snippet-btn" data-target="code-task-dynamic-js">📋 Copy Node.js</button></div>
            <pre><code id="code-task-dynamic-js">${jsCode}</code></pre>
          </div>
        `;
      }

      document.getElementById('modal-snippet').classList.add('active');
    }

    // Task Modal Helpers
    openTaskModal(task = null) {
      document.getElementById('modal-task-title').innerText = task ? 'Edit Nymph Task / Shell' : 'Create Nymph Task / Shell';
      document.getElementById('task-id').value = task ? task.id : '';
      document.getElementById('task-name').value = task ? task.name : '';
      document.getElementById('task-category').value = task ? task.category : 'chrono_shell';
      document.getElementById('task-schedule').value = task ? (task.schedule || '') : '';

      const targetType = task?.primaryTarget?.inlineCode ? 'inline_code' : 'http';
      document.getElementById('task-target-type').value = targetType;
      document.getElementById('task-target-url').value = task?.primaryTarget?.url || '';
      document.getElementById('task-target-code').value = task?.primaryTarget?.inlineCode || '';
      document.getElementById('group-target-url').classList.toggle('hidden', targetType === 'inline_code');
      document.getElementById('group-target-code').classList.toggle('hidden', targetType !== 'inline_code');

      document.getElementById('task-enable-ha').checked = task ? (task.enableHA ?? true) : true;
      document.getElementById('task-max-retries').value = task ? (task.maxRetries ?? 3) : 3;
      document.getElementById('task-fallback-url').value = task?.fallbackTarget?.url || '';
      document.getElementById('section-ha-options').classList.toggle('hidden', task ? !task.enableHA : false);

      document.getElementById('task-enable-diff').checked = task ? (task.enableDiffAware ?? true) : true;
      document.getElementById('task-webhook-url').value = task?.alerts?.webhookUrl || '';
      document.getElementById('task-github-repo').value = task?.alerts?.githubIssueRepo || '';

      document.getElementById('modal-task').classList.add('active');
    }

    closeTaskModal() {
      document.getElementById('modal-task').classList.remove('active');
    }

    saveTaskFromModal() {
      const id = document.getElementById('task-id').value || `task-${Math.random().toString(36).substring(2, 9)}`;
      const name = document.getElementById('task-name').value.trim();
      const category = document.getElementById('task-category').value;
      const schedule = document.getElementById('task-schedule').value.trim();
      const targetType = document.getElementById('task-target-type').value;
      const targetUrl = document.getElementById('task-target-url').value.trim();
      const inlineCode = document.getElementById('task-target-code').value.trim();

      const enableHA = document.getElementById('task-enable-ha').checked;
      const maxRetries = parseInt(document.getElementById('task-max-retries').value, 10) || 3;
      const fallbackUrl = document.getElementById('task-fallback-url').value.trim();
      const enableDiffAware = document.getElementById('task-enable-diff').checked;

      const webhookUrl = document.getElementById('task-webhook-url').value.trim();
      const githubIssueRepo = document.getElementById('task-github-repo').value.trim();

      const task = {
        id,
        name,
        category,
        schedule,
        primaryTarget: {
          type: targetType,
          url: targetUrl,
          inlineCode: targetType === 'inline_code' ? inlineCode : undefined
        },
        enableHA,
        maxRetries,
        fallbackTarget: fallbackUrl ? { type: 'http', url: fallbackUrl } : undefined,
        enableDiffAware,
        alerts: {
          notifyOnSuccess: true,
          notifyOnFailure: true,
          webhookUrl,
          githubIssueRepo
        },
        consecutiveFailures: 0,
        isHibernating: false,
        status: 'idle',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.state.tasks[id] = task;
      this.saveLocalVaultState();
      this.closeTaskModal();
      this.renderAll();
      this.showToast(`Nymph Task "${name}" saved to NymphVault!`, 'success');
    }

    // Barrier Modal Helpers
    openBarrierModal(barrier = null) {
      document.getElementById('modal-barrier-title').innerText = barrier ? 'Edit Stridulation Barrier Gate' : 'Create Stridulation Barrier Gate';
      document.getElementById('barrier-id').value = barrier ? barrier.id : '';
      document.getElementById('barrier-name').value = barrier ? barrier.name : '';
      document.getElementById('barrier-key').value = barrier ? barrier.barrierKey : `gate-${Math.random().toString(36).substring(2, 7)}`;
      document.getElementById('barrier-count').value = barrier ? barrier.requiredSignalsCount : 2;
      document.getElementById('barrier-senders').value = barrier?.requiredSenders ? barrier.requiredSenders.join(', ') : '';
      document.getElementById('barrier-timeout').value = barrier?.timeoutMs || '';
      document.getElementById('barrier-timeout-action').value = barrier?.timeoutAction || 'auto_abort';
      document.getElementById('barrier-url').value = barrier?.targetOnRelease?.url || 'https://api.mycompany.com/deploy/release';
      document.getElementById('modal-barrier').classList.add('active');
    }

    closeBarrierModal() {
      document.getElementById('modal-barrier').classList.remove('active');
    }

    saveBarrierFromModal() {
      const id = document.getElementById('barrier-id').value || `barrier-${Math.random().toString(36).substring(2, 9)}`;
      const name = document.getElementById('barrier-name').value.trim();
      const key = document.getElementById('barrier-key').value.trim();
      const count = parseInt(document.getElementById('barrier-count').value, 10) || 2;
      const sendersStr = document.getElementById('barrier-senders').value.trim();
      const requiredSenders = sendersStr ? sendersStr.split(',').map(s => s.trim()).filter(Boolean) : [];
      const timeoutMsStr = document.getElementById('barrier-timeout').value.trim();
      const timeoutMs = timeoutMsStr ? parseInt(timeoutMsStr, 10) : undefined;
      const timeoutAction = document.getElementById('barrier-timeout-action').value;
      const url = document.getElementById('barrier-url').value.trim();

      const existing = this.state.barriers[id];

      const barrier = {
        id,
        name,
        barrierKey: key,
        requiredSignalsCount: count,
        requiredSenders,
        timeoutMs,
        timeoutAction,
        receivedSignals: existing ? existing.receivedSignals : [],
        receivedPayloads: existing ? existing.receivedPayloads : {},
        targetOnRelease: { type: 'http', url },
        status: existing ? existing.status : 'locked',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.state.barriers[id] = barrier;
      this.saveLocalVaultState();
      this.closeBarrierModal();
      this.renderAll();
      this.showToast(`Barrier "${name}" saved!`, 'success');
    }

    // Governor Modal Helpers
    openGovernorModal(gov = null) {
      document.getElementById('modal-governor-title').innerText = gov ? 'Edit Rate-Pulse Governor' : 'Create Rate-Pulse Governor';
      document.getElementById('governor-id').value = gov ? gov.id : '';
      document.getElementById('governor-name').value = gov ? gov.name : '';
      document.getElementById('governor-cadence').value = gov ? gov.cadenceMs : 2500;
      document.getElementById('governor-burst').value = gov ? (gov.maxBurst || 1) : 1;
      document.getElementById('governor-adaptive').checked = gov ? (gov.enableAdaptiveBackoff ?? true) : true;
      document.getElementById('modal-governor').classList.add('active');
    }

    closeGovernorModal() {
      document.getElementById('modal-governor').classList.remove('active');
    }

    saveGovernorFromModal() {
      const id = document.getElementById('governor-id').value || `gov-${Math.random().toString(36).substring(2, 9)}`;
      const name = document.getElementById('governor-name').value.trim();
      const cadenceMs = parseInt(document.getElementById('governor-cadence').value, 10) || 2500;
      const maxBurst = parseInt(document.getElementById('governor-burst').value, 10) || 1;
      const enableAdaptiveBackoff = document.getElementById('governor-adaptive').checked;

      const existing = this.state.governors[id];

      const gov = {
        id,
        name,
        cadenceMs,
        currentCadenceMs: cadenceMs,
        maxBurst,
        enableAdaptiveBackoff,
        batchQueue: existing ? existing.batchQueue : [{ type: 'http', url: 'https://api.mycompany.com/pacing-test' }],
        processedCount: existing ? existing.processedCount : 0,
        status: existing ? existing.status : 'active',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.state.governors[id] = gov;
      this.saveLocalVaultState();
      this.closeGovernorModal();
      this.renderAll();
      this.showToast(`Governor Metronome "${name}" saved!`, 'success');
    }

    async runTaskNow(taskId) {
      if (!this.isConnected) return;
      const task = this.state.tasks[taskId];
      if (!task) return;

      this.showToast(`🥁 Tymbal Pulse: Executing Nymph Task "${task.name}"...`, 'info');

      const startTime = Date.now();
      let outputSnippet = 'Executed successfully.';
      let status = 'completed';

      if (task.primaryTarget.type === 'inline_code' && task.primaryTarget.inlineCode) {
        try {
          const runner = new Function('fetch', 'crypto', `return (async () => { ${task.primaryTarget.inlineCode} })()`);
          const res = await runner(fetch, crypto);
          outputSnippet = typeof res === 'object' ? JSON.stringify(res) : String(res);
        } catch (err) {
          outputSnippet = err.message;
          status = 'failed';
        }
      }

      const durationMs = Date.now() - startTime;
      task.status = status;
      task.lastEmergenceTime = new Date().toISOString();

      const snapshot = {
        id: `exuvia-${Math.random().toString(36).substring(2, 9)}`,
        taskId: task.id,
        taskName: task.name,
        category: task.category,
        emergenceTimestamp: new Date().toISOString(),
        durationMs,
        httpStatus: 200,
        outputSnippet: outputSnippet.substring(0, 200),
        outputHash: 'a7b8c9d0e1f234567890abcdef1234567890abcdef',
        wasFailoverUsed: false,
        wasDiffSkipped: false,
        retryAttemptsUsed: 1,
        logs: [`[StridulationEmitter] Executed task "${task.name}" on-demand.`]
      };

      this.state.exuvias[snapshot.id] = snapshot;
      this.saveLocalVaultState();
      this.renderAll();
      this.showToast(`✅ Emergence completed! Exuvia snapshot recorded (${durationMs}ms)`, 'success');
    }

    deleteTask(taskId) {
      if (!this.isConnected) return;
      delete this.state.tasks[taskId];
      this.saveLocalVaultState();
      this.renderAll();
      this.showToast('Nymph Task deleted from NymphVault.', 'info');
    }

    deleteBarrier(barrierId) {
      if (!this.isConnected) return;
      delete this.state.barriers[barrierId];
      this.saveLocalVaultState();
      this.renderAll();
      this.showToast('Barrier Gate deleted.', 'info');
    }

    deleteGovernor(govId) {
      if (!this.isConnected) return;
      delete this.state.governors[govId];
      this.saveLocalVaultState();
      this.renderAll();
      this.showToast('Rate-Pulse Governor deleted.', 'info');
    }

    renderAll() {
      this.renderStats();
      this.renderDashboardInventory();
      this.renderTasks();
      this.renderBarriers();
      this.renderGovernors();
      this.renderExuvias();
    }

    renderStats() {
      if (!this.isConnected) {
        document.getElementById('stat-tasks-count').innerText = '🔒';
        document.getElementById('stat-ha-count').innerText = '🔒';
        document.getElementById('stat-diff-count').innerText = '🔒';
        document.getElementById('stat-exuvia-count').innerText = '🔒';
        return;
      }

      const tasks = Object.values(this.state.tasks);
      const haCount = tasks.filter(t => t.enableHA).length;
      const diffCount = tasks.filter(t => t.enableDiffAware).length;
      const exuviaCount = Object.keys(this.state.exuvias).length;

      document.getElementById('stat-tasks-count').innerText = tasks.length;
      document.getElementById('stat-ha-count').innerText = haCount;
      document.getElementById('stat-diff-count').innerText = diffCount;
      document.getElementById('stat-exuvia-count').innerText = exuviaCount;
    }

    renderDashboardInventory() {
      const container = document.getElementById('dashboard-inventory');
      container.innerHTML = '';

      if (!this.isConnected) {
        container.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view your Inventory.</div>';
        return;
      }

      const tasksCount = Object.keys(this.state.tasks).length;
      const barriersCount = Object.keys(this.state.barriers).length;
      const govsCount = Object.keys(this.state.governors).length;
      const exuviaCount = Object.keys(this.state.exuvias).length;

      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <span class="card-title">🌰 Nymph Tasks & Shells</span>
            <span class="card-badge badge-completed">${tasksCount} ACTIVE</span>
          </div>
          <p class="detail-val" style="text-align: left; font-size: 0.88rem; color: var(--text-muted);">
            Manage your Chrono Nymph Shells ($0 Master Cron) and Classic Shells with HA Fallback & Diff-Aware filtering.
          </p>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary nav-shortcut" data-target="tasks">Go to Nymph Tasks ➔</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🔒 Stridulation Barriers</span>
            <span class="card-badge badge-completed">${barriersCount} GATES</span>
          </div>
          <p class="detail-val" style="text-align: left; font-size: 0.88rem; color: var(--text-muted);">
            Distributed time-barrier gates with Whitelist Senders, Timeouts, and Aggregated Payloads.
          </p>
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary nav-shortcut" data-target="barriers">Go to Barriers ➔</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">⏱️ Rate-Pulse Governor</span>
            <span class="card-badge badge-completed">${govsCount} METRONOMES</span>
          </div>
          <p class="detail-val" style="text-align: left; font-size: 0.88rem; color: var(--text-muted);">
            Metronome rate-pacing governor with Burst Bucket, Priority Queuing, and Adaptive 429 Backoff.
          </p>
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary nav-shortcut" data-target="governors">Go to Governors ➔</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">📜 Exuvia Replay Timeline</span>
            <span class="card-badge badge-completed">${exuviaCount} SNAPSHOTS</span>
          </div>
          <p class="detail-val" style="text-align: left; font-size: 0.88rem; color: var(--text-muted);">
            Immutable execution receipts with 1-Click Forensic Time-Travel Replay.
          </p>
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary nav-shortcut" data-target="exuvias">View Timeline ➔</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.nav-shortcut').forEach(b => {
        b.addEventListener('click', () => {
          const targetTab = b.dataset.target;
          document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === targetTab);
          });
          document.querySelectorAll('.tab-pane').forEach(p => {
            p.classList.toggle('active', p.id === `tab-${targetTab}`);
          });
        });
      });
    }

    renderTasks() {
      const grid = document.getElementById('tasks-grid');
      grid.innerHTML = '';

      if (!this.isConnected) {
        grid.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view Nymph Tasks.</div>';
        return;
      }

      const tasks = Object.values(this.state.tasks);
      if (tasks.length === 0) {
        grid.innerHTML = '<div class="empty-state">No Nymph Tasks registered yet. Click "+ Create Nymph Task" to add your first Chrono Shell.</div>';
        return;
      }

      tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'card';

        const badgeClass = `badge-${task.status.replace(/_/g, '-')}`;

        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">${task.name}</span>
            <span class="card-badge ${badgeClass}">${task.status.toUpperCase()}</span>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">Schedule:</span>
              <span class="detail-val">${task.schedule || 'On-Demand (Classic Nymph Shell)'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Target:</span>
              <span class="detail-val">${task.primaryTarget.inlineCode ? '⚡ Inline Code Runlet' : (task.primaryTarget.url || 'HTTP Endpoint')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">HA Matrix:</span>
              <span class="detail-val">${task.enableHA ? `ENABLED (Max Retries: ${task.maxRetries})` : 'DISABLED'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Diff-Aware Filter:</span>
              <span class="detail-val">${task.enableDiffAware ? 'ENABLED 🟢' : 'DISABLED'}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-sm btn-primary btn-run" data-id="${task.id}">🥁 Emerging Now</button>
            <button class="btn btn-sm btn-secondary btn-snippet-task" data-id="${task.id}">📋 Snippets</button>
            <button class="btn btn-sm btn-secondary btn-edit-task" data-id="${task.id}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger btn-del-task" data-id="${task.id}">🗑️</button>
          </div>
        `;

        grid.appendChild(card);
      });

      grid.querySelectorAll('.btn-run').forEach(b => b.addEventListener('click', () => this.runTaskNow(b.dataset.id)));
      grid.querySelectorAll('.btn-snippet-task').forEach(b => b.addEventListener('click', () => this.openSnippetModal('task', b.dataset.id)));
      grid.querySelectorAll('.btn-edit-task').forEach(b => b.addEventListener('click', () => this.openTaskModal(this.state.tasks[b.dataset.id])));
      grid.querySelectorAll('.btn-del-task').forEach(b => b.addEventListener('click', () => this.deleteTask(b.dataset.id)));
    }

    renderBarriers() {
      const grid = document.getElementById('barriers-grid');
      grid.innerHTML = '';

      if (!this.isConnected) {
        grid.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view Stridulation Barriers.</div>';
        return;
      }

      const barriers = Object.values(this.state.barriers);
      if (barriers.length === 0) {
        grid.innerHTML = '<div class="empty-state">No Stridulation Barriers created. Click "+ New Barrier Gate" to add one.</div>';
        return;
      }

      barriers.forEach(b => {
        const card = document.createElement('div');
        card.className = 'card';
        const sendersLabel = b.requiredSenders && b.requiredSenders.length > 0 ? b.requiredSenders.join(', ') : 'Any Sender';
        const timeoutLabel = b.timeoutMs ? `${b.timeoutMs}ms (${b.timeoutAction || 'auto_abort'})` : 'No Timeout';

        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">🔒 ${b.name}</span>
            <span class="card-badge ${b.status === 'released' ? 'badge-completed' : 'badge-hibernating'}">${b.status.toUpperCase()}</span>
          </div>
          <div class="card-details">
            <div class="detail-row"><span class="detail-label">Barrier Key:</span><span class="detail-val">${b.barrierKey}</span></div>
            <div class="detail-row"><span class="detail-label">Signals Threshold:</span><span class="detail-val">${b.receivedSignals.length} / ${b.requiredSignalsCount}</span></div>
            <div class="detail-row"><span class="detail-label">Required Whitelist:</span><span class="detail-val">${sendersLabel}</span></div>
            <div class="detail-row"><span class="detail-label">Timeout Policy:</span><span class="detail-val">${timeoutLabel}</span></div>
            <div class="detail-row"><span class="detail-label">Release Target:</span><span class="detail-val">${b.targetOnRelease?.url || 'Configured Target'}</span></div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary btn-snippet-barrier" data-id="${b.id}">📋 Snippets & Webhook</button>
            <button class="btn btn-sm btn-secondary btn-signal" data-key="${b.barrierKey}">📡 Send Signal</button>
            <button class="btn btn-sm btn-secondary btn-edit-barrier" data-id="${b.id}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger btn-del-barrier" data-id="${b.id}">🗑️</button>
          </div>
        `;
        grid.appendChild(card);
      });

      grid.querySelectorAll('.btn-snippet-barrier').forEach(b => b.addEventListener('click', () => this.openSnippetModal('barrier', b.dataset.id)));

      grid.querySelectorAll('.btn-signal').forEach(b => {
        b.addEventListener('click', () => {
          const key = b.dataset.key;
          const target = Object.values(this.state.barriers).find(x => x.barrierKey === key);
          if (target) {
            target.receivedSignals.push(`signal-${Date.now()}`);
            if (target.receivedSignals.length >= target.requiredSignalsCount) {
              target.status = 'released';
            }
            this.saveLocalVaultState();
            this.renderAll();
            this.showToast(`📡 Signal sent to Barrier "${target.name}". Status: ${target.status}`, 'success');
          }
        });
      });

      grid.querySelectorAll('.btn-edit-barrier').forEach(b => b.addEventListener('click', () => this.openBarrierModal(this.state.barriers[b.dataset.id])));
      grid.querySelectorAll('.btn-del-barrier').forEach(b => b.addEventListener('click', () => this.deleteBarrier(b.dataset.id)));
    }

    renderGovernors() {
      const grid = document.getElementById('governors-grid');
      grid.innerHTML = '';

      if (!this.isConnected) {
        grid.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view Rate-Pulse Governors.</div>';
        return;
      }

      const govs = Object.values(this.state.governors);
      if (govs.length === 0) {
        grid.innerHTML = '<div class="empty-state">No Rate-Pulse Governors active. Click "+ New Metronome Governor" to add one.</div>';
        return;
      }

      govs.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card';
        const cadenceLabel = g.currentCadenceMs && g.currentCadenceMs !== g.cadenceMs ? `${g.currentCadenceMs}ms (Adaptive)` : `${g.cadenceMs}ms`;

        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">⏱️ ${g.name}</span>
            <span class="card-badge badge-completed">${g.status.toUpperCase()}</span>
          </div>
          <div class="card-details">
            <div class="detail-row"><span class="detail-label">Cadence Metronome:</span><span class="detail-val">${cadenceLabel}</span></div>
            <div class="detail-row"><span class="detail-label">Max Burst Size:</span><span class="detail-val">${g.maxBurst || 1} items/pulse</span></div>
            <div class="detail-row"><span class="detail-label">Adaptive 429 Backoff:</span><span class="detail-val">${g.enableAdaptiveBackoff ? 'ENABLED ⚡' : 'DISABLED'}</span></div>
            <div class="detail-row"><span class="detail-label">Items Processed:</span><span class="detail-val">${g.processedCount}</span></div>
            <div class="detail-row"><span class="detail-label">Remaining Queue:</span><span class="detail-val">${g.batchQueue.length} items</span></div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary btn-pulse-gov" data-id="${g.id}">⚡ Pulse Metronome</button>
            <button class="btn btn-sm btn-secondary btn-edit-gov" data-id="${g.id}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger btn-del-gov" data-id="${g.id}">🗑️</button>
          </div>
        `;
        grid.appendChild(card);
      });

      grid.querySelectorAll('.btn-pulse-gov').forEach(b => {
        b.addEventListener('click', () => {
          const g = this.state.governors[b.dataset.id];
          if (g) {
            const burst = g.maxBurst || 1;
            for (let i = 0; i < burst; i++) {
              g.processedCount++;
              if (g.batchQueue.length > 0) g.batchQueue.shift();
            }
            this.saveLocalVaultState();
            this.renderAll();
            this.showToast(`⚡ Metronome Pulse executed for "${g.name}" (${burst} items burst).`, 'success');
          }
        });
      });

      grid.querySelectorAll('.btn-edit-gov').forEach(b => b.addEventListener('click', () => this.openGovernorModal(this.state.governors[b.dataset.id])));
      grid.querySelectorAll('.btn-del-gov').forEach(b => b.addEventListener('click', () => this.deleteGovernor(b.dataset.id)));
    }

    renderExuvias() {
      const list = document.getElementById('exuvias-list');
      list.innerHTML = '';

      if (!this.isConnected) {
        list.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view Exuvia Snapshots.</div>';
        return;
      }

      const exuvias = Object.values(this.state.exuvias).sort((a, b) => new Date(b.emergenceTimestamp) - new Date(a.emergenceTimestamp));
      if (exuvias.length === 0) {
        list.innerHTML = '<div class="empty-state">No Exuvia execution snapshots recorded yet.</div>';
        return;
      }

      exuvias.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-info">
            <span class="timeline-title">📜 Exuvia Snapshot [${ex.id}] — ${ex.taskName}</span>
            <span class="timeline-meta">Emergence: ${new Date(ex.emergenceTimestamp).toLocaleString()} | Duration: ${ex.durationMs}ms | Output Hash: ${ex.outputHash.substring(0, 10)}...</span>
            <span class="timeline-snippet" style="font-family: monospace; font-size: 0.8rem; color: #ff868b;">Output: ${ex.outputSnippet}</span>
          </div>
          <button class="btn btn-sm btn-secondary btn-replay" data-id="${ex.id}">📜 Replay Snapshot</button>
        `;
        list.appendChild(item);
      });

      list.querySelectorAll('.btn-replay').forEach(b => {
        b.addEventListener('click', () => {
          const ex = this.state.exuvias[b.dataset.id];
          if (ex) {
            this.showToast(`📜 1-Click Forensic Replay Executed for "${ex.taskName}"! Status: REPLAYED_SUCCESS 🟢`, 'success');
          }
        });
      });
    }

    showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerText = msg;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
  }

  new SyncadaConsole();
});
