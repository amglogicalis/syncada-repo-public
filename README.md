<div align="center">

<img src="assets/logo_syncada.png" alt="Syncada Logo" width="140" />

# ⏰ SYNCADA v1.0.0
### Master Cron, Task Automation & Nymph Shells Engine ($0 Infrastructure)

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-ff868b.svg)](package.json)
[![Status](https://img.shields.io/badge/status-OPERATIONAL-10b981.svg)]()
[![Cost](https://img.shields.io/badge/cost-$0%20Infrastructure-6366f1.svg)]()

**[🌐 Live Web Console](https://amglogicalis.github.io/syncada-repo-public/)** • **[📦 NPM Package](https://www.npmjs.com/package/terra-syncada)**

---

</div>

## 💡 What is Syncada?

**Syncada** is the 11th Titan of the **Terra Ecosystem** — a 100% free, standalone **Master Cron, Task Automation & Nymph Shells Engine** inspired by the biological periodicity and stridulation of **Cicadas (Cigarras)**.

With Syncada, you can schedule and automate any workflow, script, or HTTP webhook with **High-Availability (HA) Fallback Matrix (max 3 retries)**, **Diff-Aware Smart Emergence**, **Distributed Time-Barriers**, **Rate-Limit Metronome Governors**, and **1-Click Forensic Time-Travel Replays** — all running on $0-cost GitHub infrastructure with **zero third-party dependencies**.

---

## 🌟 The 4 Core Technologies ($0 Infrastructure)

### 1. ⚡ Syncada Nymph Shells & Chrono-Automation
- **Inline JS/TS Code Runlets**: Write custom JavaScript/TypeScript code snippets directly inside your tasks. Executed safely in an isolated VM sandbox inside $0-cost GitHub Actions runners without deploying external servers or paid Lambdas.
- **🛡️ HA Fallback Matrix**: Automatically retries primary targets up to 3 times (configurable 1-5). If all retries fail, seamlessly triggers your **Secondary Fallback Target**.
- **🔔 Multi-Channel Alerts**: Direct alert delivery via **Webhook** (Discord, Slack, Custom HTTP) or native **GitHub Issue creation** without third-party libraries.
- **🧬 Diff-Aware Smart Emergence**: Hashes task outputs with SHA-256. If data hasn't changed since the previous emergence run, marks as `SKIPPED_NO_DIFF ⚪` to avoid duplicate notifications.

### 2. 🔒 Stridulation Barrier Sync (Distributed Time Gates)
- Holds execution until $N$ independent microservices or scripts send their signal (`syncada.barrier.signalBarrier(barrier, 'auth-service')`). Releases the gate automatically when the threshold is reached. Features full param editing (`syncada barrier edit <id>`).

### 3. ⏱️ Temporal Rate-Pulse Governor (Cadence Metronome)
- Rate-pacing metronome that throttles batch task executions (e.g. 1 request per 2.5 seconds), preventing API rate-limit bans (HTTP 429) without Redis or SQS. Features full cadence editing (`syncada governor edit <id>`).

### 4. 📜 Exuvia Time-Travel Snapshot & Replay Engine
- Generates immutable execution receipts (Exuvia snapshots) for every run.
- **1-Click Forensic Replay (`syncada replay <exuviaId>`)**: Re-executes any past historical run from days ago in an isolated sandbox to debug errors or re-trigger actions.

---

## 🚀 Installation & Quick Start

```bash
# Install globally via NPM
npm install -g terra-syncada

# Or run instantly via npx
npx terra-syncada studio --port 3723
```

---

## 💻 CLI Command Reference

```bash
# Create a Chrono Nymph Shell Task (Scheduled Cron with HA & Diff-Aware)
syncada task add "Midnight Database Backup" \
  --schedule "0 0 * * *" \
  --url "https://api.mycompany.com/backup" \
  --ha --retries 3 --fallback "https://secondary-api.mycompany.com/backup" \
  --diff --webhook "https://discord.com/api/webhooks/..."

# Execute Task Emergence On-Demand
syncada task run <taskId>

# Execute an Instant On-Demand Classic Nymph Shell
syncada shell run "return { status: 'processed', timestamp: new Date().toISOString() };"

# List All Tasks in NymphVault
syncada task list

# Create & Edit a Stridulation Barrier Gate
syncada barrier create "Multi-Service Deploy Gate" --key "gate-deploy-v1" --count 2
syncada barrier edit <id> --name "Updated Deploy Gate" --count 3

# Signal a Barrier Gate
syncada barrier signal "gate-deploy-v1" --sender "auth-service"

# Create & Edit a Rate-Pulse Governor
syncada governor create "OpenAI Batch Governor" --cadence 2500
syncada governor edit <id> --cadence 1500

# 1-Click Forensic Time-Travel Replay
syncada replay exuvia-qntwjoxq

# Launch Syncada Tymbal Studio Web Console locally
syncada studio --port 3723
```

---

## 📦 SDK Programmatic Usage

```typescript
import { Syncada } from 'terra-syncada';

const syncada = new Syncada({ githubToken: process.env.GITHUB_TOKEN });

// Initialize Vault
await syncada.init();

// Create a Chrono Nymph Shell with HA Fallback & Inline JS Code
const task = syncada.createTask({
  name: 'Crypto Price Monitor',
  schedule: '*/15 * * * *',
  primaryTarget: {
    type: 'inline_code',
    inlineCode: 'const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json"); const data = await res.json(); return { rate: data.bpi.USD.rate };'
  },
  enableHA: true,
  maxRetries: 3,
  enableDiffAware: true,
  alerts: {
    notifyOnSuccess: true,
    webhookUrl: 'https://discord.com/api/webhooks/...'
  }
});

// Run Emergence
const { task: updatedTask, snapshot } = await syncada.runTask(task.id);
console.log('Emergence Result:', snapshot.outputSnippet);
```

---

## 🎛️ Syncada Tymbal Studio (Web Console)

Exposes a dark glassmorphic dashboard (`#ff868b` primary color scheme) featuring:
- **GitHub PAT Profile Integration**: Displays authenticated user avatar and `@username` badge upon connection.
- **Dashboard Overview Tab**: High-level inventory grid and fast access shortcuts to all components.
- **Active Nymph Tasks Grid**: Real-time status badges, schedule, HA matrix status, Diff-Aware indicator, and 1-click emergence trigger.
- **Interactive Task Modal**: Full configurability and editing of inline code, URLs, schedules, retries count (1-5), fallback URLs, and alert webhooks.
- **Stridulation Barrier Manager**: Real-time signal counter, release gate trigger, and **`✏️ Edit` modal**.
- **Rate-Pulse Governor Dashboard**: Metronome cadence slider, queue status, and **`✏️ Edit` modal**.
- **Exuvia Forensic Timeline**: 1-Click Forensic Time-Travel Replay of historical execution runs.

---

## 📜 License

MIT © [amglogicalis](https://github.com/amglogicalis) • Built for the **Terra Ecosystem** ($0 Infrastructure)
