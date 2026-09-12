(()=>{
  const monthMap={ocak:0,şubat:1,subat:1,mart:2,nisan:3,mayıs:4,mayis:4,haziran:5,temmuz:6,ağustos:7,agustos:7,eylül:8,eylul:8,ekim:9,kasım:10,kasim:10,aralık:11,aralik:11};
  const weekdayMap={pazar:0,pazartesi:1,salı:2,sali:2,çarşamba:3,carsamba:3,perşembe:4,persembe:4,cuma:5,cumartesi:6};
  const norm=(s='')=>s.toLocaleLowerCase('tr-TR').replace(/[()]/g,' ').replace(/\s+/g,' ').trim();
  function trToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const obj=Object.fromEntries(parts.map(p=>[p.type,p.value]));return new Date(Number(obj.year),Number(obj.month)-1,Number(obj.day));}
  function yearForMonth(month,today,explicitYear){if(explicitYear)return explicitYear;let y=today.getFullYear();if(month<today.getMonth()-3)y++;return y;}
  function parseExplicitPiece(piece,today){const clean=norm(piece).replace(/ara tatil|yılbaşı özel|somestir özel|sömestir özel|ramazan dönemi|ramazan bayramı|indirimli dönem/g,'').trim();const months=Object.keys(monthMap).sort((a,b)=>b.length-a.length);const monthPattern=months.join('|');let m=clean.match(new RegExp(`(\\d{1,2})\\s*[-–]\\s*(\\d{1,2})\\s+(${monthPattern})(?:\\s+(\\d{4}))?`,'i'));if(m){const month=monthMap[norm(m[3])],year=yearForMonth(month,today,m[4]?Number(m[4]):null);return {date:new Date(year,month,Number(m[1])),label:piece.trim()};}m=clean.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern})\\s*[-–]\\s*(\\d{1,2})\\s+(${monthPattern})(?:\\s+(\\d{4}))?`,'i'));if(m){const month=monthMap[norm(m[2])],year=yearForMonth(month,today,m[5]?Number(m[5]):null);return {date:new Date(year,month,Number(m[1])),label:piece.trim()};}m=clean.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern})(?:\\s+(\\d{4}))?`,'i'));if(m){const month=monthMap[norm(m[2])],year=yearForMonth(month,today,m[3]?Number(m[3]):null);return {date:new Date(year,month,Number(m[1])),label:piece.trim()};}return null;}
  function activeMonthsFromText(n){const monthNames=Object.keys(monthMap).sort((a,b)=>b.length-a.length);const pattern=monthNames.join('|');const range=n.match(new RegExp(`(${pattern})\\s*[-–]\\s*(${pattern})`,'i'));if(range){const start=monthMap[norm(range[1])],end=monthMap[norm(range[2])],months=[];for(let m=start;;m=(m+1)%12){months.push(m);if(m===end||months.length>=12)break;}return months;}const words=n.split(/[^a-zçğıöşü]+/i).filter(Boolean);return [...new Set(Object.entries(monthMap).filter(([name])=>words.includes(name)).map(([,idx])=>idx))];}
  function nextRecurringDate(text,today){const n=norm(text);if(!/boyunca her/.test(n))return null;const words=n.split(/[^a-zçğıöşü]+/i).filter(Boolean);const activeMonths=activeMonthsFromText(n);const weekdays=[...new Set(Object.entries(weekdayMap).filter(([name])=>words.includes(name)).map(([,idx])=>idx))];if(!activeMonths.length||!weekdays.length)return null;for(let i=1;i<370;i++){const d=new Date(today);d.setDate(today.getDate()+i);if(activeMonths.includes(d.getMonth())&&weekdays.includes(d.getDay()))return {date:d,label:new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'long',weekday:'long'}).format(d)};}return null;}
  function correctedNearestTourDate(t){const today=trToday(),recurring=nextRecurringDate(t?.dates||'',today);if(recurring)return recurring;const items=String(t?.dates||'').split('•').map(x=>x.trim()).filter(Boolean).map(x=>parseExplicitPiece(x,today)).filter(Boolean).filter(x=>x.date>today).sort((a,b)=>a.date-b.date);return items[0]||null;}
  window.nearestTourDate=correctedNearestTourDate;

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
    const today=trToday();
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
      if(!actions)return;
      actions.querySelector('.nearest-tour-date')?.remove();
      const tour=getTourForCard(card);
      if(!tour)return;
      const nearest=window.nearestTourDate(tour);
      if(!nearest)return;
      const days=daysUntil(nearest.date);
      const box=document.createElement('span');
      box.className='nearest-tour-date';
      box.innerHTML=`<small>En Yakın Tarih</small><span class="nearest-tour-date-line"><strong>${nearest.label}</strong>${days===null?'':`<span class="tour-countdown">${days} gün kaldı</span>`}</span>`;
      actions.appendChild(box);
    });
  }

  decorate();
  const grid=document.getElementById('tourGrid');
  if(grid)new MutationObserver(decorate).observe(grid,{childList:true,subtree:false});
})();
