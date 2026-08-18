(()=>{
  const stage=document.getElementById('logoStage');
  if(!stage)return;
  stage.classList.remove('done','v2-done','v3-done','v4-done');
  stage.querySelectorAll('.season-intro,.logo-letters,.logo-v2,.logo-v3,.logo-v4').forEach(el=>el.remove());

  const finalLogo=stage.querySelector('.brand-logo');
  if(!finalLogo)return;

  const style=document.createElement('style');
  style.id='logo-animation-v4-style';
  style.textContent=`
    .logo-stage{overflow:visible!important;perspective:1700px!important}
    .logo-stage .brand-logo{opacity:0!important;z-index:12!important;animation:none!important;transform:scale(.98)!important;filter:blur(2px)!important;transition:opacity .42s ease,transform .55s ease,filter .42s ease!important}
    .logo-stage.v4-done .brand-logo{opacity:1!important;transform:scale(1)!important;filter:none!important}
    .logo-v4{position:absolute;inset:0;z-index:5;pointer-events:none;transform-style:preserve-3d}
    .logo-v4-bg{position:absolute;inset:0;border-radius:50%;background:#fff;box-shadow:0 10px 28px rgba(21,32,37,.12)}
    .logo-v4-shard{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform,filter,opacity;animation:v4ShardIn 4.05s cubic-bezier(.14,.76,.2,1) both}
    .logo-v4-shard img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:contain}
    .logo-v4-shard.tl{--sx:-165%;--sy:-145%;--rz:-20deg;--rx:16deg;--ry:-24deg;clip-path:polygon(0 0,50% 0,50% 50%,0 50%)}
    .logo-v4-shard.tr{--sx:165%;--sy:-145%;--rz:20deg;--rx:14deg;--ry:24deg;clip-path:polygon(50% 0,100% 0,100% 50%,50% 50%)}
    .logo-v4-shard.bl{--sx:-165%;--sy:145%;--rz:18deg;--rx:-14deg;--ry:-24deg;clip-path:polygon(0 50%,50% 50%,50% 100%,0 100%)}
    .logo-v4-shard.br{--sx:165%;--sy:145%;--rz:-18deg;--rx:-16deg;--ry:24deg;clip-path:polygon(50% 50%,100% 50%,100% 100%,50% 100%)}
    @keyframes v4ShardIn{0%{opacity:0;transform:translate3d(var(--sx),var(--sy),520px) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(.58);filter:blur(8px) saturate(.65)}15%{opacity:1}74%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.035);filter:blur(0) saturate(1.14)}88%{transform:scale(.995)}100%{opacity:1;transform:none;filter:none}}

    .logo-v4-blank{position:absolute;z-index:8;background:#fff;border-radius:999px;box-shadow:0 0 0 2px rgba(255,255,255,.9)}
    .logo-v4-blank.top{left:26%;top:38%;width:48%;height:11%}
    .logo-v4-blank.bottom{left:18%;top:50%;width:64%;height:11.5%}

    .logo-v4-effects{position:absolute;inset:0;z-index:9;border-radius:50%;overflow:hidden}
    .fxq{position:absolute;width:50%;height:50%;overflow:hidden}.fxq.spring{left:0;top:0}.fxq.summer{right:0;top:0}.fxq.autumn{left:0;bottom:0}.fxq.winter{right:0;bottom:0}
    .flake,.leaf,.blossom{position:absolute;display:block;user-select:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.18))}
    .flake{top:-16%;color:#fff;font-size:clamp(7px,2vw,13px);animation:v4snow 1.45s linear infinite}.flake:nth-child(1){left:9%;animation-delay:-.2s}.flake:nth-child(2){left:28%;animation-delay:-1.1s}.flake:nth-child(3){left:49%;animation-delay:-.55s}.flake:nth-child(4){left:68%;animation-delay:-.9s}.flake:nth-child(5){left:86%;animation-delay:-.35s}
    @keyframes v4snow{0%{transform:translate3d(0,-10%,0) rotate(0);opacity:0}10%{opacity:.95}100%{transform:translate3d(9px,230%,0) rotate(160deg);opacity:.1}}
    .leaf{top:-18%;font-size:clamp(8px,2.4vw,16px);animation:v4leaf 1.8s ease-in infinite}.leaf:nth-child(1){left:10%;animation-delay:-.2s}.leaf:nth-child(2){left:31%;animation-delay:-1s}.leaf:nth-child(3){left:55%;animation-delay:-.55s}.leaf:nth-child(4){left:78%;animation-delay:-1.35s}
    @keyframes v4leaf{0%{transform:translate3d(-3px,-20%,0) rotate(0);opacity:0}12%{opacity:1}100%{transform:translate3d(22px,235%,0) rotate(390deg);opacity:.15}}
    .blossom{font-size:clamp(8px,2.5vw,17px);opacity:0;animation:v4bloom 1.8s ease-in-out infinite}.blossom:nth-child(1){left:12%;top:16%;animation-delay:-.2s}.blossom:nth-child(2){left:53%;top:24%;animation-delay:-1.1s}.blossom:nth-child(3){left:27%;top:61%;animation-delay:-.65s}.blossom:nth-child(4){left:73%;top:68%;animation-delay:-1.45s}
    @keyframes v4bloom{0%,100%{opacity:.12;transform:scale(.18) rotate(-18deg)}46%,70%{opacity:1;transform:scale(1.08) rotate(8deg)}}
    .sea-wave{position:absolute;left:-15%;width:130%;height:23%;border-radius:50%;border-top:2px solid rgba(255,255,255,.8);background:rgba(255,255,255,.12);bottom:2%;animation:v4wave 1.15s ease-in-out infinite}.sea-wave.w2{bottom:15%;opacity:.66;animation-delay:-.55s}.sea-wave.w3{bottom:29%;opacity:.35;animation-delay:-.2s}
    @keyframes v4wave{0%,100%{transform:translateX(-5%) translateY(2px) rotate(-2deg) scaleY(.85)}50%{transform:translateX(6%) translateY(-3px) rotate(2deg) scaleY(1.08)}}

    .logo-v4-letter{position:absolute;z-index:11;display:block;object-fit:contain;opacity:0;transform-style:preserve-3d;filter:drop-shadow(0 2px 3px rgba(0,0,0,.18));animation:v4Letter 4.55s cubic-bezier(.12,.78,.18,1) both;animation-delay:var(--delay)}
    @keyframes v4Letter{0%{opacity:0;transform:translate3d(var(--fx),var(--fy),var(--fz)) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(.08)}10%{opacity:1}36%{transform:translate3d(var(--mx),var(--my),220px) rotateX(calc(var(--rx)*.45)) rotateY(calc(var(--ry)*.45)) rotateZ(calc(var(--rz)*.45)) scale(.58)}72%{opacity:1;transform:translate3d(0,0,18px) rotateX(0) rotateY(0) rotateZ(0) scale(1.12)}87%{transform:translate3d(0,0,0) scale(.985)}100%{opacity:1;transform:none}}
    .logo-stage.v4-done .logo-v4{opacity:0;transition:opacity .4s ease}
    .logo-stage.v4-done + .welcome-script{opacity:1!important;transform:none!important}
    @media(prefers-reduced-motion:reduce){.logo-v4{display:none}.logo-stage .brand-logo{opacity:1!important;transform:none!important;filter:none!important}}
  `;
  document.head.appendChild(style);

  const v4=document.createElement('div');
  v4.className='logo-v4';
  v4.setAttribute('aria-hidden','true');
  v4.innerHTML=`
    <div class="logo-v4-bg"></div>
    <div class="logo-v4-shard tl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v4-shard tr"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v4-shard bl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v4-shard br"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v4-blank top"></div><div class="logo-v4-blank bottom"></div>
    <div class="logo-v4-effects">
      <div class="fxq spring"><i class="blossom">🌸</i><i class="blossom">🌼</i><i class="blossom">🌺</i><i class="blossom">🌸</i></div>
      <div class="fxq summer"><b class="sea-wave"></b><b class="sea-wave w2"></b><b class="sea-wave w3"></b></div>
      <div class="fxq autumn"><i class="leaf">🍂</i><i class="leaf">🍁</i><i class="leaf">🍂</i><i class="leaf">🍁</i></div>
      <div class="fxq winter"><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i></div>
    </div>`;
  stage.insertBefore(v4,finalLogo);

  const src=new Image();
  src.src='assets/gezi-platformu-logo.webp';
  src.onload=()=>{
    const W=src.naturalWidth,H=src.naturalHeight;
    const master=document.createElement('canvas');master.width=W;master.height=H;
    const m=master.getContext('2d',{willReadFrequently:true});m.drawImage(src,0,0,W,H);

    const specs=[
      {x:.275,y:.375,w:.115,h:.125},{x:.385,y:.375,w:.105,h:.125},{x:.49,y:.375,w:.105,h:.125},{x:.595,y:.375,w:.12,h:.125},
      {x:.19,y:.495,w:.088,h:.13},{x:.274,y:.495,w:.083,h:.13},{x:.354,y:.495,w:.09,h:.13},{x:.441,y:.495,w:.083,h:.13},{x:.522,y:.495,w:.083,h:.13},{x:.603,y:.495,w:.083,h:.13},{x:.684,y:.495,w:.083,h:.13},{x:.765,y:.495,w:.083,h:.13},{x:.846,y:.495,w:.083,h:.13}
    ];
    const routes=[
      ['-88vw','-72vh','650px','-30vw','-24vh','92deg','-70deg','-60deg'],['14vw','-92vh','720px','-8vw','-38vh','-84deg','80deg','44deg'],['-105vw','8vh','560px','-42vw','-6vh','106deg','46deg','-74deg'],['102vw','-30vh','760px','38vw','-14vh','-96deg','-88deg','62deg'],
      ['-42vw','96vh','680px','-18vw','38vh','82deg','72deg','84deg'],['108vw','62vh','570px','46vw','22vh','-102deg','62deg','-46deg'],['-82vw','-104vh','790px','-30vw','-42vh','72deg','-102deg','52deg'],['58vw','101vh','660px','22vw','40vh','-78deg','88deg','-66deg'],['-112vw','72vh','610px','-48vw','26vh','110deg','42deg','42deg'],['110vw','3vh','700px','44vw','0vh','-74deg','-98deg','74deg'],['-36vw','108vh','640px','-16vw','44vh','84deg','94deg','-50deg'],['50vw','-108vh','780px','20vw','-44vh','-92deg','-68deg','60deg'],['5vw','112vh','670px','2vw','46vh','108deg','58deg','-62deg']
    ];

    specs.forEach((s,i)=>{
      const sx=Math.round(s.x*W),sy=Math.round(s.y*H),sw=Math.round(s.w*W),sh=Math.round(s.h*H);
      const c=document.createElement('canvas');c.width=sw;c.height=sh;
      const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(master,sx,sy,sw,sh,0,0,sw,sh);
      const data=ctx.getImageData(0,0,sw,sh),p=data.data;
      for(let k=0;k<p.length;k+=4){
        const r=p[k],g=p[k+1],b=p[k+2],max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max===0?0:(max-min)/max,bright=(r+g+b)/3;
        const keep=sat>.18 || (max-min)>34 || bright<105;
        if(!keep)p[k+3]=0;
      }
      ctx.putImageData(data,0,0);
      const el=document.createElement('img');
      el.className='logo-v4-letter';el.src=c.toDataURL('image/png');
      el.style.left=`${s.x*100}%`;el.style.top=`${s.y*100}%`;el.style.width=`${s.w*100}%`;el.style.height=`${s.h*100}%`;
      const r=routes[i];el.style.setProperty('--fx',r[0]);el.style.setProperty('--fy',r[1]);el.style.setProperty('--fz',r[2]);el.style.setProperty('--mx',r[3]);el.style.setProperty('--my',r[4]);el.style.setProperty('--rx',r[5]);el.style.setProperty('--ry',r[6]);el.style.setProperty('--rz',r[7]);el.style.setProperty('--delay',`${0.02+i*0.05}s`);
      v4.appendChild(el);
    });
  };

  window.setTimeout(()=>{
    stage.classList.add('v4-done');
    window.setTimeout(()=>v4.remove(),560);
  },5000);
})();

(()=>{
  const exactOfficeMap='https://maps.app.goo.gl/2EHiMoW47euT7ZZb9';
  const applyExactMap=()=>{
    const mapButton=document.querySelector('.floating-contact-map');
    if(!mapButton)return false;
    mapButton.href=exactOfficeMap;
    mapButton.setAttribute('aria-label',"Gezi Platformu ofisinin tam konumunu Google Maps'te aç");
    return true;
  };
  if(!applyExactMap()){
    const observer=new MutationObserver(()=>{if(applyExactMap())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),10000);
  }
})();