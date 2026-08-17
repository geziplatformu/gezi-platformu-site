const grid=document.getElementById('tourGrid');
const modal=document.getElementById('tourModal');
const modalImage=document.getElementById('modalImage');
const modalBadge=document.getElementById('modalBadge');
const modalTitle=document.getElementById('modalTitle');
const modalPrice=document.getElementById('modalPrice');
const modalSummary=document.getElementById('modalSummary');
const modalMeta=document.getElementById('modalMeta');
const modalRoute=document.getElementById('modalRoute');
const modalIncluded=document.getElementById('modalIncluded');
const modalWhatsapp=document.getElementById('modalWhatsapp');
const filterButtons=[...document.querySelectorAll('[data-filter]')];

document.getElementById('year').textContent=new Date().getFullYear();

function whatsappLink(t){
  const message=`Merhaba, ${t.title} (${t.subtitle}) turu hakkında bilgi almak istiyorum. Güncel kontenjan ve rezervasyon bilgisi paylaşabilir misiniz?`;
  return `https://wa.me/905374978441?text=${encodeURIComponent(message)}`;
}

function tourCard(t){
  return `<article class="tour-card" data-badge="${t.badge}">
    <div class="tour-media">
      <img class="tour-image" src="${t.image}" alt="${t.title} - ${t.subtitle}" loading="lazy">
      <div class="tour-badges"><span class="tour-tag">${t.badge}</span><span class="tour-type">${t.type}</span></div>
    </div>
    <div class="tour-body">
      <div class="tour-heading">
        <h3>${t.title}</h3>
        <div class="tour-price"><strong>${t.price}</strong><small>Kişi Başı</small></div>
      </div>
      <p class="tour-subtitle">${t.subtitle}</p>
      <div class="tour-meta"><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span></div>
      <div class="tour-date"><strong>Tur Tarihleri</strong><span>${t.dates}</span></div>
      <div class="tour-actions">
        <button data-tour="${t.id}">Tur Detayları</button>
        <a class="button button-whatsapp" href="${whatsappLink(t)}" target="_blank" rel="noopener">Bilgi Al</a>
      </div>
    </div>
  </article>`;
}

function renderTours(filter='all'){
  const tours=filter==='all'?window.TOURS:window.TOURS.filter(t=>t.type===filter);
  grid.innerHTML=tours.length?tours.map(tourCard).join(''):`<p class="empty-state">Bu kategoride yayınlanmış güncel tur bulunmuyor. Yeni turlar eklendiğinde burada görünecek.</p>`;
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
  modalMeta.innerHTML=`<span>${t.type}</span><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span><span>◉ ${t.dates}</span>`;
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
