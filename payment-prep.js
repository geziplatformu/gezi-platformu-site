(()=>{
  const css=document.createElement('style');
  css.textContent=`
    .buy-button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 14px;font-weight:900;background:#08783f;color:#fff;white-space:nowrap}
    .tour-actions .button{padding-top:7px!important;padding-bottom:7px!important}
    .sales-legal-footer{margin-top:30px;padding:22px 16px 90px;background:#17211d;color:#dfe8e3;text-align:center;font-size:12px}
    .sales-legal-footer strong{display:block;color:#fff;margin-bottom:8px}
    .sales-legal-footer a{color:#fff;margin:4px 7px;display:inline-block}
    .sales-legal-footer p{margin:10px auto 0;max-width:760px;color:#aebbb4}
    .tour-actions{display:flex!important;gap:8px;flex-wrap:nowrap;align-items:stretch}
    .tour-actions .button{flex:1 1 auto;min-width:0}
    .tour-actions .buy-button{flex:1 1 auto;min-width:0}
    .instagram-story-share{flex:0 0 auto;min-width:82px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid #d82b78;border-radius:10px;padding:8px 10px;background:#fff;color:#b9226a;cursor:pointer;font-size:11px;font-weight:900;white-space:nowrap}
    .instagram-story-share svg{width:15px;height:15px;fill:currentColor;flex:0 0 auto}
    .instagram-story-share:disabled{opacity:.55;cursor:wait}
    .cart-floating{position:fixed;left:16px;right:auto;bottom:max(18px,calc(env(safe-area-inset-bottom) + 18px));z-index:80;background:#17211d;color:#fff;text-decoration:none;border-radius:999px;padding:11px 16px;font-weight:900;box-shadow:0 8px 24px #0003}
    @media(max-width:480px){
      .tour-actions{gap:6px}
      .tour-actions .button{flex:1 1 auto;font-size:11px;padding:6px 7px!important}
      .tour-actions .buy-button{flex:1 1 auto;font-size:11px;padding:9px 7px}
      .instagram-story-share{min-width:72px;padding:7px 8px;font-size:10px;gap:4px}
      .instagram-story-share svg{width:14px;height:14px}
      .cart-floating{left:12px;right:auto;bottom:max(14px,calc(env(safe-area-inset-bottom) + 14px));padding:10px 14px}
    }
  `;
  document.head.appendChild(css);

  const instagramIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm10.5 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>';

  function findTour(card){
    const btn=card.querySelector('[data-tour]');
    let id=btn?.dataset.tour;
    if(!id){
      const href=card.querySelector('.tour-media[href]')?.getAttribute('href')||'';
      const t=(window.TOURS||[]).find(x=>x.detailUrl===href);
      id=t?.id;
    }
    return (window.TOURS||[]).find(x=>x.id===id)||null;
  }

  function wrapText(ctx,text,maxWidth){
    const words=String(text||'').split(/\s+/).filter(Boolean);
    const lines=[];
    let line='';
    for(const word of words){
      const test=line?`${line} ${word}`:word;
      if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;
    }
    if(line)lines.push(line);
    return lines;
  }

  function loadImage(url){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.crossOrigin='anonymous';
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=url;
    });
  }

  function drawCover(ctx,img,w,h){
    const scale=Math.max(w/img.width,h/img.height);
    const dw=img.width*scale,dh=img.height*scale;
    const dx=(w-dw)/2,dy=(h-dh)/2;
    ctx.drawImage(img,dx,dy,dw,dh);
  }

  async function createStoryFile(tour){
    const canvas=document.createElement('canvas');
    canvas.width=1080;canvas.height=1920;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#111';ctx.fillRect(0,0,1080,1920);

    try{
      const img=await loadImage(tour.image);
      drawCover(ctx,img,1080,1920);
    }catch{
      const g=ctx.createLinearGradient(0,0,1080,1920);
      g.addColorStop(0,'#17342a');g.addColorStop(1,'#081511');
      ctx.fillStyle=g;ctx.fillRect(0,0,1080,1920);
    }

    const shade=ctx.createLinearGradient(0,0,0,1920);
    shade.addColorStop(0,'rgba(0,0,0,.12)');
    shade.addColorStop(.48,'rgba(0,0,0,.08)');
    shade.addColorStop(1,'rgba(0,0,0,.86)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,1080,1920);

    ctx.fillStyle='rgba(255,255,255,.96)';
    ctx.beginPath();ctx.roundRect(64,70,250,64,32);ctx.fill();
    ctx.fillStyle='#111';ctx.font='900 28px Arial, sans-serif';ctx.fillText('GEZİ PLATFORMU',88,112);

    ctx.fillStyle='#fff';
    ctx.font='900 74px Arial, sans-serif';
    const titleLines=wrapText(ctx,tour.title,920).slice(0,3);
    let y=1390;
    titleLines.forEach(line=>{ctx.fillText(line,72,y);y+=84;});

    ctx.font='700 34px Arial, sans-serif';
    const subtitleLines=wrapText(ctx,tour.subtitle,910).slice(0,2);
    subtitleLines.forEach(line=>{ctx.fillText(line,74,y+6);y+=45;});

    const nearest=(typeof nearestTourDate==='function'&&nearestTourDate(tour))||null;
    const dateText=nearest?.label||tour.dates||'';
    ctx.font='800 30px Arial, sans-serif';
    ctx.fillStyle='#fff';
    const info=[dateText,tour.duration,tour.price].filter(Boolean).join('  •  ');
    const infoLines=wrapText(ctx,info,910).slice(0,2);
    y+=18;infoLines.forEach(line=>{ctx.fillText(line,74,y);y+=40;});

    ctx.font='700 25px Arial, sans-serif';
    ctx.fillStyle='rgba(255,255,255,.88)';
    ctx.fillText('geziplatformuu.com',74,1835);

    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png',.96));
    if(!blob)throw new Error('Hikâye görseli oluşturulamadı');
    return new File([blob],`${tour.id||'tur'}-instagram-hikaye.png`,{type:'image/png'});
  }

  async function shareStory(tour,button){
    if(!tour)return;
    const original=button.innerHTML;
    button.disabled=true;button.textContent='Hazırlanıyor…';
    try{
      const file=await createStoryFile(tour);
      const shareData={files:[file],title:tour.title,text:`${tour.title} • ${tour.price||''}`};
      if(navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share(shareData);
      }else if(navigator.share){
        await navigator.share({title:tour.title,text:`${tour.title} ${tour.dates||''}`,url:location.origin});
      }else{
        const url=URL.createObjectURL(file);
        const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1500);
        window.open('https://www.instagram.com/','_blank','noopener');
      }
    }catch(error){
      if(error?.name!=='AbortError'){
        alert('Instagram paylaşımı hazırlanamadı. Lütfen tekrar deneyin.');
      }
    }finally{
      button.disabled=false;button.innerHTML=original;
    }
  }

  function enhance(){
    document.querySelectorAll('.tour-card').forEach(card=>{
      const detail=card.querySelector('.tour-actions');
      if(!detail)return;
      const tour=findTour(card);
      if(!tour)return;
      let buy=card.querySelector('.buy-button');
      if(!buy){
        buy=document.createElement('a');
        buy.className='buy-button';
        buy.href=`sepet.html?tur=${encodeURIComponent(tour.id)}`;
        buy.textContent='Rezervasyon';
        detail.appendChild(buy);
      }
      if(!card.querySelector('.instagram-story-share')){
        const share=document.createElement('button');
        share.type='button';
        share.className='instagram-story-share';
        share.innerHTML=`${instagramIcon}<span>Paylaş</span>`;
        share.setAttribute('aria-label',`${tour.title} turunu Instagram hikâyede paylaş`);
        share.addEventListener('click',()=>shareStory(tour,share));
        buy.insertAdjacentElement('afterend',share);
      }
    });
  }

  enhance();
  const grid=document.getElementById('tourGrid');
  if(grid)new MutationObserver(enhance).observe(grid,{childList:true,subtree:true});

  if(!document.querySelector('.cart-floating')){
    const c=document.createElement('a');c.className='cart-floating';c.href='sepet.html';c.textContent='🛒 Sepetim';document.body.appendChild(c);
  }
  if(!document.querySelector('.sales-legal-footer')){
    const f=document.createElement('footer');f.className='sales-legal-footer';f.innerHTML='<strong>Gezi Platformu • Mersin Özbek Turizm Sanayi ve Ticaret Limited Şirketi • TÜRSAB A-8660</strong><div><a href="iletisim.html">İletişim ve Yasal Firma Bilgileri</a><a href="sepet.html">Sepetim</a><a href="rezervasyon.html">Rezervasyon</a><a href="on-bilgilendirme.html">Ön Bilgilendirme</a><a href="mesafeli-satis-sozlesmesi.html">Mesafeli Satış Sözleşmesi</a><a href="iptal-iade.html">Teslimat / İptal / İade</a><a href="gizlilik-politikasi.html">Gizlilik</a><a href="kvkk.html">KVKK</a></div><p>MERSİS: 0859060299200011 • Liman Vergi Dairesi / 6180412339 • Mersin Ticaret ve Sanayi Odası • ozbekturizm@gmail.com • 0537 497 84 41 • Camiişerif Mah. İstiklal Cad. No:45/D Akdeniz / Mersin</p>';document.body.appendChild(f);
  }
})();
