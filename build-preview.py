#!/usr/bin/env python3
"""Build a self-contained browser preview from index.html, styles.css, app.js, and site-data.json."""
from pathlib import Path
import json, re
root = Path(__file__).resolve().parent
html = (root/'index.html').read_text(encoding='utf8')
css = (root/'styles.css').read_text(encoding='utf8')
js = (root/'app.js').read_text(encoding='utf8')
profile = json.loads((root/'site-data.json').read_text(encoding='utf8'))
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n'+css+'\n</style>')
html = html.replace('<script src="app.js" defer></script>', '')
# Only change the profile loader. The chat still behaves as a demo without a server.
needle = "try { const response = await fetch('site-data.json'); if (!response.ok) throw new Error('Cannot load profile'); applyProfile(await response.json()); }"
replacement = "try { applyProfile(JSON.parse(document.querySelector('#embedded-profile').textContent)); }"
if needle not in js: raise ValueError('Profile loader not found in app.js')
js = js.replace(needle, replacement, 1)
json_str = json.dumps(profile,ensure_ascii=False).replace('<','\\u003c')
html = html.replace('</body>', '<script type="application/json" id="embedded-profile">'+json_str+'</script>\n<script>\n'+js+'\n</script>\n</body>')
(root/'portfolio-preview.html').write_text(html,encoding='utf8')
print('Wrote portfolio-preview.html')
