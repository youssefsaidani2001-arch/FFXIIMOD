#!/usr/bin/env python3
"""Assembles editor/index.html from src/page.html, src/core.js and the data JSON files."""
import json, pathlib
here = pathlib.Path(__file__).parent
page = (here / 'src' / 'page.html').read_text(encoding='utf-8')
core = (here / 'src' / 'core.js').read_text(encoding='utf-8')
def js(obj):
    return json.dumps(obj, separators=(',', ':')).replace('</', '<\\/').replace('<!--', '<\\!--')
schema = json.loads((here / 'data' / 'bpack_schema.json').read_text(encoding='utf-8'))
lists = json.loads((here / 'data' / 'lists.json').read_text(encoding='utf-8'))
out = page.replace('/*__CORE__*/', core).replace('/*__SCHEMA__*/{}', js(schema)).replace('/*__LISTS__*/{}', js(lists))
(here / 'index.html').write_text(out, encoding='utf-8')
print('wrote', here / 'index.html', len(out), 'bytes')
