# customer_support_agent

# HelpMind AI — Customer Support Agent

HelpMind AI is a memory-powered, enterprise-grade AI customer support application built with modern full-stack web technologies, Google Gemini LLM reasoning, and Hindsight Cloud persistent memory.

## 🚀 Key Features

- **Google Gemini Integration**: Dynamic, context-aware reasoning and resolution generation for complex customer inquiries.
- **Hindsight Cloud Persistent Memory**: Long-term episodic, semantic, and transactional memory recall across sessions and conversations.
- **Multi-Persona Demo Switching**: Instant customer context switching between demo personas (e.g. Priya Sharma, Rahul Sharma) with isolated memory banks and state.
- **Real-Time Memory Explorer & Pipeline Trace**: Visual inspection of memory retrieval steps, confidence, categories, and AI decision trails.
- **SaaS Settings & Customization**:
  - **Appearance**: Light, Dark (high-contrast deep slate), and System theme support.
  - **Display**: In-app UI brightness calibration slider (50% – 100%) with reset.
  - **Chat Preferences**: Enter to send toggle, message timestamp display, and smart auto-scrolling.
  - **Customer Account**: Profile inspection and session management.
- **Strict Server-Side Security**: API keys (`GEMINI_API_KEY`, `HINDSIGHT_API_KEY`) remain strictly protected in backend environment variables and are never leaked to client JavaScript.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TanStack Router, TanStack Query, Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Backend / Server**: Nitro / Node HTTP server, Google `@google/genai` SDK, `@vectorize-io/hindsight-client`
- **Memory Bank**: Hindsight Cloud Vector & Episodic Storage

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### 2. Environment Setup
Copy the example environment file and supply your API keys:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Hindsight Cloud API Key
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=helpmind
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be running locally at `http://localhost:8080`.

---

## 📜 Available Scripts

- `npm run dev` - Start local development server on port 8080
- `npm run build` - Build production assets
- `npm run lint` - Run ESLint verification
