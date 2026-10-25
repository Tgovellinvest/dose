import re,pathlib
root=pathlib.Path(__file__).parent
html=(root/'index.html').read_text()
def inline_js(m):
    p=m.group(1); return '<script>\n'+(root/p).read_text()+'\n</script>'
html=re.sub(r'<script src="((?:data/)?[\w\.]+\.js)"></script>',inline_js,html)
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(root/'styles.css').read_text()+'\n</style>')
html=re.sub(r'<script>\nif \(\'serviceWorker\'.*?</script>','',html,flags=re.S)
html=html.replace('<link rel="manifest" href="manifest.json">','')
(root/'dist').mkdir(exist_ok=True)
(root/'dist/guia-treino.html').write_text(html)
print(len(html))
