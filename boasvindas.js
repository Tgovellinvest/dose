// ================= DOSE · v7.1 — "Do excesso à dose" nas boas-vindas (aprovado pelo Tiago no DOSE Studio em 08/11/2026) =================
// Uma nuvem de grão (o excesso) se organiza na curva do símbolo; o ponto ember assenta na dose certa; depois entra "Vida na dose.".
// Uma vez só, sem loop, sem brilho. Canvas 2D, custo zero. Reduzir movimento: desenha o estado final direto.
(function(){
const V=window.VIEWS, A=window.AFTER;
const reduz=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICONE=`<div style="margin:14px 0;color:var(--ember)">${window.I?I('dose',64):''}</div>`;

const _ob=V.onboard; if(_ob) V.onboard=(p)=>{ let h=_ob(p); if(!h.includes(ICONE)||!h.includes('m2-kin')) return h;
  h=h.replace(ICONE,'<div class="m4-exc" aria-hidden="true"><canvas></canvas></div>');
  if(!reduz()) h=h.replace('class="m2-kin"','class="m2-kin m4-espera"').replace(/animation-delay:(\d+)ms/g,(m,d)=>`animation-delay:${+d+2300}ms`);
  return h; };

function rodar(){ const box=document.querySelector('.view .m4-exc'); if(!box||box.dataset.ok) return; box.dataset.ok=1;
  const cv=box.querySelector('canvas'), x=cv.getContext('2d'); const W=box.clientWidth, H=box.clientHeight, D=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*D; cv.height=H*D; x.setTransform(D,0,0,D,0,0);
  const curva=u=>{ const p0=[.04,.86],p1=[.30,.84],p2=[.40,.22],p3=[.96,.16]; const a=(1-u)**3,b=3*(1-u)**2*u,c=3*(1-u)*u*u,d=u**3;
    return [W*(a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0]),H*(a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1])]; };
  let s=7; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  const P=[]; for(let i=0;i<1600;i++){ const u=r(); const [tx,ty]=curva(u); const ang=r()*Math.PI*2, rad=Math.pow(r(),.6)*Math.min(W,H*1.6)*(i%9===0?.7:.36);
    P.push({ox:W*.5+Math.cos(ang)*rad, oy:H*.5+Math.sin(ang)*rad*.7, tx, ty:ty+(r()-.5)*(i%7===0?8:2.5), d:r()*.5+u*.25, s:r()<.1?2:1.3, a:.45+r()*.5}); }
  const ease=t=>1-Math.pow(1-t,4); const fim=reduz(); let t0=null;
  const tom=getComputedStyle(document.documentElement).getPropertyValue('--bone').trim()||'#D8D2C2';
  const ember=getComputedStyle(document.documentElement).getPropertyValue('--ember').trim()||'#E4572E';
  function frame(ts){ if(!box.isConnected) return; if(t0===null) t0=ts; const t=fim?99:(ts-t0)/1000;
    x.clearRect(0,0,W,H); x.fillStyle=tom;
    for(const p of P){ const k=Math.max(0,Math.min(1,(t-.4-p.d)/1.8)), e=ease(k); x.globalAlpha=p.a*(.55+.45*e); x.fillRect(p.ox+(p.tx-p.ox)*e,p.oy+(p.ty-p.oy)*e,p.s,p.s); }
    x.globalAlpha=1; const kd=Math.max(0,Math.min(1,(t-2.4)/.6)); if(kd>0){ const [dx,dy]=curva(.62); const rr=8*(kd<.7?kd/.7*1.15:1.15-(kd-.7)/.3*.15); x.fillStyle=ember; x.beginPath(); x.arc(dx,dy,rr,0,Math.PI*2); x.fill(); }
    if(t<3.2) requestAnimationFrame(frame); }
  requestAnimationFrame(frame); }

const _a=A.onboard; A.onboard=(p)=>{ if(_a) _a(p); rodar(); };
})();
