// ================= DOSE · v8.16 — presença individual com foto (aprovada pelo Tiago em 15/11/2026) =================
// Cada participante confirma a própria presença: foto feita na hora pela câmera (não sai do aparelho, não é guardada),
// no intervalo do horário do treino até 3 h depois, e com a localização perto do ponto (conferida no banco, função confirmar_presenca).
// Quem organizou não marca mais os outros. O organizador conta quando ao menos uma pessoa confirma (regra _esteve do banco).
(function(){
const U=()=>window.CLOUD&&CLOUD.user();
const api=(p,o)=>window.GRUPOS.api(p,o);
const rpc=(f,a)=>window.GRUPOS.rpc(f,a);
const MSG={cedo:'O treino ainda não começou. A confirmação abre no horário marcado.',tarde:'Passou de 3 horas do horário do treino. Já não dá para confirmar.',longe:'Você está longe do ponto do treino.',sem_local:'Esse treino não tem local para conferir.',sem_posicao:'Preciso da sua localização para confirmar.',nao_confirmado:'Só quem está confirmado no treino confirma presença.',sem_conta:'Entre na sua conta para confirmar.',presenca_so_pela_funcao:'Não consegui confirmar agora.'};
const erro=e=>{ const m=String((e&&e.message)||e||''); const k=Object.keys(MSG).find(x=>m.includes(x)); return k?MSG[k]:'Não consegui confirmar agora. Tente de novo.'; };
let pr=null;
const pos=()=>new Promise((ok,no)=>{ if(!navigator.geolocation) return no(new Error('sem_posicao')); navigator.geolocation.getCurrentPosition(p=>ok(p.coords),()=>no(new Error('sem_posicao')),{enableHighAccuracy:true,timeout:12000,maximumAge:0}); });

window.prPresenca=async(id)=>{ if(!U()){ toast('Entre na sua conta para confirmar'); return; }
  try{ const t=(await api(`treinos_abertos?id=eq.${id}&select=id,quando,ponto`))[0]; if(!t) return toast('Treino não encontrado');
    const q=new Date(t.quando).getTime(), agora=Date.now(); if(agora<q) return toast(MSG.cedo); if(agora>q+3*3600e3) return toast(MSG.tarde);
    pr={id,ocupado:false};
    sheet(`<div class="eyebrow" style="text-align:left">Presença</div><h3 style="margin-top:2px">Estive lá</h3>
     <p class="small">${esc(t.ponto)}. Uma foto sua treinando libera a confirmação. A foto não sai do aparelho e não é guardada.</p>
     <label class="btn em" style="margin-top:10px">${I('plus')} Tirar a foto<input id="prFoto" type="file" accept="image/*" capture="environment" hidden onchange="prFoto(this)"></label>
     <p class="tiny" id="prSt" style="margin:10px 0 0" role="status" aria-live="polite">Depois da foto, o app confere onde você está. Cada presença vale 5 pontos nos seus grupos.</p>
     <button class="btn sm ghost" style="margin-top:10px" onclick="closeSheet()">Agora não</button>`);
  }catch(e){ toast('Não consegui abrir agora'); } };

window.prFoto=async(inp)=>{ const f=inp.files&&inp.files[0]; if(!f||!pr||pr.ocupado) return; pr.ocupado=true; const st=document.getElementById('prSt'); const msg=t=>{ if(st) st.textContent=t; };
  try{ inp.value=''; msg('Conferindo o ponto…'); const c=await pos();
    const r=await rpc('confirmar_presenca',{p_treino:pr.id,p_lat:c.latitude,p_lng:c.longitude});
    S.presencasPonto=(S.presencasPonto||0)+1; save(); if(window.GRUPOS&&GRUPOS.cache) GRUPOS.cache.detalhe={};
    closeSheet(); toast('Presença confirmada · +5 pontos nos seus grupos'); if(window.sincEncontros) setTimeout(window.sincEncontros,500); if(window.A_regiao) try{ A_regiao(); }catch(e){}
  }catch(e){ msg(erro(e)); }
  finally{ if(pr) pr.ocupado=false; } };

// quem organizou já não marca os outros
window.rgPresenca=()=>toast('Cada pessoa confirma a própria presença, com uma foto.');
})();
