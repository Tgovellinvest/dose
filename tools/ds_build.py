# DOSE · gera o Design System vivo (design-system/) a partir do app real.
# Overview = cópia do app com dados de demonstração, isolada: armazenamento próprio e sem rede externa.
# Uso: python3 build.py && python3 tools/ds_build.py
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
app = (root / 'dist' / 'guia-treino.html').read_text()
iso = r"""<script>
/* DS Overview: isolado do app real. Armazenamento separado e nenhuma chamada externa. */
(function(){
  var mem={}, pre='dsdemo:';
  var fake={getItem:function(k){return Object.prototype.hasOwnProperty.call(mem,pre+k)?mem[pre+k]:null;},
    setItem:function(k,v){mem[pre+k]=String(v);}, removeItem:function(k){delete mem[pre+k];},
    clear:function(){mem={};}, key:function(i){return Object.keys(mem)[i]||null;}, get length(){return Object.keys(mem).length;}};
  try{ Object.defineProperty(window,'localStorage',{value:fake,configurable:true}); }catch(e){}
  try{ Object.defineProperty(window,'sessionStorage',{value:fake,configurable:true}); }catch(e){}
  var of=window.fetch; window.fetch=function(u,o){ var s=String(u&&u.url||u); if(/^https?:/i.test(s)&&s.indexOf(location.origin)!==0&&!/fonts\.(googleapis|gstatic)\.com|cdnjs/.test(s)) return Promise.reject(new Error('DS: rede desligada')); return of.apply(this,arguments); };
  var d=function(n){var x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10);};
  var S={onboarded:true,tutorialVisto:true,perfil:{nome:'Membro Demo',sexo:'m',idade:32,altura:178,peso:79,objetivo:'hipertrofia',nivel:'intermediario',diasMusc:['seg','qua','sex'],esportes:{corrida:['ter','qui'],hyrox:['sab']},instagram:'membro.demo'},
    logs:[], bjj:[], checkins:[{data:d(7),peso:79.6,cintura:84,sono:7},{data:d(0),peso:79.1,cintura:83.5,sono:7.5}],
    cardio:[{id:'c1',data:d(1),tipo:'Corrida',dist:6,min:33,intens:'baixa'},{id:'c2',data:d(3),tipo:'Corrida',dist:5,min:24,intens:'alta'},{id:'c3',data:d(5),tipo:'Corrida',dist:10,min:58,intens:'baixa'}],
    vdot:{v:41.8,data:d(5),km:3,min:13.5}};
  fake.setItem('guia-treino-v1',JSON.stringify(S));
})();
</script>"""
app = re.sub(r'<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]+"></script>', '', app)
app = app.replace('<head>', '<head>\n' + iso, 1)
app = app.replace('<title>', '<meta name="robots" content="noindex"><title>DS Overview · ', 1)
(root / 'design-system' / 'overview.html').write_text(app)
print('overview', len(app))
