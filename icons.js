// ================= DOSE · ícones próprios (SVG inline, traço 1.75, pontas redondas) =================
// Uso: I('bjj') ou I('bjj',22). Mapa de emojis antigos → ícone para dados legados.
(function(){
const P={barcode:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
 home:'<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/>',
 grid:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h16M12 4v16"/>',
 nutrition:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>',
 progress:'<path d="M4 17 10 11l4 4 6-7"/><path d="M15 8h5v5"/>',
 more:'<circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
 dose:'<path d="M4 18c4 0 5-9 10-10 2.5-.5 4.5-.5 6 0"/><circle cx="14" cy="8" r="2" fill="currentColor" stroke="none"/>',
 bjj:'<path d="M7 4h10l2 6-3 1v9H8v-9L5 10z"/><path d="M9 4l3 7 3-7"/><path d="M5 14h14"/>',
 box:'<path d="M7 12V8a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z"/><path d="M7 11H5.5A1.5 1.5 0 0 0 4 12.5v1A1.5 1.5 0 0 0 5.5 15H7"/><path d="M10 9h6"/>',
 run:'<circle cx="15" cy="4.5" r="1.6"/><path d="M13 8 9.5 10.5 11 13l-3 6"/><path d="M13 8l2.5 3.5 3.5 1"/><path d="M11 13l3 2 1 4"/>',
 football:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5l3.3 2.4-1.3 3.9H10l-1.3-3.9z"/><path d="M12 7.5V4.2M15.3 9.9l3.1-1M14 13.8l2 2.6M10 13.8l-2 2.6M8.7 9.9l-3.1-1"/>',
 swim:'<path d="M3 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/><path d="M3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/><circle cx="16.5" cy="7" r="1.8"/><path d="M4 13l5-5 4 3"/>',
 hyrox:'<path d="M4 18h16"/><rect x="6" y="9" width="5" height="9" rx="1"/><rect x="13" y="6" width="5" height="12" rx="1"/><path d="M8.5 9V6M15.5 6V4"/>',
 strength:'<path d="M6 9v6M18 9v6M3.5 10.5v3M20.5 10.5v3"/><path d="M6 12h12"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
 help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/>',
 user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
 book:'<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H19"/>',
 data:'<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
 cloud:'<path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a3.5 3.5 0 0 1 .5 7z"/>',
 shield:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
 timer:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M9.5 3h5"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M10 17h4"/>',
 medal:'<circle cx="12" cy="14" r="5.5"/><path d="M8.5 9.5 6 3h4l2 5 2-5h4l-2.5 6.5"/>',
 flame:'<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.5 3-5.5 3.5-9 2.5 1.5 3 4 3 5.5 1-.8 1.5-2 1.5-3.5 3 2 5 4.5 5 7.5 0 3.4-2.5 5.5-6.5 5.5z"/>',
 scale:'<path d="M12 4v16M5 20h14"/><path d="M4 8h16"/><path d="M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z"/>',
 ruler:'<path d="M3 16 16 3l5 5L8 21z"/><path d="M7 12l2 2M10 9l2 2M13 6l2 2"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 belloff:'<path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0M4 4l16 16"/>',
 swap:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
 plate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 female:'<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
 hourglass:'<path d="M7 3h10M7 21h10M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 play:'<path d="M8 5v14l11-7z"/>',
 card:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8 15h4"/>',
 share:'<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.9.3 5.5 2.7 5.5 5.8"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/>',
 flag:'<path d="M5 21V4h11l-1.5 3.5L16 11H5"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
 star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
 bike:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l4 7M13 5h3"/>',
 tennis:'<circle cx="12" cy="12" r="8"/><path d="M5 8c3 1 5 3 5 7M19 16c-3-1-5-3-5-7"/>',
 wave:'<path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
 volley:'<circle cx="12" cy="12" r="8"/><path d="M12 4c-2 3-2 6 0 8 3 1 6 0 8-2M4 12c3 0 6 1 8 4 1 3 0 6-2 8"/>',
 mountain:'<path d="M3 19 9 8l3.5 6L15 10l6 9z"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
 export:'<path d="M12 4v11M8 8l4-4 4 4"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 diamond:'<path d="M12 3l9 9-9 9-9-9z"/>'
};
const EMOJI={'🥋':'bjj','❤':'heart','❤️':'heart','◐':'nutrition','▦':'grid','✦':'spark','◎':'football','▶':'play','✓':'check','⏱':'timer','⚠':'warn','⏳':'hourglass','🔔':'bell','🔕':'belloff','♀':'female','▣':'card','⚖':'scale','🏋':'strength','✕':'x','🏆':'trophy','🥈':'medal','🥉':'medal','🥇':'trophy','👤':'user','📚':'book','☁':'cloud','💾':'data','◆':'diamond','⇄':'swap','🍽':'plate','↗':'progress','🔒':'lock','📈':'progress','🔥':'flame','👟':'run','🥊':'box','⚽':'football','🏊':'swim','🗓':'calendar','📏':'ruler','📐':'ruler','🏃':'run','⌂':'home','⋯':'more'};
window.I=function(name,size){ const k=P[name]?name:(EMOJI[name]||EMOJI[String(name).replace(/️/g,'')]||'dose'); const s=size?` style="width:${size}px;height:${size}px"`:''; return `<svg class="ico ico-${k}" viewBox="0 0 24 24" aria-hidden="true"${s}>${P[k]}</svg>`; };
window.ICONS=P; window.EMOJI_ICON=EMOJI;
// Medalhas DOSE: disco grafite, anel na cor do nível (bronze/prata/ouro), glifo do esporte, ponto ember quando conquistada e 1–3 marcas de nível.
const TIERC={0:'var(--line)',1:'var(--bronze)',2:'var(--silver)',3:'var(--gold)'};
window.medalSVG=function(ico,tier,size){ tier=+tier||0; const k=P[ico]?ico:(EMOJI[ico]||'medal'); const c=TIERC[tier]; const won=tier>0; const marks=[0,1,2].slice(0,tier).map(i=>`<rect x="${26+i*4.5}" y="52" width="3" height="3" rx="1" fill="${c}"/>`).join(''); const notches=[0,1,2].slice(tier).map(i=>`<rect x="${26+(i)*4.5}" y="52" width="3" height="3" rx="1" fill="var(--s3)"/>`).join('');
  return `<svg class="medal-svg" viewBox="0 0 64 64" width="${size||56}" height="${size||56}" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="var(--s2)" stroke="${c}" stroke-width="${won?3:1.5}" ${won?'':'stroke-dasharray="3 3"'}/><circle cx="32" cy="32" r="21" fill="var(--s3)"/><g transform="translate(20 18) scale(1)" style="color:${won?'var(--tx)':'var(--tx3)'}"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${P[k]}</svg></g>${won?'<circle cx="32" cy="7" r="3" fill="var(--ember)"/>':''}${marks}${notches}</svg>`; };
// Troca emojis legados que ainda estejam em dados (ícone de esporte, medalha, passo do tutorial).
window.ico=(x,size)=>window.I(x,size);
})();
