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
const googleReviewsTrack=document.getElementById('googleReviewsTrack');
const googleRating=document.getElementById('googleRating');
const googleRatingStars=document.getElementById('googleRatingStars');
const googleReviewCount=document.getElementById('googleReviewCount');
const googleReviewsStatus=document.getElementById('googleReviewsStatus');
const googleReviewsButton=document.getElementById('googleReviewsButton');
const googleScoreLink=document.getElementById('googleScoreLink');

document.getElementById('year').textContent=new Date().getFullYear();

function whatsappLink(t){
  const message=`Merhaba, ${t.title} (${t.subtitle}) turu hakkında bilgi almak istiyorum. Güncel kontenjan ve rezervasyon bilgisi paylaşabilir misiniz?`;
  return `https://wa.me/905374978441?text=${encodeURIComponent(message)}`;
}

function tourCard(t){
  const media=t.detailUrl
    ? `<a class="tour-media" href="${t.detailUrl}" aria-label="${t.title} tur detaylarını aç"><img class="tour-image" src="${t.image}" alt="${t.title} - ${t.subtitle}" loading="lazy"><div class="tour-badges"><span class="tour-tag">${t.badge}</span><span class="tour-type">${t.type}</span></div></a>`
    : `<div class="tour-media"><img class="tour-image" src="${t.image}" alt="${t.title} - ${t.subtitle}" loading="lazy"><div class="tour-badges"><span class="tour-tag">${t.badge}</span><span class="tour-type">${t.type}</span></div></div>`;
  const detailAction=t.detailUrl
    ? `<a class="button" href="${t.detailUrl}">Tur Detayları</a>`
    : `<button class="button" data-tour="${t.id}">Tur Detayları</button>`;
  return `<article class="tour-card" data-badge="${t.badge}">${media}<div class="tour-body"><div class="tour-heading"><h3>${t.title}</h3><div class="tour-price"><strong>${t.price}</strong><small>Başlayan Fiyat</small></div></div><p class="tour-subtitle">${t.subtitle}</p><div class="tour-meta"><span>◷ ${t.duration}</span><span>⌖ ${t.departure}</span></div><div class="tour-actions">${detailAction}</div></div></article>`;
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
  if(t.detailUrl){window.location.href=t.detailUrl;return;}
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
const escapeHtml=(value='')=>String(value).replace(/[&<>'\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function reviewStars(rating){
  const count=Math.max(0,Math.min(5,Math.round(Number(rating)||0)));
  return `${'★'.repeat(count)}${'☆'.repeat(5-count)}`;
}

function googleReviewCard(review){
  const author=review.author||{};
  const name=escapeHtml(author.name||'Google kullanıcısı');
  const text=escapeHtml(review.text||'');
  const relativeTime=escapeHtml(review.relativeTime||'');
  const reviewUrl=review.googleMapsUri||author.uri||'#';
  const photo=author.photoUri?`<img src="${escapeHtml(author.photoUri)}" alt="${name}" loading="lazy" referrerpolicy="no-referrer">`:`<span class="google-review-avatar-fallback">${name.charAt(0).toUpperCase()}</span>`;
  return `<article class="google-review-card"><div class="google-review-author"><div class="google-review-avatar">${photo}</div><div><strong>${name}</strong><span>${relativeTime}</span></div><span class="google-mini-g">G</span></div><div class="google-review-stars" aria-label="${Number(review.rating)||0} yıldız">${reviewStars(review.rating)}</div>${text?`<p>${text}</p>`:'<p class="google-review-no-text">Google’da yıldız değerlendirmesi bıraktı.</p>'}<a href="${escapeHtml(reviewUrl)}" target="_blank" rel="noopener">Google’da görüntüle ↗</a></article>`;
}

async function loadGoogleReviews(){
  if(!googleReviewsTrack)return;
  try{
    const response=await fetch(`/api/google-reviews?t=${Date.now()}`,{cache:'no-store'});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Google yorumları alınamadı');
    const reviews=Array.isArray(data.reviews)?data.reviews:[];
    googleRating.textContent=data.rating?data.rating.toFixed(1):'—';
    googleRatingStars.textContent=reviewStars(data.rating);
    googleReviewCount.textContent=data.userRatingCount?`${exactNumber.format(data.userRatingCount)} Google yorumu`:'Google yorumları';
    const mapsUrl=data.googleMapsUri||'#';
    googleReviewsButton.href=mapsUrl;
    googleScoreLink.href=mapsUrl;
    if(reviews.length){
      googleReviewsTrack.innerHTML=reviews.map(googleReviewCard).join('');
      googleReviewsStatus.textContent=`Canlı Google verileri • ${new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;
      googleReviewsStatus.className='ready';
    }else{
      googleReviewsTrack.innerHTML='<div class="empty-state">Google şu anda 4 veya 5 yıldızlı yorum göstermedi. Tüm değerlendirmeleri Google üzerinden inceleyebilirsiniz.</div>';
      googleReviewsStatus.textContent='Google yorumları güncel olarak kontrol edildi';
    }
  }catch(error){
    googleReviewsTrack.innerHTML='<div class="empty-state">Google yorumları şu anda yüklenemiyor. Kısa süre sonra yeniden deneyin.</div>';
    googleReviewsStatus.textContent='Canlı Google bağlantısı geçici olarak kullanılamıyor';
    googleReviewsStatus.className='error';
  }
}

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
loadGoogleReviews();
loadInstagram();
setInterval(updatePhoneTime,60000);
setInterval(loadGoogleReviews,1800000);
setInterval(loadInstagram,300000);
