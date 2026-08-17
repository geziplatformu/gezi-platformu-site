const grid=document.getElementById('tourGrid');
const modal=document.getElementById('tourModal');
const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
const filterButtons=[...document.querySelectorAll('[data-filter]')];

document.getElementById('year').textContent=new Date().getFullYear();

menuToggle?.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(open));
});

document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
}));

function whatsappLink(t){
  const message=`Merhaba, ${t.title} (${t.subtitle}) turu hakkında bilgi almak istiyorum. Güncel kontenjan ve rezervasyon bilgisi paylaşabilir misiniz?`;
  return `https://wa.me/905374978441?text=${encodeURIComponent(message)}`;
}

function tourCard(t){
  return `<article class="tour-card" data-badge="${t.badge}">
    <div class="tour-media">
      <img class="tour-image" src="${t.image}" alt="${t.title} - ${t.subtitle}" loading="lazy">
      <span class="tour-tag">${t.badge}</span>
    </div>
    <div class="tour-body">
      <div class="tour-heading">
        <h3>${t.title}</h3>
        <div class="tour-price"><strong>${t.price}</strong><small>Kişi Başı</small></div>
      </div>
      <p class="tour-subtitle">${t.subtitle}</p>
      <div class="tour-meta"><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span></div>
      <div class="tour-date"><b>●</b><span>${t.dates}</span></div>
      <div class="tour-actions">
        <button class="btn btn-outline" data-tour="${t.id}">Detay</button>
        <a class="btn btn-primary" href="${whatsappLink(t)}" target="_blank" rel="noopener">Bilgi Al →</a>
      </div>
    </div>
  </article>`;
}

function renderTours(filter='all'){
  const tours=filter==='all'?window.TOURS:window.TOURS.filter(t=>t.badge===filter);
  grid.innerHTML=tours.map(tourCard).join('');
  document.querySelectorAll('[data-tour]').forEach(button=>button.addEventListener('click',()=>openTour(button.dataset.tour)));
}

filterButtons.forEach(button=>button.addEventListener('click',()=>{
  filterButtons.forEach(b=>b.classList.remove('active'));
  button.classList.add('active');
  renderTours(button.dataset.filter);
}));

function openTour(id){
  const t=window.TOURS.find(x=>x.id===id);
  if(!t)return;
  modalImage.src=t.image;
  modalImage.alt=`${t.title} - ${t.subtitle}`;
  modalBadge.textContent=t.badge;
  modalTitle.textContent=`${t.title} — ${t.subtitle}`;
  modalPrice.textContent=t.price;
  modalSummary.textContent=t.summary;
  modalRoute.textContent=t.route;
  modalIncluded.textContent=t.included;
  modalMeta.innerHTML=`<span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span><span>◉ ${t.dates}</span>`;
  modalWhatsapp.href=whatsappLink(t);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}

function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

renderTours();