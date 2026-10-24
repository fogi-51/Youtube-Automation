# YouTube Automation Factory 🏭🎬

A production-grade, self-hosted web application for planning, researching, creating, reviewing, organizing, and publishing YouTube videos through an AI-assisted 14-stage production pipeline.

---

## 🌟 Key Architecture & Capabilities

1. **Multi-Channel Management**: Manage independent channel workspaces with brand personas, target demographics, and YouTube OAuth credentials.
2. **14-Stage Production Pipeline**: Strict state machine enforcing human-in-the-loop review gates:
   `IDEA ➔ RESEARCH ➔ OUTLINE ➔ SCRIPT ➔ SCRIPT_REVIEW ➔ VOICEOVER ➔ VISUAL_ASSETS ➔ VIDEO_ASSEMBLY ➔ QUALITY_CHECK ➔ THUMBNAIL ➔ SEO_METADATA ➔ FINAL_REVIEW ➔ SCHEDULED ➔ PUBLISHED`
3. **Idea & Research Studio**: Brainstorm high-CTR hooks and video angles with Gemini 3.8 and low-latency Gemini 3.1 Flash-Lite. Sourced facts are clearly distinguished from AI suggestions.
4. **Script Studio**: Scene-by-scene script editor with synchronized visual cues, b-roll directions, duration estimates, version history, and Markdown/TXT export.
5. **Voiceover Studio**: High-fidelity TTS speech synthesis with Gemini 3.8 Flash-Lite TTS (24kHz Mono) across multiple voice personas (`Kore`, `Puck`, `Charon`, `Fenrir`, `Zephyr`) plus custom audio uploads.
6. **Video Editor & Media Assembly**: FFmpeg timeline compositor supporting 16:9, 9:16 Shorts, and 1:1 formats, subtitle generation, audio ducking, and render job queue tracking.
7. **Three.js 3D Virtual Studio**: Real-time WebGL studio set rendered at 60 FPS with ACESFilmic tone mapping, PBR reflections (`RoomEnvironment`), 8-part cinema camera rig, 24k gold award trophy, and damped camera orbit presets.
8. **Thumbnail Studio & Multimodal Vision**: 16:9 canvas packaging editor with real computer vision analysis (`gemini-3.8-flash`) to critique mobile contrast, curiosity gaps, and predicted CTR grades.
9. **SEO Studio**: Title variations, auto-generated video chapters with timestamps, search tags, hashtags, and engagement pinned comments.
10. **Publishing Queue**: Official YouTube Data API integration with mandatory human sign-off checkboxes, privacy toggles (Private, Unlisted, Public), and scheduled upload dispatch.
11. **Cost & Usage Ledger**: Real-time token consumption ledger, estimated generation costs, and configurable monthly spend ceilings.
12. **Persistent Firestore Database**: Zero-trust Attribute-Based Access Control (ABAC) Firestore security rules isolating each creator's workspaces.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev
# Server listening at http://localhost:3000
```

---

## 🐳 Docker & Coolify Deployment

```bash
# Build and run container with persistent storage
docker compose up -d --build

# View container logs
docker compose logs -f app
```

For Coolify:
- Connect the Git repository
- Set Build Pack to `Dockerfile`
- Expose Port `3000`
- Mount persistent volume `ytfactory_storage` to `/app/storage`

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Injected securely by AI Studio secret management for server-side Gemini API calls |
| `APP_URL` | Application root URL for callbacks and canonical paths |
| `PORT` | Web server port (Default: `3000`) |
| `NODE_ENV` | `development` or `production` |

---

## 🧪 Verification & Tests Executed

- **TypeScript Compilation (`compile_applet`)**: Succeeded with zero errors.
- **Type Checking & Linting (`lint_applet`)**: `tsc --noEmit` verified zero errors across all components.
- **Firestore Security Rules**: Deployed via `DeployRules` RPC to `gen-lang-client-0249460433`.
- **Server Health Check**: Operational at `GET /api/system/health`.
