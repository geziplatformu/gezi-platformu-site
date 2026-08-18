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
const instagramAvatar=document.getElementById('instagramAvatar');
const instagramUsername=document.getElementById('instagramUsername');
const instagramName=document.getElementById('instagramName');
const instagramBio=document.getElementById('instagramBio');
const instagramPostCount=document.getElementById('instagramPostCount');
const instagramFollowerCount=document.getElementById('instagramFollowerCount');
const instagramFollowingCount=document.getElementById('instagramFollowingCount');
const instagramFeed=document.getElementById('instagramFeed');
const instagramStatus=document.getElementById('instagramStatus');
const phoneTime=document.getElementById('phoneTime');

document.getElementById('year').textContent=new Date().getFullYear();

function whatsappLink(t){
  const message=`Merhaba, ${t.title} (${t.subtitle}) turu hakkında bilgi almak istiyorum. Güncel kontenjan ve rezervasyon bilgisi paylaşabilir misiniz?`;
  return `https://wa.me/905374978441?text=${encodeURIComponent(message)}`;
}

function tourCard(t){
  return `<article class="tour-card" data-badge="${t.badge}"><div class="tour-media"><img class="tour-image" src="${t.image}" alt="${t.title} - ${t.subtitle}" loading="lazy"><div class="tour-badges"><span class="tour-tag">${t.badge}</span><span class="tour-type">${t.type}</span></div></div><div class="tour-body"><div class="tour-heading"><h3>${t.title}</h3><div class="tour-price"><strong>${t.price}</strong><small>Kişi Başı</small></div></div><p class="tour-subtitle">${t.subtitle}</p><div class="tour-meta"><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span></div><div class="tour-date"><strong>Tur Tarihleri</strong><span>${t.dates}</span></div><div class="tour-actions"><button data-tour="${t.id}">Tur Detayları</button><a class="button button-whatsapp" href="${whatsappLink(t)}" target="_blank" rel="noopener">Bilgi Al</a></div></div></article>`;
}

function renderTours(filter='all'){
  const tours=filter==='all'?window.TOURS:window.TOURS.filter(t=>t.type===filter);
  grid.innerHTML=tours.map(tourCard).join('');
  document.querySelectorAll('[data-tour]').forEach(button=>button.addEventListener('click',()=>openTour(button.dataset.tour)));
}

filterButtons.forEach(button=>button.addEventListener('click',()=>{
  filterButtons.forEach(b=>b.classList.remove('active'));
  button.classList.add('active');
  renderTours(button.dataset.filter);
}));

function openTour(id){
  const t=window.TOURS.find(x=>x.id===id); if(!t)return;
  modalImage.src=t.image; modalImage.alt=`${t.title} - ${t.subtitle}`; modalBadge.textContent=t.badge;
  modalTitle.textContent=`${t.title} — ${t.subtitle}`; modalPrice.textContent=t.price; modalSummary.textContent=t.summary;
  modalRoute.textContent=t.route; modalIncluded.textContent=t.included;
  modalMeta.innerHTML=`<span>${t.type}</span><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span><span>◉ ${t.dates}</span>`;
  modalWhatsapp.href=whatsappLink(t); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

const exactNumber=new Intl.NumberFormat('tr-TR');
const compactNumber=new Intl.NumberFormat('tr-TR',{notation:'compact',maximumFractionDigits:1});
const imageProxy=url=>url?`/api/instagram-image?url=${encodeURIComponent(url)}`:'';

function updatePhoneTime(){if(phoneTime)phoneTime.textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});}
function instagramPost(media){
  const image=media.thumbnail_url||media.media_url; if(!image||!media.permalink)return '';
  const type=media.media_type==='VIDEO'?'▶':media.media_type==='CAROUSEL_ALBUM'?'▣':'';
  return `<a class="instagram-post" href="${media.permalink}" target="_blank" rel="noopener" aria-label="Instagram gönderisini görüntüle"><img src="${imageProxy(image)}" alt="Gezi Platformu Instagram paylaşımı" loading="lazy">${type?`<span class="instagram-post-type">${type}</span>`:''}</a>`;
}

async function loadInstagram(){
  try{
    const response=await fetch(`/api/instagram?t=${Date.now()}`,{cache:'no-store'});
    const data=await response.json();
    if(!response.ok||!data.username)throw new Error(data.error||'Instagram verileri alınamadı');
    if(instagramAvatar) instagramAvatar.src=imageProxy(data.profile_picture_url);
    if(instagramUsername) instagramUsername.textContent=data.username;
    if(instagramName) instagramName.textContent=data.name||'GEZİ PLATFORMU';
    if(instagramBio) instagramBio.textContent=data.biography||'';
    if(instagramPostCount) instagramPostCount.textContent=exactNumber.format(data.media_count||0);
    if(instagramFollowerCount){instagramFollowerCount.textContent=compactNumber.format(data.followers_count||0);instagramFollowerCount.title=exactNumber.format(data.followers_count||0);}
    if(instagramFollowingCount) instagramFollowingCount.textContent=data.follows_count==null?'—':exactNumber.format(data.follows_count);
    const posts=[...(data.media||[])].sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0)).slice(0,9).map(instagramPost).filter(Boolean);
    if(instagramFeed) instagramFeed.innerHTML=posts.length?posts.join(''):'<div class="instagram-loading">Paylaşımlar yükleniyor…</div>';
    if(instagramStatus){instagramStatus.textContent=`Canlı Instagram profili • ${new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;instagramStatus.className='instagram-status ready';}
    document.querySelector('.verified-badge')?.remove();
  }catch(error){
    if(instagramFeed) instagramFeed.innerHTML='<div style="grid-column:1/-1;padding:22px 12px;font-size:12px;color:#666">Instagram bağlantısı geçici olarak yenileniyor. Profili aşağıdaki butondan açabilirsiniz.</div>';
    if(instagramStatus){instagramStatus.textContent='Canlı Instagram bağlantısı geçici olarak kullanılamıyor';instagramStatus.className='instagram-status error';}
  }
}

renderTours();
updatePhoneTime();
loadInstagram();
setInterval(updatePhoneTime,60000);
setInterval(loadInstagram,300000);
