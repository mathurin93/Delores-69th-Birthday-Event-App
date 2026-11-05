#!/usr/bin/env python3
"""Regenerate app.js and a self-contained HTML file after editing guest/program data."""
from pathlib import Path
import base64
import json
import re

root = Path(__file__).resolve().parent
seating = json.loads((root / 'guests.json').read_text(encoding='utf-8'))
program = json.loads((root / 'program.json').read_text(encoding='utf-8'))
assert len(seating) == 15 and len(program) == 13
source_js = (root / 'app-main.js').read_text(encoding='utf-8')
data_js = ('// DATA SOURCE: guests.json and program.json (rebuild with python build.py)\n'
           + 'const EVENT_GUESTS = ' + json.dumps(seating, ensure_ascii=False, indent=2) + ';\n'
           + 'const EVENT_PROGRAM = ' + json.dumps(program, ensure_ascii=False, indent=2) + ';\n\n')
app_js = data_js + source_js
(root / 'app.js').write_text(app_js, encoding='utf-8')

html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + (root / 'styles.css').read_text(encoding='utf-8') + '\n</style>')
html = html.replace('<script src="app.js" defer></script>', '<script>\n' + app_js.replace('</script', '<\\/script') + '\n</script>')
portrait_base64 = base64.b64encode((root / 'assets/delores-portrait.webp').read_bytes()).decode('ascii')
html = html.replace('assets/delores-portrait.webp', 'data:image/webp;base64,' + portrait_base64)
(root / 'Delores-69th-Birthday-App.html').write_text(html, encoding='utf-8')
print('Built app.js and Delores-69th-Birthday-App.html')
