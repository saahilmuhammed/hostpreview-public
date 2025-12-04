HostPreview (vibe‑coded) is a modern web proxy tool for previewing websites against any backend IP without touching DNS or local hosts files. It lets you map domain → IP → protocol → path on the fly, then spins up a live, sandboxed preview with asset rewriting, SSL fallback, and shareable preview URLs. The interface is fully vibe‑coded.  A live preview for ops teams, hosting providers, and developers shipping migrations with confidence.

### Prerequisites
- Git
- Docker and Docker Compose installed on the target machine

### Steps

1. Clone the repo:
   ```
   git clone https://github.com/saahilmuhammed/hostpreview.git
   cd hostpreview-local
   ```
2. Build and start the stack:
   ```
   docker compose up -d
   ```
3. Open in your browser:
   ```
   http://127.0.0.1
   ```
4. Use the app:
   - Enter **Domain**, **IP address**, optional **protocol** and **path**.
   - Click **Preview Website**.
   - View the live preview, copy the URL, or open it in a new tab.
