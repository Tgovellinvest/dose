// ================= DOSE · v8.16 — "Quem está dentro também está lá" (pedido do Tiago em 15/11/2026) =================
// Cartão discreto, sem banner nem lembrete: fim da Comunidade e da Conta. Conta @dose.use no Instagram e no TikTok (conferidas no Brand Book).
(function(){
const V=window.VIEWS;
const card=()=>`<div class="card sg-seg" style="margin-top:18px"><div class="eyebrow" style="text-align:left">Fora do app</div><b>Quem está dentro também está lá.</b><p class="small" style="margin:4px 0 10px">@dose.use no Instagram e no TikTok.</p><div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn sm sec" style="width:auto" href="https://www.instagram.com/dose.use/" target="_blank" rel="noopener">Instagram</a><a class="btn sm sec" style="width:auto" href="https://www.tiktok.com/@dose.use" target="_blank" rel="noopener">TikTok</a></div></div>`;
const _vc=V.comunidade; if(_vc) V.comunidade=(p)=>{ const h=_vc(p); return h+(/sg-seg/.test(h)?'':card()); };
const _vm=V.mais; if(_vm) V.mais=(p)=>{ const h=_vm(p); return (p&&p.t==='conta')?h+(/sg-seg/.test(h)?'':card()):h; };
})();
