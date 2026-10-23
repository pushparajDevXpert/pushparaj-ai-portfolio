# Animated Full-Stack Python + AI Portfolio

A responsive, animated portfolio focused on **Full-Stack Python Development + AI / Data Science**, with a code-terminal hero, project visualizations, an example application architecture, and an interactive AI chat panel. Personalized starter for **Pushparaj Abhijeet Supekar**.

## Open it

Requires **Node.js 18 or newer**. No npm packages or build steps needed.

```bash
node server.js
```

Open **http://localhost:3000** in your browser. The AI chat works immediately in **demo mode**, with simple predefined answers.

You can also publish the static front end to GitHub Pages or Netlify. On static-only hosting, the assistant still answers common questions in offline demo mode, but the real AI backend is not available.

## Personalize your portfolio

Open **`site-data.json`** in any text editor and replace:

- `name`, `shortName`, `role`, `headline`, `intro`, `about`, `location`, `availability`
- `skills` and `focusAreas` with your actual skills
- All **four sample projects** with projects you really completed; change the category from `SAMPLE PROJECT` to e.g. `FULL STACK / 2026` and include your real results, screenshots, repository, and live project URL
- `email`, `linkedin`, `github`, and `resumeUrl` with your real information
- `factsForAssistant` with additional **true facts** the AI can share

The displayed stack (including FastAPI, Django, React, SQL, and ML tools) is **an editable set of examples, not verified experience**. Delete anything you do not use. Do not publish the placeholder email or claim sample projects as your own completed work. When you finish editing, refresh the page. Restart Node if you want the AI backend to use the updated profile: the server reads `site-data.json` on start.

## Turn on real AI with a Gemini key

**This Gemini-ready build supports Google Gemini and OpenAI. Gemini takes priority when both keys are configured.**

1. Create a **new** API key at https://aistudio.google.com/apikey (revoke any key that was exposed in a chat or shared publicly).
2. In your project folder, copy `.env.example` to `.env`. In VS Code, confirm that the file is literally named `.env` (not `.env.txt`).
3. Edit the private `.env` file:

   ```dotenv
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   GEMINI_MODEL=gemini-2.5-flash
   PORT=3000
   ```

4. Save `.env` and run `node server.js` in the project folder. If it is already running, press `Ctrl+C` to stop it, then rerun it.
5. Open http://localhost:3000 (not `portfolio-preview.html`) and test the AI chat. The terminal should show `AI mode: gemini`.
6. If you get an AI service error, check whether the key is active, permitted for the Gemini API, and that you have model access/quota. See server terminal output for errors.

**IMPORTANT:** Never put your API key into `index.html`, `app.js`, `site-data.json`, or the ZIP file. Never commit `.env` to a public repository. Gemini API usage can incur charges.

**For OpenAI instead:** Leave `GEMINI_API_KEY` blank and set `OPENAI_API_KEY` plus `OPENAI_MODEL` in `.env`.

**Note:** `portfolio-preview.html` always uses demo chat, even when an API key is configured. Use the local Node.js server for live Gemini.

## Deployment

- **Demo portfolio:** Publish `index.html`, `styles.css`, `app.js`, `favicon.svg`, and `site-data.json` to any static host.
- **AI-enabled portfolio:** Deploy this Node.js server to a Node-compatible host and configure `GEMINI_API_KEY` (or `OPENAI_API_KEY`) in its private environment variables. Configure a domain and HTTPS for a public launch.

This is a starter project, not a hardened public AI service. For a high-traffic deployment, add persistent rate limiting, abuse prevention, and monitoring.

## Tech stack

**Portfolio itself:** HTML + CSS animations, JavaScript, native Node.js HTTP server, Gemini generateContent API or OpenAI Responses API (optional). No frontend frameworks or runtime packages required. **Displayed professional stack:** Python / full-stack web / AI / Data Science examples, editable in `site-data.json`.

## Files

- `site-data.json`: Edit all your personal content here.
- `index.html`: Site structure and accessibility.
- `styles.css`: Design, responsive layout, motion.
- `app.js`: Profile rendering, interactions, chat UI, demo fallback.
- `server.js`: Local server and optional AI connection.
- `.env.example`: Template for your private Gemini or OpenAI API configuration.

## Easiest way to preview

You can double-click **`portfolio-preview.html`** to open the whole design as a single file in a browser. It embeds the current profile and always uses demo chat. To regenerate the standalone preview after changes, run `python build-preview.py` (Python 3). For ongoing changes, use the main multi-file project with `node server.js`.
