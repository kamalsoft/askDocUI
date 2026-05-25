# askDocs | Local RAG Intelligence Interface

**askDocs** is a high-performance, private, and secure frontend interface for locally running Markdown RAG (Retrieval-Augmented Generation) engines. Built with Next.js 16 and React 19, it provides a world-class workspace for interacting with your documentation.

## 🚀 Key Features

### 💬 Advanced AI Chat Interface
- **Multi-Mode Inference**: Native support for `Answer`, `Summarize`, `Compare`, and `Extract` modes.
- **Rich Content Rendering**: Beautiful Markdown output with GFM support, integrated **Mermaid.js** for architectural diagrams, and syntax highlighting for code blocks.
- **Seamless UX**: Virtualized message list (`react-virtuoso`) for infinite scrolling, auto-scroll functionality, and real-time inference timing/score metrics.
- **Export Capabilities**: Download individual AI responses or the entire conversation history as local Markdown (.md) files.

### 📂 Persistent History Management
- **Hardware-Keyed Storage**: Conversation history is persisted in a local **SQLite** database, uniquely identified by a SHA-256 hash of your machine's hardware fingerprint.
- **Full CRUD History**: Save, load, rename, delete individual chats, or purge the entire history.
- **Smart Sidebar**: Real-time history search with debounced filtering and intelligent auto-collapse to maximize workspace on smaller screens.

### 📊 Live System Dashboard
- **Engine Monitoring**: Real-time tracking of CPU inference threads, active models, and cache directories.
- **Health Metrics**: Visual polling indicators for system health (Online, Degraded, Offline) and vector store status.
- **Logs & Registry**: Interactive model registry view and live system log preview.

### ⚙️ Engine Tuning & Configuration
- **Granular Control**: Fine-tune search weights (BM25 vs. Semantic), RRF constants, and re-ranking depth.
- **Engine Settings**: Configure ONNX quantization flags and inference limits through a professional tabbed interface.
- **Safety First**: Implements a stage-and-confirm flow for applying critical engine configuration changes.

### 🎨 Aesthetic & Performance
- **Theme Support**: High-end AI SaaS aesthetic with deep integration for Light and Dark modes (Tailwind CSS 4).
- **Onboarding**: Integrated "Getting Started" tour to guide users through the initial engine setup.
- **Resilience**: Robust retry mechanisms, timeout handling, and global error toast notifications via Sonner.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI Layer**: React 19, Tailwind CSS 4, Lucide React
- **State Management**: TanStack React Query v5
- **Persistence**: SQLite (better-sqlite3)
- **Utilities**: Zod, React Hook Form, Sonner, React Markdown, Mermaid.js

## 🏗️ Technical Architecture

### Local Persistence & Hardware Fingerprinting
askDocs uses a local **SQLite** database (`conversations.db`) managed via `better-sqlite3`. To maintain data integrity without requiring user accounts, the system implements a deterministic **Machine ID Hashing** logic:

1.  **Hardware Discovery**: The system scans all non-internal network interfaces to retrieve MAC addresses and the system `hostname`.
2.  **Determinism**: MAC addresses are sorted lexicographicaly to ensure the identifier remains stable regardless of how the OS enumerates network hardware.
3.  **Fingerprinting**: The sorted MAC addresses are concatenated with the hostname.
4.  **Hashing**: The combined string is processed through a **SHA-256** cryptographic hash to produce a persistent, 64-character machine fingerprint.

This architecture ensures that your conversation history is strictly bound to your specific hardware, remaining resilient across system reboots or network configuration changes.

## 📸 Visuals

### Dashboard Overview
!Dashboard Overview
*Real-time monitoring of engine health, performance metrics, and model loading states.*

### Compact Chat View
!Compact Chat View
*The high-density Compact View minimizes vertical spacing and hides avatars for efficient document analysis.*

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
