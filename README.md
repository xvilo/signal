<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally with a secure backend.

View your app in AI Studio: https://ai.studio/apps/drive/1aqT_T8oW6muK6YXOBnzlXNce5Z7f5u5u

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `OPENAI_API_KEY` in [.env](.env) to your OpenAI API key:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   ```

3. Run the app with backend:
   ```bash
   npm start
   ```
   This will start both the backend server (port 3001) and the frontend dev server (port 3000).

   Alternatively, run them separately:
   - Backend: `npm run server` (port 3001)
   - Frontend: `npm run dev` (port 3000)

## Architecture

The app now uses a Node.js backend to keep your OpenAI API key secure:
- **Backend** (`server.js`): Express server that handles all OpenAI API calls
- **Frontend** (React/Vite): Communicates with backend via `/api` endpoints
- **API Key Security**: The OpenAI API key is only stored on the server and never exposed to the browser
