// ================= DOSE · anúncios (Google AdSense) =================
// Fica desligado até existir um ID de editor aprovado. Para ligar: ADS.client='ca-pub-XXXXXXXXXXXXXXXX'
// e, se quiser, ADS.slot='NNNNNNNNNN' (bloco criado no painel do AdSense). Sem ID, nada é carregado nem rastreado.
window.ADS={client:"",slot:"",on(){return !!this.client;}};
window.adSlot=function(where){ if(!ADS.on()) return ""; return `<div class="card sub ad" data-ad="${where}"><div class="tiny" style="text-align:center;color:var(--tx3)">Publicidade</div><ins class="adsbygoogle" style="display:block" data-ad-client="${ADS.client}" ${ADS.slot?`data-ad-slot="${ADS.slot}"`:""} data-ad-format="auto" data-full-width-responsive="true"></ins></div>`; };
window.adsMount=function(){ if(!ADS.on()) return; if(!document.querySelector('script[data-adsense]')){ const s=document.createElement('script'); s.async=true; s.dataset.adsense="1"; s.crossOrigin="anonymous"; s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+ADS.client; document.head.appendChild(s); }
  document.querySelectorAll('ins.adsbygoogle:not([data-done])').forEach(el=>{ el.dataset.done="1"; try{ (window.adsbygoogle=window.adsbygoogle||[]).push({}); }catch(e){} }); };
window.addEventListener('hashchange',()=>setTimeout(window.adsMount,50));
