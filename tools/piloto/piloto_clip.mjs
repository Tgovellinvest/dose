// Piloto do DOSE: o CLIP sugere alimentos da base a partir de uma foto, no próprio computador.
// Mede: licença e tamanho de cada modelo (direto do Hugging Face), tempo por foto e acerto (top-1, top-3, top-5).
// Uso: npm install && npm run piloto -- [--modelos id1,id2] [--dtype q8] [--k 5]
// Não envia as fotos para lugar nenhum: o modelo é baixado uma vez e roda localmente.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url';
import {metricas,porAlimento} from './metricas.mjs';
const AQUI=path.dirname(fileURLToPath(import.meta.url)), RAIZ=path.resolve(AQUI,'../..');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?process.argv[i+1]:d; };
const MODELOS=(arg('modelos','Xenova/clip-vit-base-patch32')).split(','); const DTYPE=arg('dtype','q8'); const K=+arg('k',5);
const log=(...a)=>console.log(...a);

// 1. Rótulos: precisam existir exatamente na base de alimentos do DOSE
const sandbox={window:{}}; vm.createContext(sandbox);
for(const f of fs.readdirSync(path.join(RAIZ,'data')).filter(x=>/^foods.*\.js$/.test(x))) vm.runInContext(fs.readFileSync(path.join(RAIZ,'data',f),'utf8'),sandbox);
const BASE=new Set((sandbox.window.FOODS||[]).map(f=>f.n));
const ROTULOS=JSON.parse(fs.readFileSync(path.join(AQUI,'rotulos.json'),'utf8'));
const fora=ROTULOS.filter(r=>!BASE.has(r.n)); if(fora.length){ console.error('Rótulos que não existem na base:',fora.map(r=>r.n)); process.exit(1); }
const porEn=new Map(ROTULOS.map(r=>[r.en,r.n]));

// 2. Verdade: arquivo;alimentos (separados por |), nomes exatamente como em rotulos.json
const csv=path.join(AQUI,'verdade.csv');
if(!fs.existsSync(csv)){ console.error('Falta tools/piloto/verdade.csv (copie verdade.exemplo.csv e preencha com as suas fotos em fotos/).'); process.exit(1); }
const nomes=new Set(ROTULOS.map(r=>r.n)); const LINHAS=fs.readFileSync(csv,'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l=>{ const [arquivo,al]=l.split(';'); return {arquivo:arquivo.trim(),verdade:al.split('|').map(s=>s.trim())}; });
const erros=[]; LINHAS.forEach(l=>{ if(!fs.existsSync(path.join(AQUI,'fotos',l.arquivo))) erros.push('foto não encontrada: '+l.arquivo); l.verdade.forEach(v=>{ if(!nomes.has(v)) erros.push(`${l.arquivo}: "${v}" não está em rotulos.json`); }); });
if(erros.length){ console.error(erros.join('\n')); process.exit(1); }
log(`${LINHAS.length} fotos, ${ROTULOS.length} rótulos, k=${K}, dtype=${DTYPE}`);
if(LINHAS.length<20) log('AVISO: menos de 20 fotos: o resultado é só indicativo, não use para decidir.');

// 3. Licença e tamanho direto do Hugging Face
async function infoHF(id){ try{ const r=await fetch(`https://huggingface.co/api/models/${id}?blobs=true`); if(!r.ok) return {erro:'HTTP '+r.status}; const j=await r.json();
  const onnx=(j.siblings||[]).filter(s=>/\.onnx$/.test(s.rfilename)).map(s=>({arquivo:s.rfilename,mb:+((s.size||0)/1e6).toFixed(1)}));
  return {licenca:j.cardData?.license||'não informada',tags:(j.tags||[]).filter(t=>/license|dataset/.test(t)),onnx}; }catch(e){ return {erro:String(e)}; } }
const tam=d=>{ let t=0; if(!fs.existsSync(d)) return 0; for(const f of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,f.name); t+=f.isDirectory()?tam(p):fs.statSync(p).size; } return t; };

const {pipeline,env}=await import('@huggingface/transformers');
const SAIDA=[]; 
for(const id of MODELOS){
  log('\n== '+id); const info=await infoHF(id); log('licença:',info.licenca||info.erro,'| onnx:',JSON.stringify(info.onnx));
  if(/other|apple/i.test(String(info.licenca))) log('ATENÇÃO: licença "other": leia o texto dos termos antes de usar em produto.');
  const t0=Date.now(); const clf=await pipeline('zero-shot-image-classification',id,{dtype:DTYPE}); const carga=Date.now()-t0;
  const cacheMB=+(tam(env.cacheDir||'')/1e6).toFixed(1); log(`carga ${carga} ms, cache ${cacheMB} MB`);
  const labels=ROTULOS.map(r=>r.en); const prev=[]; const tempos=[];
  for(const l of LINHAS){ const t1=Date.now(); const out=await clf(path.join(AQUI,'fotos',l.arquivo),labels,{hypothesis_template:'a photo of {}, a meal.'}); tempos.push(Date.now()-t1);
    const ranking=out.sort((a,b)=>b.score-a.score).map(o=>porEn.get(o.label)); prev.push({arquivo:l.arquivo,verdade:l.verdade,ranking}); }
  tempos.sort((a,b)=>a-b); const m=metricas(prev,K);
  log('métricas',JSON.stringify(m)); log('tempo por foto: mediana',tempos[tempos.length>>1],'ms');
  SAIDA.push({modelo:id,dtype:DTYPE,info,cargaMs:carga,cacheMB,medianaMs:tempos[tempos.length>>1],metricas:m,porAlimento:porAlimento(prev,K),detalhe:prev.map(p=>({arquivo:p.arquivo,verdade:p.verdade,top5:p.ranking.slice(0,5)}))});
}
fs.mkdirSync(path.join(AQUI,'resultado'),{recursive:true}); const arq=path.join(AQUI,'resultado',`piloto-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.json`);
fs.writeFileSync(arq,JSON.stringify({data:new Date().toISOString(),fotos:LINHAS.length,rotulos:ROTULOS.length,resultados:SAIDA},null,1));
log('\nResultado salvo em',arq);
