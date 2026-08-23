(()=>{
  const style=document.createElement('style');
  style.id='tour-card-layout-restore-style';
  style.textContent=`
    .tour-card>.tour-body>.tour-date{display:none!important}
    .tour-actions>.nearest-tour-date{grid-column:2;grid-row:1;min-height:46px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:7px 10px;border-radius:12px;background:var(--soft);color:var(--muted);line-height:1.12}
    .nearest-tour-date small{font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}
    .nearest-tour-date-line{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:3px}
    .nearest-tour-date strong{color:var(--green);font-size:11px;font-weight:950}
    .tour-countdown{display:inline-flex;align-items:center;padding:3px 6px;border:1px solid color-mix(in srgb,var(--green) 22%,transparent);border-radius:999px;background:color-mix(in srgb,var(--green) 9%,white);color:var(--green);font-size:8px;font-weight:900;white-space:nowrap;letter-spacing:.01em}
    @media(max-width:480px){.nearest-tour-date{padding:6px 8px}.nearest-tour-date small{font-size:7.4px}.nearest-tour-date strong{font-size:10px}.nearest-tour-date-line{gap:4px}.tour-countdown{padding:2px 5px;font-size:7.2px}}
  `;
  document.head.appendChild(style);

  function daysUntil(date){
    if(!(date instanceof Date)||Number.isNaN(date.getTime()))return null;
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const target=new Date(date.getFullYear(),date.getMonth(),date.getDate());
    return Math.max(0,Math.ceil((target-today)/86400000));
  }

  function getTourForCard(card){
    const byButton=card.querySelector('[data-tour]')?.dataset.tour;
    if(byButton)return (window.TOURS||[]).find(t=>t.id===byButton);
    const href=card.querySelector('.tour-media[href]')?.getAttribute('href')||'';
    return (window.TOURS||[]).find(t=>t.detailUrl===href);
  }

  function decorate(){
    document.querySelectorAll('#tourGrid .tour-card').forEach(card=>{
      const actions=card.querySelector('.tour-actions');
      if(!actions||actions.querySelector('.nearest-tour-date'))return;
      const tour=getTourForCard(card);
      if(!tour)return;
      const nearest=typeof window.nearestTourDate==='function'?window.nearestTourDate(tour):null;
      if(!nearest)return;
      const days=daysUntil(nearest.date);
      const box=document.createElement('span');
      box.className='nearest-tour-date';
      box.innerHTML=`<small>En Yakın Tarih</small><span class="nearest-tour-date-line"><strong>${nearest.label}</strong>${days===null?'':`<span class="tour-countdown">${days===0?'Bugün':`${days} gün kaldı`}</span>`}</span>`;
      actions.appendChild(box);
    });
  }

  decorate();
  const grid=document.getElementById('tourGrid');
  if(grid)new MutationObserver(decorate).observe(grid,{childList:true,subtree:false});
})();
