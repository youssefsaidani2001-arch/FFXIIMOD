#!/usr/bin/env python3
"""Assembles editor/index.html: src/page.html + all scripts + data (bpack schema, name lists, docs/formats specs).

  python3 editor/build.py                         -> editor/index.html with every editor
  python3 editor/build.py --out X.html            -> write elsewhere (tests use a temp file)
  python3 editor/build.py --only tim2,ard          -> include only these editor modules (plus battlepack, hex, pack, vbf)
"""
import argparse, json, pathlib
here = pathlib.Path(__file__).parent
repo = here.parent
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=str(here / 'index.html'))
ap.add_argument('--only', default='')
args = ap.parse_args()
def js(obj):
    return json.dumps(obj, separators=(',', ':')).replace('</', '<\\/').replace('<!--', '<\\!--')
schema = json.loads((here / 'data' / 'bpack_schema.json').read_text(encoding='utf-8'))
lists = json.loads((here / 'data' / 'lists.json').read_text(encoding='utf-8'))
specs = {}
for p in sorted((repo / 'docs' / 'formats').glob('*.json')):
    try:
        spec = json.loads(p.read_text(encoding='utf-8'))
        specs[spec.get('id', p.stem)] = spec
    except Exception as e:
        print('skip spec', p.name, e)
src = here / 'src'
order = ['core.js', 'registry.js', 'spec.js', 'vbf.js', 'packs.js', 'container_doc.js']
BASE = {'battlepack', 'hex', 'pack', 'vbf'}
only = {s.strip() for s in args.only.split(',') if s.strip()}
editors = sorted((src / 'editors').glob('*.js'), key=lambda p: (p.name != 'battlepack.js', p.name in ('pack.js', 'hex.js'), p.name))
if only:
    editors = [p for p in editors if p.stem in only or p.stem in BASE]
parts = [(src / n).read_text(encoding='utf-8') for n in order]
parts.append('FX.bpackSchema = ' + js(schema) + ';\nFX.lists = ' + js(lists) + ';\nFX.specs = ' + js(specs) + ';')
parts += [p.read_text(encoding='utf-8') for p in editors]
parts.append((src / 'suite.js').read_text(encoding='utf-8'))
parts.append('FX.boot();')
page = (src / 'page.html').read_text(encoding='utf-8')
out = page.replace('/*__SCRIPTS__*/', '\n'.join(parts).replace('</script', '<\\/script'))
pathlib.Path(args.out).write_text(out, encoding='utf-8')
print('wrote', args.out, len(out), 'bytes;', len(specs), 'specs;', len(editors), 'editors:', ', '.join(p.stem for p in editors))
