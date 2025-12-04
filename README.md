HostPreview (vibe‑coded) is a modern web proxy tool for previewing websites against any backend IP without touching DNS or local hosts files. It lets you map domain → IP → protocol → path on the fly, then spins up a live, sandboxed preview with asset rewriting, SSL fallback, and shareable preview URLs. The interface is fully vibe‑coded.  A live preview for ops teams, hosting providers, and developers shipping migrations with confidence.

### Prerequisites
- Git
- Docker and Docker Compose installed on the target machine

### Steps

1. Clone the repository:
```
https://github.com/saahilmuhammed/hostpreview.git
cd hostpreview
```
2. Start the app:
```
docker compose up -d
```
3.  Open HostPreview in your browser:
```
http://localhost
```
4. Use the app:
- Enter:
  - **Domain** – hostname you want to test (e.g. `example.com`)
  - **IP address** – server IP you want to hit
  - Optional **protocol** and **path**
- Click **Preview Website**
- View the live preview, copy the preview URL, or open it in a new tab.
