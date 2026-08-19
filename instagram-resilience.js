(()=>{
  const PROFILE='https://www.instagram.com/geziplatformuu/';
  const LOGO='assets/gezi-platformu-logo.webp';

  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const profileLink=(content,cls='')=>`<a class="${cls}" href="${PROFILE}" target="_blank" rel="noopener">${content}</a>`;

  function getTourImages(){
    const fromTours=(window.TOURS||[]).map(t=>t?.image).filter(Boolean).slice(0,9);
    const defaults=[
      '/assets/tours/dogu-ekspresi-cover.avif',
      'assets/gezi-platformu-logo.webp',
      '/assets/tours/dogu-ekspresi-cover.avif'
    ];
    return [...fromTours,...defaults].slice(0,9);
  }

  function injectStyles(){
    if(document.getElementById('instagram-real-profile-styles'))return;
    const style=document.createElement('style');
    style.id='instagram-real-profile-styles';
    style.textContent=`
      .instagram-phone.instagram-real-ui{position:relative!important;width:min(100%,430px)!important;margin:0 auto 24px!important;padding:10px 8px 28px!important;border:7px solid #17191c!important;border-radius:48px!important;background:#0b0e12!important;color:#f5f5f5!important;overflow:visible!important;box-shadow:0 30px 80px rgba(11,15,18,.34),0 8px 24px rgba(11,15,18,.22)!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important}
      .instagram-phone.instagram-real-ui::before{content:"";position:absolute;z-index:20;top:8px;left:50%;width:108px;height:27px;transform:translateX(-50%);border-radius:999px;background:#020304;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 1px 4px rgba(0,0,0,.45)}
      .instagram-phone.instagram-real-ui::after{content:"";position:absolute;z-index:20;left:50%;bottom:9px;width:92px;height:4px;transform:translateX(-50%);border-radius:999px;background:#ddd}
      .ig-screen{overflow:hidden;border-radius:35px;background:#0b0e12;min-height:690px}
      .ig-status{height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 13px;font-size:11px;font-weight:800;color:#fff}.ig-status-icons{letter-spacing:1px;font-size:10px}
      .ig-topbar{height:50px;display:grid;grid-template-columns:38px 1fr 74px;align-items:center;padding:0 10px}.ig-plus{font-size:30px;line-height:1;font-weight:300}.ig-handle{display:flex;align-items:center;justify-content:center;gap:6px;font-size:18px;font-weight:800;min-width:0}.ig-handle-text{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ig-verified{width:16px;height:16px;display:inline-grid;place-items:center;flex:0 0 16px}.ig-verified svg{display:block;width:16px;height:16px}.ig-top-actions{display:flex;align-items:center;justify-content:flex-end;gap:14px;font-size:22px}.ig-menu{font-size:27px;line-height:1}
      .ig-profile-row{display:grid;grid-template-columns:104px 1fr;gap:8px;align-items:center;padding:10px 14px 7px}.ig-avatar-wrap{position:relative;width:91px;height:91px;padding:3px;border-radius:50%;background:conic-gradient(#d300c5,#ff3040,#ffdc80,#d300c5)}.ig-avatar{width:85px;height:85px;border:4px solid #0b0e12;border-radius:50%;object-fit:cover;background:#fff}.ig-avatar-plus{position:absolute;right:0;bottom:2px;width:27px;height:27px;display:grid;place-items:center;border:3px solid #0b0e12;border-radius:50%;background:#f5f5f5;color:#0b0e12;font-size:22px;font-weight:500;line-height:1}
      .ig-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;text-align:center}.ig-stat strong{display:block;font-size:18px;line-height:1.05;color:#fff;font-weight:750}.ig-stat span{display:block;margin-top:4px;color:#f5f5f5;font-size:12px;line-height:1.15}
      .ig-bio{padding:0 14px 10px;color:#f3f3f3;font-size:13.5px;line-height:1.35}.ig-bio strong{display:block;margin-bottom:2px;font-size:14px}.ig-category{color:#9fa4ac;margin-bottom:2px}.ig-bio-link{display:inline-block;margin-top:3px;color:#fff;font-weight:700}.ig-bio-link:hover{text-decoration:underline}
      .ig-action-note{margin:4px 14px 10px;padding:8px 11px;border:1px solid #292d33;border-radius:10px;color:#f0f0f0;font-size:12px;font-weight:700;text-align:center;background:#15191f}
      .ig-buttons{display:grid;grid-template-columns:1fr 1fr 1fr 40px;gap:6px;padding:0 14px 14px}.ig-button{min-height:34px;display:grid;place-items:center;border-radius:8px;background:#252a31;color:#fff;font-size:12px;font-weight:750}.ig-button.primary{background:#0095f6}.ig-button.chev{font-size:17px}
      .ig-highlights{display:flex;gap:15px;overflow-x:auto;padding:2px 14px 13px;scrollbar-width:none}.ig-highlights::-webkit-scrollbar{display:none}.ig-highlight{flex:0 0 70px;text-align:center;color:#fff}.ig-highlight-ring{width:66px;height:66px;margin:0 auto 5px;padding:3px;border-radius:50%;background:#262a30}.ig-highlight-ring img{width:60px;height:60px;display:block;object-fit:cover;border:2px solid #0b0e12;border-radius:50%;background:#fff}.ig-highlight span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#f1f1f1}.ig-highlight.new .ig-highlight-ring{display:grid;place-items:center;padding:0;border:1px solid #aeb3ba;background:transparent;font-size:33px;font-weight:250}
      .ig-tabs{display:grid;grid-template-columns:repeat(4,1fr);height:45px;border-top:1px solid #20242a;color:#9ca2ab}.ig-tab{position:relative;display:grid;place-items:center;font-size:21px}.ig-tab.active{color:#fff}.ig-tab.active::after{content:"";position:absolute;left:12%;right:12%;bottom:0;height:1.5px;background:#fff}
      .ig-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:#0b0e12}.ig-post{position:relative;display:block;aspect-ratio:1;overflow:hidden;background:#161a20}.ig-post img{width:100%;height:100%;display:block;object-fit:cover}.ig-post::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 65%,rgba(0,0,0,.09));pointer-events:none}.ig-post-badge{position:absolute;z-index:2;top:6px;right:6px;color:#fff;font-size:12px;text-shadow:0 1px 4px #000}
      .ig-bottom-nav{height:58px;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;background:#0b0e12;border-top:1px solid #171b20;color:#fff}.ig-nav-icon{display:grid;place-items:center;font-size:25px;line-height:1}.ig-nav-icon img{width:25px;height:25px;border:1px solid #fff;border-radius:50%;object-fit:cover;background:#fff}.ig-homebar-space{height:12px}
      .instagram-phone.instagram-real-ui .instagram-side-key,.instagram-phone.instagram-real-ui .instagram-volume-key{position:absolute;display:block;background:#181b1f;border-radius:3px;box-shadow:inset 1px 0 rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.4)}.instagram-phone.instagram-real-ui .instagram-side-key{right:-11px;top:156px;width:4px;height:80px}.instagram-phone.instagram-real-ui .instagram-volume-key{left:-11px;top:129px;width:4px;height:56px}.instagram-phone.instagram-real-ui .instagram-volume-key.second{top:195px;height:56px}
      @media(max-width:480px){.instagram-phone.instagram-real-ui{width:calc(100% - 8px)!important;border-width:6px!important;border-radius:43px!important;padding:9px 6px 25px!important}.ig-screen{border-radius:31px}.ig-profile-row{grid-template-columns:96px 1fr}.ig-avatar-wrap{width:84px;height:84px}.ig-avatar{width:78px;height:78px}.ig-stat strong{font-size:16px}.ig-stat span{font-size:11px}.ig-bio{font-size:12.5px}.ig-buttons{grid-template-columns:1fr 1fr 1fr 36px}.ig-highlight{flex-basis:64px}.ig-highlight-ring{width:60px;height:60px}.ig-highlight-ring img{width:54px;height:54px}}
    `;
    document.head.appendChild(style);
  }

  function currentTime(){
    return new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date());
  }

  function mount(){
    const phone=document.getElementById('instagramPhone');
    if(!phone||phone.dataset.realUiMounted==='1')return;
    phone.dataset.realUiMounted='1';
    injectStyles();
    phone.className='instagram-phone instagram-real-ui';
    const imgs=getTourImages();
    const posts=imgs.map((src,i)=>profileLink(`<img src="${esc(src)}" alt="Gezi Platformu Instagram gönderisi" loading="lazy"><span class="ig-post-badge">${i===1?'◆':'▱'}</span>`,'ig-post')).join('');
    const badge=`<span class="ig-verified" aria-label="Doğrulanmış hesap"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0095f6" d="M12 1.6l2.1 1.7 2.7-.3 1.2 2.4 2.5 1 .1 2.7 1.8 2-1.3 2.4.6 2.7-2.3 1.4-.7 2.6-2.7.1-1.8 2-2.5-.9-2.5.9-1.8-2-2.7-.1-.7-2.6-2.3-1.4.6-2.7L1.6 11l1.8-2 .1-2.7 2.5-1L7.2 3l2.7.3L12 1.6z"/><path d="M8.5 12.1l2.2 2.2 4.9-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    phone.innerHTML=`
      <span class="instagram-side-key" aria-hidden="true"></span><span class="instagram-volume-key" aria-hidden="true"></span><span class="instagram-volume-key second" aria-hidden="true"></span>
      <div class="ig-screen">
        <div class="ig-status"><span id="igPhoneTime">${currentTime()}</span><span class="ig-status-icons">▮▮▮ ◉ 87%</span></div>
        <div class="ig-topbar"><span class="ig-plus">＋</span><div class="ig-handle"><span class="ig-handle-text">geziplatformuu</span>${badge}<span style="font-size:14px">⌄</span></div><div class="ig-top-actions"><span>◎</span><span class="ig-menu">☰</span></div></div>
        <div class="ig-profile-row"><div class="ig-avatar-wrap">${profileLink(`<img class="ig-avatar" src="${LOGO}" alt="Gezi Platformu Instagram profil fotoğrafı"><span class="ig-avatar-plus">+</span>`)}</div><div class="ig-stats"><div class="ig-stat"><strong>4.716</strong><span>gönderi</span></div><div class="ig-stat"><strong>124 B</strong><span>takipçi</span></div><div class="ig-stat"><strong>17</strong><span>takip</span></div></div></div>
        <div class="ig-bio"><strong>GEZİ PLATFORMU</strong><div class="ig-category">Tur Şirketi</div><div>🌎 Mersin-Adana-Niğde Kalkışlı;</div><div>☀️ Kültür, Tatil, Doğa ve Kış Turları</div><div>⌛ 10 Yıldır Türkiye'nin Her Noktasına</div><div>〽️ TÜRSAB A-8660</div>${profileLink('🔗 wa.me/+905374978441 ve 2 diğer','ig-bio-link')}</div>
        <div class="ig-action-note">🎧 ⚠ Güncel Tur Takvimi ⚠</div>
        <div class="ig-buttons">${profileLink('Takip Et','ig-button primary')}${profileLink('Mesaj','ig-button')}${profileLink('İletişim','ig-button')}${profileLink('⌄','ig-button chev')}</div>
        <div class="ig-highlights"><div class="ig-highlight new"><div class="ig-highlight-ring">＋</div><span>Yeni</span></div><a class="ig-highlight" href="${PROFILE}" target="_blank" rel="noopener"><div class="ig-highlight-ring"><img src="${LOGO}" alt="Geçmiş Turlar"></div><span>Geçmiş Turlar</span></a><a class="ig-highlight" href="${PROFILE}" target="_blank" rel="noopener"><div class="ig-highlight-ring"><img src="${LOGO}" alt="Yorumlar"></div><span>Yorumlar</span></a><a class="ig-highlight" href="${PROFILE}" target="_blank" rel="noopener"><div class="ig-highlight-ring"><img src="${LOGO}" alt="Güncel Turlar"></div><span>Güncel Turlar</span></a></div>
        <div class="ig-tabs"><span class="ig-tab active">▦</span><span class="ig-tab">▣</span><span class="ig-tab">↻</span><span class="ig-tab">♙</span></div>
        <div class="ig-grid">${posts}</div>
        <div class="ig-bottom-nav"><span class="ig-nav-icon">⌂</span><span class="ig-nav-icon">▣</span><span class="ig-nav-icon">▽</span><span class="ig-nav-icon">⌕</span><span class="ig-nav-icon"><img src="${LOGO}" alt=""></span></div><div class="ig-homebar-space"></div>
      </div>`;
    setInterval(()=>{const el=document.getElementById('igPhoneTime');if(el)el.textContent=currentTime();},30000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
