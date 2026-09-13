(()=>{
  if(window.__gpNearestDateFixLoaded)return;
  window.__gpNearestDateFixLoaded=true;
  const monthMap={ocak:0,şubat:1,subat:1,mart:2,nisan:3,mayıs:4,mayis:4,haziran:5,temmuz:6,ağustos:7,agustos:7,eylül:8,eylul:8,ekim:9,kasım:10,kasim:10,aralık:11,aralik:11};
  const weekdayMap={pazar:0,pazartesi:1,salı:2,sali:2,çarşamba:3,carsamba:3,perşembe:4,persembe:4,cuma:5,cumartesi:6};
  const norm=(s='')=>s.toLocaleLowerCase('tr-TR').replace(/[()]/g,' ').replace(/\s+/g,' ').trim();
  function trToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));return new Date(Number(o.year),Number(o.month)-1,Number(o.day));}
  function yearForMonth(month,today,explicitYear){if(explicitYear)return explicitYear;let y=today.getFullYear();if(month<today.getMonth()-3)y++;return y;}
  function parseExplicitPiece(piece,today){
    const clean=norm(piece).replace(/ara tatil|yılbaşı özel|somestir özel|sömestir özel|ramazan dönemi|ramazan bayramı|indirimli dönem/g,'').trim();
    const months=Object.keys(monthMap).sort((a,b)=>b.length-a.length), mp=months.join('|');
    let m=clean.match(new RegExp(`(\\d{1,2})\\s*[-–]\\s*(\\d{1,2})\\s+(${mp})(?:\\s+(\\d{4}))?`,'i'));
    if(m){const mo=monthMap[norm(m[3])],y=yearForMonth(mo,today,m[4]?Number(m[4]):null);return {date:new Date(y,mo,Number(m[1])),label:piece.trim()};}
    m=clean.match(new RegExp(`(\\d{1,2})\\s+(${mp})\\s*[-–]\\s*(\\d{1,2})\\s+(${mp})(?:\\s+(\\d{4}))?`,'i'));
    if(m){const mo=monthMap[norm(m[2])],y=yearForMonth(mo,today,m[5]?Number(m[5]):null);return {date:new Date(y,mo,Number(m[1])),label:piece.trim()};}
    m=clean.match(new RegExp(`(\\d{1,2})\\s+(${mp})(?:\\s+(\\d{4}))?`,'i'));
    if(m){const mo=monthMap[norm(m[2])],y=yearForMonth(mo,today,m[3]?Number(m[3]):null);return {date:new Date(y,mo,Number(m[1])),label:piece.trim()};}
    return null;
  }
  function recurringMonths(text){
    const n=norm(text), names=Object.keys(monthMap).sort((a,b)=>b.length-a.length), found=[];
    for(const name of names){const i=n.indexOf(name);if(i>=0)found.push({i,month:monthMap[name]});}
    found.sort((a,b)=>a.i-b.i);
    const unique=[];for(const f of found)if(!unique.some(x=>x.month===f.month))unique.push(f);
    if(unique.length>=2&&/[-–].*boyunca|boyunca.*[-–]/.test(n)){
      const a=unique[0].month,b=unique[1].month,out=[];let m=a;for(let k=0;k<12;k++){out.push(m);if(m===b)break;m=(m+1)%12;}return out;
    }
    return unique.map(x=>x.month);
  }
  function nextRecurringDate(text,today){
    const n=norm(text);if(!/boyunca her/.test(n))return null;
    const months=recurringMonths(n);
    const words=n.split(/[^a-zçğıöşü]+/i).filter(Boolean);
    const weekdays=[...new Set(Object.entries(weekdayMap).filter(([name])=>words.includes(name)).map(([,idx])=>idx))];
    if(!months.length||!weekdays.length)return null;
    for(let i=1;i<=370;i++){const d=new Date(today);d.setDate(today.getDate()+i);if(months.includes(d.getMonth())&&weekdays.includes(d.getDay()))return {date:d,label:new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'long',weekday:'long'}).format(d)};}
    return null;
  }
  function strictNearest(t){const today=trToday(),rec=nextRecurringDate(t.dates||'',today);if(rec)return rec;const items=String(t.dates||'').split('•').map(x=>x.trim()).filter(Boolean).map(x=>parseExplicitPiece(x,today)).filter(Boolean).filter(x=>x.date>today).sort((a,b)=>a.date-b.date);return items[0]||null;}
  function apply(){
    if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
    const tours=window.TOURS||[];
    document.querySelectorAll('#tourGrid .tour-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent?.trim();
      const t=tours.find(x=>x.title===title);if(!t)return;
      const nearest=strictNearest(t), body=card.querySelector('.tour-body');if(!body)return;
      let box=card.querySelector('.tour-date');
      if(!nearest){if(box)box.remove();return;}
      if(!box){box=document.createElement('div');box.className='tour-date';const actions=card.querySelector('.tour-actions');body.insertBefore(box,actions||null);}
      box.innerHTML=`<strong>En Yakın Tarih</strong>${nearest.label}`;
    });
  }
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const grid=document.getElementById('tourGrid');if(grid)new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-filter]'))setTimeout(schedule,0)});
})();
