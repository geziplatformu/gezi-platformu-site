if (window.TOURS) {
  const camliyayla = window.TOURS.find(t => t.id === 'camliyayla-doga-turu');
  if (camliyayla) camliyayla.image = 'https://sozsakarya.com/sites/1026/uploads/2026/03/07/dhbocyaxuae0dn8-1772840663.jpg';

  const doguEkspresi = window.TOURS.find(t => t.id === 'dogu-ekspresi-erzurum-kars-agri-van');
  if (doguEkspresi) doguEkspresi.image = '/assets/tours/dogu-ekspresi-cover.avif';
}

(() => {
  const monthMap = {ocak:0, şubat:1, subat:1, mart:2, nisan:3, mayıs:4, mayis:4, haziran:5, temmuz:6, ağustos:7, agustos:7, eylül:8, eylul:8, ekim:9, kasım:10, kasim:10, aralık:11, aralik:11};
  const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const weekdayMap = {pazar:0, pazartesi:1, salı:2, sali:2, çarşamba:3, carsamba:3, perşembe:4, persembe:4, cuma:5, cumartesi:6};
  const normalize = (value='') => String(value).toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim();
  const todayStart = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };

  function explicitNearest(text, today) {
    const candidates = [];
    for (const original of String(text || '').split('•').map(v => v.trim()).filter(Boolean)) {
      const clean = normalize(original).replace(/\([^)]*\)/g,'').trim();
      let day, month;
      let match = clean.match(/^(\d{1,2})\s+([a-zçğıöşü]+)/i);
      if (match) {
        day = Number(match[1]);
        month = monthMap[normalize(match[2])];
      } else {
        match = clean.match(/^(\d{1,2})\s*[–-]\s*\d{1,2}\s+([a-zçğıöşü]+)/i);
        if (match) {
          day = Number(match[1]);
          month = monthMap[normalize(match[2])];
        }
      }
      if (month === undefined || !day) continue;
      const year = month < today.getMonth() ? today.getFullYear() + 1 : today.getFullYear();
      const date = new Date(year, month, day);
      if (date >= today) candidates.push({date, label: original});
    }
    candidates.sort((a,b) => a.date - b.date);
    return candidates[0] || null;
  }

  function recurringNearest(text, today) {
    const normalized = normalize(text);
    if (!normalized.includes('her ')) return null;
    const months = [...new Set(Object.entries(monthMap).filter(([name]) => normalized.includes(name)).map(([,value]) => value))];
    const weekdays = [...new Set(Object.entries(weekdayMap).filter(([name]) => normalized.includes(name)).map(([,value]) => value))];
    if (!months.length || !weekdays.length) return null;
    for (let offset = 0; offset < 370; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      if (date.getFullYear() !== today.getFullYear()) break;
      if (months.includes(date.getMonth()) && weekdays.includes(date.getDay())) {
        return {date, label: `${date.getDate()} ${monthNames[date.getMonth()]}`};
      }
    }
    return null;
  }

  function nearestLabel(tour) {
    const today = todayStart();
    const choices = [recurringNearest(tour.dates, today), explicitNearest(tour.dates, today)].filter(Boolean).sort((a,b) => a.date - b.date);
    return choices.length ? choices[0].label : 'Yeni tarih bekleniyor';
  }

  function addStyles() {
    if (document.getElementById('nearest-tour-date-style')) return;
    const style = document.createElement('style');
    style.id = 'nearest-tour-date-style';
    style.textContent = `.tour-actions{align-items:stretch}.nearest-tour-date{min-height:46px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:7px 10px;border-radius:12px;background:var(--soft);color:var(--muted);line-height:1.12}.nearest-tour-date small{font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.nearest-tour-date strong{margin-top:3px;color:var(--green);font-size:11px;font-weight:950}@media(max-width:480px){.tour-actions{grid-template-columns:1fr 1fr}.nearest-tour-date{padding:6px 8px}.nearest-tour-date small{font-size:7.4px}.nearest-tour-date strong{font-size:10px}}`;
    document.head.appendChild(style);
  }

  function decorate() {
    if (!window.TOURS) return;
    document.querySelectorAll('#tourGrid .tour-card').forEach(card => {
      const actions = card.querySelector('.tour-actions');
      if (!actions || actions.querySelector('.nearest-tour-date')) return;
      const title = card.querySelector('h3')?.textContent?.trim();
      const tour = window.TOURS.find(item => item.title === title);
      if (!tour) return;
      const nearest = document.createElement('span');
      nearest.className = 'nearest-tour-date';
      nearest.innerHTML = `<small>En Yakın Tarih</small><strong>${nearestLabel(tour)}</strong>`;
      actions.appendChild(nearest);
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    addStyles();
    decorate();
    const grid = document.getElementById('tourGrid');
    if (grid) new MutationObserver(decorate).observe(grid, {childList:true, subtree:false});
  });
})();
