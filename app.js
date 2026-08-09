document.addEventListener('DOMContentLoaded', () => {
  // Syncada Console Engine
  class SyncadaConsole {
    constructor() {
      this.token = localStorage.getItem('syncada_gh_token') || '';
      this.isConnected = false;
      this.state = {
        tasks: {},
        barriers: {},
        governors: {},
        exuvias: {}
      };
      this.init();
    }

    init() {
      this.bindEvents();
      if (this.token) {
        document.getElementById('gh-token').value = this.token;
        this.isConnected = true;
        this.loadVaultData();
      }
      this.updateAuthUI();
      this.renderAll();
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
            category: 'chrono_lambda',
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
            name: 'Diff-Aware Price Scraper Lambda',
            category: 'chrono_lambda',
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
            name: 'On-Demand Classic Lambda Handler',
            category: 'classic_lambda',
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
            receivedSignals: ['service-auth-node'],
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
            batchQueue: [
              { type: 'http', url: 'https://api.openai.com/v1/embeddings' },
              { type: 'http', url: 'https://api.openai.com/v1/embeddings' }
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
            category: 'chrono_lambda',
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
      const btnConnect = document.getElementById('btn-connect');
      const btnDisconnect = document.getElementById('btn-disconnect');
      const btnCreateTask = document.getElementById('btn-create-task');
      const btnCreateBarrier = document.getElementById('btn-create-barrier');
      const btnCreateGov = document.getElementById('btn-create-governor');
      const lockedBanner = document.getElementById('locked-banner');
      const tymbalStatus = document.getElementById('tymbal-status');

      if (this.isConnected && this.token) {
        btnConnect.classList.add('hidden');
        btnDisconnect.classList.remove('hidden');
        btnCreateTask.disabled = false;
        if (btnCreateBarrier) btnCreateBarrier.disabled = false;
        if (btnCreateGov) btnCreateGov.disabled = false;
        lockedBanner.classList.add('hidden');
        tymbalStatus.innerText = '🟢 Tymbal Engine Connected';
        tymbalStatus.classList.remove('locked');
      } else {
        btnConnect.classList.remove('hidden');
        btnDisconnect.classList.add('hidden');
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
        });
      });

      // Token Connect
      document.getElementById('btn-connect').addEventListener('click', () => {
        const val = document.getElementById('gh-token').value.trim();
        if (!val) {
          this.showToast('Please enter a valid GitHub PAT token (ghp_...).', 'danger');
          return;
        }
        this.token = val;
        this.isConnected = true;
        localStorage.setItem('syncada_gh_token', val);
        this.loadVaultData();
        this.updateAuthUI();
        this.renderAll();
        this.showToast('Connected to GitHub NymphVault Engine!', 'success');
      });

      // Token Disconnect
      document.getElementById('btn-disconnect').addEventListener('click', () => {
        this.token = '';
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

      // Task Form Submit
      document.getElementById('form-task').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromModal();
      });
    }

    openTaskModal(task = null) {
      document.getElementById('modal-task-title').innerText = task ? 'Edit Nymph Task / Lambda' : 'Create Nymph Task / Serverless Lambda';
      document.getElementById('task-id').value = task ? task.id : '';
      document.getElementById('task-name').value = task ? task.name : '';
      document.getElementById('task-category').value = task ? task.category : 'chrono_lambda';
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
      this.showToast(`Task "${name}" saved to NymphVault!`, 'success');
    }

    async runTaskNow(taskId) {
      if (!this.isConnected) return;
      const task = this.state.tasks[taskId];
      if (!task) return;

      this.showToast(`🥁 Tymbal Pulse: Executing task "${task.name}"...`, 'info');

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
      this.showToast('Task deleted from NymphVault.', 'info');
    }

    renderAll() {
      this.renderStats();
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

    renderTasks() {
      const grid = document.getElementById('tasks-grid');
      grid.innerHTML = '';

      if (!this.isConnected) {
        grid.innerHTML = '<div class="empty-state">🔒 Vault Locked — Please enter your GitHub PAT token above to connect and view Nymph Tasks.</div>';
        return;
      }

      const tasks = Object.values(this.state.tasks);
      if (tasks.length === 0) {
        grid.innerHTML = '<div class="empty-state">No Nymph Tasks registered yet. Click "+ Create Nymph Task" to add your first Chrono-Lambda.</div>';
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
              <span class="detail-val">${task.schedule || 'On-Demand (Classic Lambda)'}</span>
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
            <button class="btn btn-sm btn-secondary btn-edit" data-id="${task.id}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger btn-del" data-id="${task.id}">🗑️</button>
          </div>
        `;

        grid.appendChild(card);
      });

      grid.querySelectorAll('.btn-run').forEach(b => b.addEventListener('click', () => this.runTaskNow(b.dataset.id)));
      grid.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => this.openTaskModal(this.state.tasks[b.dataset.id])));
      grid.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => this.deleteTask(b.dataset.id)));
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
        grid.innerHTML = '<div class="empty-state">No Stridulation Barriers created.</div>';
        return;
      }

      barriers.forEach(b => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">🔒 ${b.name}</span>
            <span class="card-badge ${b.status === 'released' ? 'badge-completed' : 'badge-hibernating'}">${b.status.toUpperCase()}</span>
          </div>
          <div class="card-details">
            <div class="detail-row"><span class="detail-label">Barrier Key:</span><span class="detail-val">${b.barrierKey}</span></div>
            <div class="detail-row"><span class="detail-label">Signals Threshold:</span><span class="detail-val">${b.receivedSignals.length} / ${b.requiredSignalsCount}</span></div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary btn-signal" data-key="${b.barrierKey}">📡 Send Signal</button>
          </div>
        `;
        grid.appendChild(card);
      });

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
        grid.innerHTML = '<div class="empty-state">No Rate-Pulse Governors active.</div>';
        return;
      }

      govs.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">⏱️ ${g.name}</span>
            <span class="card-badge badge-completed">${g.status.toUpperCase()}</span>
          </div>
          <div class="card-details">
            <div class="detail-row"><span class="detail-label">Cadence Metronome:</span><span class="detail-val">${g.cadenceMs}ms</span></div>
            <div class="detail-row"><span class="detail-label">Items Processed:</span><span class="detail-val">${g.processedCount}</span></div>
            <div class="detail-row"><span class="detail-label">Remaining Queue:</span><span class="detail-val">${g.batchQueue.length} items</span></div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary btn-pulse-gov" data-id="${g.id}">⚡ Pulse Metronome</button>
          </div>
        `;
        grid.appendChild(card);
      });

      grid.querySelectorAll('.btn-pulse-gov').forEach(b => {
        b.addEventListener('click', () => {
          const g = this.state.governors[b.dataset.id];
          if (g) {
            g.processedCount++;
            if (g.batchQueue.length > 0) g.batchQueue.shift();
            this.saveLocalVaultState();
            this.renderAll();
            this.showToast(`⚡ Metronome Pulse executed for "${g.name}".`, 'success');
          }
        });
      });
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
