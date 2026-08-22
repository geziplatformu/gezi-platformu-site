(function(){
  const months={ocak:0,şubat:1,subat:1,mart:2,nisan:3,mayıs:4,mayis:4,haziran:5,temmuz:6,ağustos:7,agustos:7,eylül:8,eylul:8,ekim:9,kasım:10,kasim:10,aralık:11,aralik:11};
  const weekdays={pazar:0,pazartesi:1,salı:2,sali:2,çarşamba:3,carsamba:3,perşembe:4,persembe:4,cuma:5,cumartesi:6};
  const normalize=s=>String(s||'').toLocaleLowerCase('tr-TR').replace(/[()]/g,' ').replace(/\s+/g,' ').trim();
  window.nextRecurringDate=function(text,today){
    const n=normalize(text);
    if(!/boyunca her/.test(n))return null;
    const words=n.split(/[^a-zçğıöşü]+/i).filter(Boolean);
    const activeMonths=[...new Set(Object.entries(months).filter(([name])=>words.includes(name)).map(([,idx])=>idx))];
    const activeWeekdays=[...new Set(Object.entries(weekdays).filter(([name])=>words.includes(name)).map(([,idx])=>idx))];
    if(!activeMonths.length||!activeWeekdays.length)return null;
    for(let i=0;i<370;i++){
      const d=new Date(today);
      d.setDate(today.getDate()+i);
      if(activeMonths.includes(d.getMonth())&&activeWeekdays.includes(d.getDay())){
        return {date:d,label:new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'long',weekday:'long'}).format(d)};
      }
    }
    return null;
  };
  if(typeof window.renderTours==='function')window.renderTours();
})();
