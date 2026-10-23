/*
 * Editable content lives in site-data.json.
 * The portfolio assistant works as a demo without an API key, and uses a
 * server-side Gemini or OpenAI integration when a private API key is configured.
 */
let profile = null;
let aiReady = false;
let activeRequests = 0;
let lastFocus = null;

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const safeLink = (value) => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const defaultProfile = {
  name: 'Pushparaj Abhijeet Supekar', shortName: 'Pushparaj', role: 'Full-Stack Python Developer · AI / Data Science', location: 'Your location',
  availability: 'Open to opportunities', headline: 'I turn complex ideas into things that work.',
  intro: 'Write your own introduction in site-data.json.', about: 'Tell visitors about what you do and why.',
  email: 'your.email@example.com', linkedin: '', github: '', resumeUrl: '',
  skills: ['Python', 'Full-Stack Development', 'AI', 'Data Science'], focusAreas: [], projects: []
};

const visuals = {
  automation: `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" fill="none"><g stroke="#80dcd1" stroke-opacity=".7" stroke-width="1.4"><path d="M74 129 155 57 236 129 155 201 74 129Z"/><path d="M236 129 312 68 386 129 312 191 236 129Z"/><path d="M155 57V201M74 129H386M236 32V228" stroke-dasharray="5 7" stroke-opacity=".3"/><circle cx="74" cy="129" r="7" fill="#acf4e8"/><circle cx="155" cy="57" r="7" fill="#acf4e8"/><circle cx="155" cy="201" r="7" fill="#acf4e8"/><circle cx="236" cy="129" r="13" fill="#173a48" stroke="#acf4e8" stroke-width="3"/><circle cx="312" cy="68" r="7" fill="#c8bbfb" stroke="#c8bbfb"/><circle cx="312" cy="191" r="7" fill="#ff9874" stroke="#ff9874"/><circle cx="386" cy="129" r="7" fill="#acf4e8"/></g><g stroke="#bbf5eb" stroke-opacity=".15"><circle cx="236" cy="129" r="41"/><circle cx="236" cy="129" r="63" stroke-dasharray="4 8"/></g><text x="240" y="134" font-size="12" fill="#acf4e8">✳</text></svg>`,
  design: `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" fill="none"><g stroke="#bdb8f8" stroke-width="1.3"><path d="m230 28 130 76v111l-130 68-130-68V104Z" transform="translate(0 -19)"/><path d="m230 70 93 55v80l-93 49-93-49v-80Z" transform="translate(0 -14)"/><path d="M230 70v161M137 111l93 51 93-51"/><path d="M100 85 230 162 360 85" stroke-dasharray="5 6"/><path d="M230 9v55M230 239v21M63 128h74M323 128h74" stroke-opacity=".4"/><circle cx="230" cy="162" r="6" fill="#c1bafa"/></g><g stroke="#bdb8f8" stroke-width="1" stroke-opacity=".3"><ellipse cx="230" cy="130" rx="180" ry="55" transform="rotate(-28 230 130)"/><ellipse cx="230" cy="130" rx="180" ry="55" transform="rotate(28 230 130)"/></g><circle cx="323" cy="111" r="6" fill="#ff9874"/><circle cx="100" cy="85" r="5" fill="#acf4e8"/></svg>`,
  code: `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" fill="none"><rect x="61" y="43" width="338" height="174" rx="13" fill="#101d33" stroke="#8addd6" stroke-opacity=".55"/><rect x="61" y="43" width="338" height="30" rx="13" fill="#233b4a"/><path d="M61 73h338" stroke="#8addd6" stroke-opacity=".4"/><circle cx="80" cy="58" r="4" fill="#fb9987"/><circle cx="95" cy="58" r="4" fill="#f8c981"/><circle cx="110" cy="58" r="4" fill="#88e7b8"/><text x="234" y="62" text-anchor="middle" font-family="monospace" fill="#adcdd0" font-size="11">api / routes.py</text><g font-family="monospace" font-size="13"><text x="83" y="103" fill="#c5b9ff">from</text><text x="126" y="103" fill="#e4eef6">fastapi</text><text x="187" y="103" fill="#c5b9ff">import</text><text x="247" y="103" fill="#e4eef6">FastAPI</text><text x="83" y="133" fill="#a6f1e4">@app.get</text><text x="158" y="133" fill="#ffc098">('/predict')</text><text x="83" y="163" fill="#c5b9ff">def</text><text x="117" y="163" fill="#e4eef6">predict():</text><text x="109" y="191" fill="#c5b9ff">return</text><text x="168" y="191" fill="#9ce5da">{'result': 'ok'}</text></g><path d="M291 240h55" stroke="#9ce5da" stroke-width="2"/><path d="M337 232l9 8-9 8" stroke="#9ce5da" stroke-width="2"/></svg>`,
  ai: `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" fill="none"><g stroke="#92e5dc" stroke-opacity=".3" stroke-width="1"><path d="M84 49 172 87 238 38 319 73 394 39M84 49 105 148 174 190 241 140 330 190 394 39M172 87 174 190M238 38 241 140M319 73 330 190M105 148 241 140M172 87 319 73M174 190 330 190M319 73 241 140"/></g><g fill="#172f3e" stroke="#9ff5e9" stroke-width="2"><circle cx="84" cy="49" r="10"/><circle cx="172" cy="87" r="11"/><circle cx="238" cy="38" r="9"/><circle cx="319" cy="73" r="11"/><circle cx="394" cy="39" r="9"/><circle cx="105" cy="148" r="9"/><circle cx="174" cy="190" r="9"/><circle cx="241" cy="140" r="23" fill="#2c5c66"/><circle cx="330" cy="190" r="9"/></g><circle cx="241" cy="140" r="40" stroke="#a3d8e4" stroke-opacity=".2" stroke-dasharray="4 8"/><text x="241" y="146" fill="#eafffa" text-anchor="middle" font-family="monospace" font-size="17">AI</text><g fill="#c2b7ff"><circle cx="238" cy="38" r="4"/><circle cx="319" cy="73" r="5"/><circle cx="330" cy="190" r="4"/></g><path d="M75 222h310" stroke="#b0fff1" stroke-opacity=".22"/><text x="230" y="246" fill="#a8d1dc" font-family="monospace" font-size="11" text-anchor="middle">EMBEDDINGS  ·  SEARCH  ·  RESPONSE</text></svg>`,
  data: `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" fill="none"><g stroke="#88b7d4" stroke-opacity=".26"><path d="M55 45v180h350M55 180h350M55 135h350M55 90h350"/><path d="M100 45v180M155 45v180M210 45v180M265 45v180M320 45v180M375 45v180"/></g><path d="M55 187 107 154 160 172 214 96 265 112 318 66 405 77" stroke="#aaf5e9" stroke-width="3"/><path d="M55 187 107 154 160 172 214 96 265 112 318 66 405 77V225H55Z" fill="url(#fillchart)"/><path d="M55 171 110 199 166 132 216 144 272 179 333 115 405 136" stroke="#c2bdf9" stroke-width="2" stroke-dasharray="5 5"/><g fill="#aaf5e9"><circle cx="107" cy="154" r="5"/><circle cx="214" cy="96" r="6"/><circle cx="318" cy="66" r="6"/><circle cx="405" cy="77" r="5"/></g><defs><linearGradient id="fillchart" x1="230" y1="66" x2="230" y2="225" gradientUnits="userSpaceOnUse"><stop stop-color="#7ce6d2" stop-opacity=".28"/><stop offset="1" stop-color="#7ce6d2" stop-opacity="0"/></linearGradient></defs></svg>`
};

function applyProfile(data) {
  profile = { ...defaultProfile, ...data };
  document.title = `${profile.shortName} | ${profile.role}`;
  document.querySelector('meta[name="description"]').content = `${profile.name} — ${profile.role}. Projects, skills, and interactive AI portfolio assistant.`;
  $('#brand-name').innerHTML = `${escapeHTML(profile.shortName.toUpperCase())}<span class="brand-dot">.</span>`;
  $('.footer .brand-text').innerHTML = `${escapeHTML(profile.shortName.toUpperCase())}<span class="brand-dot">.</span>`;
  $('#availability-text').textContent = profile.availability;
  $('#hero-role').textContent = profile.role;
  $('#hero-description').textContent = profile.headline;
  $('#about-intro').textContent = profile.intro;
  $('#about-body').textContent = profile.about;
  $('#location').textContent = profile.location.toUpperCase();
  $('#preview-name').textContent = profile.shortName;
  $('#footer-name').textContent = profile.shortName;
  $('#year').textContent = new Date().getFullYear();
  const email = profile.email || defaultProfile.email;
  $('#contact-email').textContent = `${email} ↗`;
  $('#contact-email').href = email === defaultProfile.email ? '#contact' : `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
  if (email === defaultProfile.email) { $('#contact-email').setAttribute('aria-disabled', 'true'); $('#contact-email').title = 'Add your real email in site-data.json'; $('#contact-email').addEventListener('click', e => e.preventDefault()); }
  [['linkedin-link', profile.linkedin], ['github-link', profile.github], ['resume-link', profile.resumeUrl]].forEach(([id, url]) => {
    const element = $('#' + id); const href = safeLink(url);
    if (href) { element.href = href; element.target = '_blank'; element.rel = 'noopener noreferrer'; element.removeAttribute('aria-disabled'); }
    else { element.href = '#contact'; element.setAttribute('aria-disabled', 'true'); element.title = 'Add this link in site-data.json'; element.addEventListener('click', e => e.preventDefault()); }
  });
  $('#focus-grid').innerHTML = profile.focusAreas.map(item => `
  <article class="expertise-card reveal">
    <span class="expertise-card-icon">${escapeHTML(item.icon)}</span>
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.description)}</p>
  </article>
`).join('');
  $('#skills-list').innerHTML = profile.skills.map(skill => `<span class="skill-chip">${escapeHTML(skill)}</span>`).join('');
  $('#projects-list').innerHTML = profile.projects.map(project => {
    const href = safeLink(project.link);
    return `<article class="project-card reveal"><div class="project-visual ${['automation', 'design', 'data', 'code', 'ai'].includes(project.visual) ? project.visual : 'automation'}"><div class="visual-grid"></div><div class="project-graphic">${visuals[project.visual] || visuals.automation}</div><span class="visual-corner">PROJECT / ${escapeHTML(project.number)}</span><span class="visual-bottom">INNOVATE THROUGH ITERATION //</span></div><div class="project-info"><span class="project-kicker">${escapeHTML(project.category)}</span><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="project-tags">${(project.tags || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>${href ? `<a class="project-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">View project ↗</a>` : ''}</div></article>`;
  }).join('');
  const sampleCount = profile.projects.filter(p => /sample/i.test(p.category)).length;
  $('.projects-footnote').style.display = sampleCount ? 'flex' : 'none';
  initScrollAnimations();
}

function initScrollAnimations() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(item => item.classList.add('visible')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
  }), { threshold: .09, rootMargin: '0px 0px -35px 0px' });
  items.forEach(item => io.observe(item));
}

function localReply(question) {
  const q = question.toLowerCase();
  const projectNames = profile.projects.map(project => project.title).join(', ');
  const contact = profile.email === 'your.email@example.com' ? 'The email address is currently a placeholder. The portfolio owner needs to update it first.' : `Email ${profile.name} at ${profile.email}.`;
  if (/project|portfolio|work|build|made|case study|experience/.test(q)) return `The portfolio currently features: ${projectNames || 'no projects yet'}. Please note: any cards marked “SAMPLE PROJECT” are examples, not verified completed work. For accurate details, ask the owner to replace them with real projects.`;
  if (/skill|expert|technology|tech|tools|know|software|strength|python|django|fastapi|react|frontend|backend|stack|api|database|sql/.test(q)) return `This full-stack Python portfolio showcases an editable example technology stack: ${profile.skills.join(', ')}. Verify the specific tools with the owner; the listed technologies are not independently confirmed experience.`;
  if (/(ai|ml|llm|data science|machine learning|pandas|analytics|neural|model|rag|prediction)/.test(q)) return `The portfolio focuses on applied AI, machine learning, data science, and Python-powered applications. Its AI and data project cards are sample concepts, not claims of finished implementations.`;
  if (/contact|email|hire|reach|connect|linkedin|github|resume|cv/.test(q)) return `${contact}${profile.linkedin ? ` LinkedIn: ${profile.linkedin}` : ''}${profile.github ? ` GitHub: ${profile.github}` : ''}`;
  if (/location|where|based|city|country/.test(q)) return `The portfolio currently lists ${profile.location} as the location.`;
  if (/name|who|about|introduc|background|engineer/.test(q)) return `This is ${profile.name}'s full-stack Python, AI and Data Science portfolio. ${profile.intro} Keep in mind that the starter bio is editable and may not yet reflect real experience.`;
  if (/hello|hi|hey|good morning|good evening/.test(q)) return `Hi! ✳ I'm ${profile.shortName}'s portfolio assistant. You can ask about their skills, projects, background, or how to get in touch.`;
  return `I can help you explore ${profile.shortName}'s portfolio. Try asking “What are your skills?”, “Tell me about your projects”, or “How can I contact you?”. The live AI feature can be enabled by adding an API key on the server.`;
}

function appendMessage(text, sender, pending = false) {
  const container = document.createElement('div');
  container.className = `message ${sender}${pending ? ' pending' : ''}`;
  if (sender === 'bot') { const avatar = document.createElement('span'); avatar.className = 'message-avatar'; avatar.textContent = '✳'; container.appendChild(avatar); }
  const bubble = document.createElement('div'); bubble.className = 'message-text'; bubble.textContent = text; container.appendChild(bubble);
  $('#chat-messages').appendChild(container); $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
  return container;
}

function openChat() {
  lastFocus = document.activeElement;
  document.body.classList.add('chat-open');
  $('#chat-overlay').hidden = false;
  $('#chat-panel').classList.add('open');
  $('#chat-panel').setAttribute('aria-hidden', 'false');
  $('#chat-panel').inert = false;
  $('#chat-input').focus();
}
function closeChat() {
  document.body.classList.remove('chat-open');
  $('#chat-overlay').hidden = true;
  $('#chat-panel').classList.remove('open');
  $('#chat-panel').setAttribute('aria-hidden', 'true');
  $('#chat-panel').inert = true;
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}
async function askAssistant(question) {
  question = question.trim(); if (!question || activeRequests) return;
  appendMessage(question, 'user');
  $('#chat-input').value = '';
  const pending = appendMessage('Thinking ···', 'bot', true);
  $('#chat-send').disabled = true; activeRequests++;
  let response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const result = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }), signal: controller.signal });
      if (!result.ok) throw new Error(`Server returned ${result.status}`);
      const payload = await result.json();
      if (!payload.reply) throw new Error('Empty reply');
      response = payload.reply;
    } finally { clearTimeout(timer); }
  } catch (error) {
    response = localReply(question);
    if (aiReady) response += '\n\n(The AI connection is unavailable, so this is a basic offline answer.)';
  }
  pending.querySelector('.message-text').textContent = response;
  pending.classList.remove('pending');
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
  $('#chat-send').disabled = false; activeRequests--; $('#chat-input').focus();
}

async function initialize() {
  try { const response = await fetch('site-data.json'); if (!response.ok) throw new Error('Cannot load profile'); applyProfile(await response.json()); }
  catch { applyProfile(defaultProfile); }
  try {
    const response = await fetch('/api/status');
    const status = await response.json();
    aiReady = status.mode === 'ai';
  } catch { aiReady = false; }
  $('#assistant-mode').textContent = aiReady ? 'Live AI assistant online' : 'Demo assistant online';
  $('#chat-disclaimer').textContent = aiReady ? 'AI answers can make mistakes. Confirm important details.' : 'Demo responses until an AI API key is configured.';
  ['#nav-ai', '#hero-ai', '#feature-ai', '#floating-ai'].forEach(id => $(id).addEventListener('click', openChat));
  $('#chat-close').addEventListener('click', closeChat);
  $('#chat-overlay').addEventListener('click', closeChat);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#chat-panel').classList.contains('open')) closeChat();
    if (event.key === 'Tab' && $('#chat-panel').classList.contains('open')) {
      const focusables = [...$('#chat-panel').querySelectorAll('button:not(:disabled),input')];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $('#chat-form').addEventListener('submit', e => { e.preventDefault(); askAssistant($('#chat-input').value); });
  $('#suggested-questions').addEventListener('click', event => { const button = event.target.closest('[data-question]'); if (button) askAssistant(button.dataset.question); });
  const menu = $('#menu-toggle');
  menu.addEventListener('click', () => { const next = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(next)); $('#mobile-nav').hidden = !next; menu.setAttribute('aria-label', next ? 'Close menu' : 'Open menu'); });
  $('#mobile-nav').addEventListener('click', e => { if (e.target.closest('a')) { $('#mobile-nav').hidden = true; menu.setAttribute('aria-expanded', 'false'); } });
  const progress = $('#scroll-progress');
  window.addEventListener('scroll', () => { const max = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`; }, { passive: true });
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const glow = $('#cursor-glow'); document.addEventListener('pointermove', e => { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; }, { passive: true });
  } else $('#cursor-glow').style.display = 'none';
}
initialize();
