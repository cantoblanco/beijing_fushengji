"""Rebuild UTF-8 browser data from the untouched GBK C++/RC resources."""
from pathlib import Path
import json,re,shutil
root=Path(__file__).resolve().parents[1]
out=root/'docs'; assets=out/'assets'
(assets/'sound').mkdir(parents=True,exist_ok=True)
def read(name): return (root/name).read_bytes().decode('gb18030')
s=read('SelectionDlg.cpp')
def rows(name):
 text=re.search(r'\b'+name+r'\s*\[[^]]+\]\s*=\s*\{(.*?)\n\};',s,re.S)[1]
 return [json.loads('['+x+']') for x in re.findall(r'\{([^{}]+)\}',text)]
rc=read('DualListDemo.rc'); dialogs={}
for match in re.finditer(r'(IDD_\w+) DIALOG(?:EX)?\b(.*?)\nEND',rc,re.S):
 strings=re.findall(r'(?:LTEXT|CTEXT|RTEXT)\s+"((?:[^"\\]|\\.)*)"', match[2])
 dialogs[match[1]]=[json.loads('"'+x+'"') for x in strings if x and x not in ['Static','Some String','Header','Footer text here']]
boss=''.join(json.loads('"'+x+'"') for x in re.findall(r'str\+?=\s*"((?:[^"\\]|\\.)*)"',read('BossComeDlg.cpp')))
names=re.findall(r'strcpy\(m_chDrugName\[(\d+)\],"([^"]*)"\)',s[:s.index('CSelectionDlg::~')]); names=dict((int(i),n) for i,n in names)
data={'goods':[names[i] for i in range(8)],'commercial':rows('gameMessages'),'health':rows('random_event'),'theft':rows('random_steal_event'),'dialogs':dialogs,'tips':[x.split('\t') for x in read('Tips.txt').splitlines() if x.strip() and not x.startswith(';')],'news':read('Ticker.txt').splitlines(),'boss':boss}
(out/'js'/'original-data.js').write_text('/* Generated from original source; see tools/extract-original.py. */\nexport default '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
for p in (root/'sound').glob('*'):
 if p.suffix.lower()=='.wav': shutil.copy(p,assets/'sound'/p.name)
for p in (root/'res').glob('*.ico'): shutil.copy(p,assets/p.name)
from PIL import Image
for src,target in [('res/subway.bmp','subway.png'),('res/logo.bmp','logo.png'),('res/cover.bmp','cover.png'),('news.bmp','news.png'),('riji.bmp','diary.png')]:
 Image.open(root/src).save(assets/target)
helptext=bytes(b^0x52 for b in (root/'helpinfo').read_bytes()).decode('gb18030')
helptext=helptext.replace('<HEAD>','<HEAD><meta charset="UTF-8">').replace('background="backblue.gif"','style="background:#e4f0f9;font-family:serif;line-height:1.8;max-width:900px;margin:24px auto;padding:16px"')
(out/'help.html').write_text('\n'.join(x.rstrip() for x in helptext.splitlines())+'\n')
(out/'license.txt').write_text((root/'license.txt').read_text().rstrip()+'\n')
print('Extracted',len(data['commercial']),len(data['health']),len(data['theft']),'events;',len(dialogs),'dialogs')
