(()=>{
  const stage=document.getElementById('logoStage');
  if(!stage)return;

  const oldDone=stage.classList.contains('done');
  stage.classList.remove('done');

  const style=document.createElement('style');
  style.id='logo-animation-v2-style';
  style.textContent=`
    .logo-stage{overflow:visible!important;perspective:1300px!important}
    .logo-stage .brand-logo{opacity:0!important;z-index:8!important;transition:opacity .55s ease,transform .7s cubic-bezier(.2,.8,.2,1),filter .55s ease!important;transform:scale(.92)!important;filter:blur(4px)!important}
    .logo-stage.v2-done .brand-logo{opacity:1!important;transform:scale(1)!important;filter:none!important}
    .logo-v2{position:absolute;inset:0;z-index:4;pointer-events:none;transform-style:preserve-3d}
    .logo-v2-shard{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform,filter,opacity;animation:shardIn 4.15s cubic-bezier(.14,.76,.2,1) both}
    .logo-v2-shard img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
    .logo-v2-shard.tl{--sx:-165%;--sy:-145%;--rz:-20deg;--rx:16deg;--ry:-24deg;clip-path:polygon(0 0,50% 0,50% 50%,0 50%)}
    .logo-v2-shard.tr{--sx:165%;--sy:-145%;--rz:20deg;--rx:14deg;--ry:24deg;clip-path:polygon(50% 0,100% 0,100% 50%,50% 50%)}
    .logo-v2-shard.bl{--sx:-165%;--sy:145%;--rz:18deg;--rx:-14deg;--ry:-24deg;clip-path:polygon(0 50%,50% 50%,50% 100%,0 100%)}
    .logo-v2-shard.br{--sx:165%;--sy:145%;--rz:-18deg;--rx:-16deg;--ry:24deg;clip-path:polygon(50% 50%,100% 50%,100% 100%,50% 100%)}
    @keyframes shardIn{0%{opacity:0;transform:translate3d(var(--sx),var(--sy),520px) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(.58);filter:blur(8px) saturate(.65)}15%{opacity:1}74%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.035);filter:blur(0) saturate(1.14)}88%{transform:scale(.995)}100%{opacity:1;transform:none;filter:none}}
    .logo-v2-effects{position:absolute;inset:0;z-index:6;border-radius:50%;overflow:hidden;pointer-events:none}
    .fx-quadrant{position:absolute;width:50%;height:50%;overflow:hidden}
    .fx-spring{left:0;top:0}.fx-summer{right:0;top:0}.fx-autumn{left:0;bottom:0}.fx-winter{right:0;bottom:0}
    .flake,.leaf,.blossom{position:absolute;display:block;user-select:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.18))}
    .flake{top:-16%;color:#fff;font-size:clamp(7px,2vw,13px);animation:v2snow 1.45s linear infinite}
    .flake:nth-child(1){left:9%;animation-delay:-.2s}.flake:nth-child(2){left:28%;animation-delay:-1.1s}.flake:nth-child(3){left:49%;animation-delay:-.55s}.flake:nth-child(4){left:68%;animation-delay:-.9s}.flake:nth-child(5){left:86%;animation-delay:-.35s}
    @keyframes v2snow{0%{transform:translate3d(0,-10%,0) rotate(0);opacity:0}10%{opacity:.95}100%{transform:translate3d(9px,230%,0) rotate(160deg);opacity:.1}}
    .leaf{top:-18%;font-size:clamp(8px,2.4vw,16px);animation:v2leaf 1.8s ease-in infinite}
    .leaf:nth-child(1){left:10%;animation-delay:-.2s}.leaf:nth-child(2){left:31%;animation-delay:-1s}.leaf:nth-child(3){left:55%;animation-delay:-.55s}.leaf:nth-child(4){left:78%;animation-delay:-1.35s}
    @keyframes v2leaf{0%{transform:translate3d(-3px,-20%,0) rotate(0);opacity:0}12%{opacity:1}100%{transform:translate3d(22px,235%,0) rotate(390deg);opacity:.15}}
    .blossom{font-size:clamp(8px,2.5vw,17px);opacity:0;animation:v2bloom 1.8s ease-in-out infinite}
    .blossom:nth-child(1){left:12%;top:16%;animation-delay:-.2s}.blossom:nth-child(2){left:53%;top:24%;animation-delay:-1.1s}.blossom:nth-child(3){left:27%;top:61%;animation-delay:-.65s}.blossom:nth-child(4){left:73%;top:68%;animation-delay:-1.45s}
    @keyframes v2bloom{0%,100%{opacity:.12;transform:scale(.18) rotate(-18deg)}46%,70%{opacity:1;transform:scale(1.08) rotate(8deg)}}
    .sea-wave{position:absolute;left:-15%;width:130%;height:23%;border-radius:50%;border-top:2px solid rgba(255,255,255,.8);background:rgba(255,255,255,.12);bottom:2%;animation:v2wave 1.15s ease-in-out infinite}
    .sea-wave.w2{bottom:15%;opacity:.66;animation-delay:-.55s}.sea-wave.w3{bottom:29%;opacity:.35;animation-delay:-.2s}
    @keyframes v2wave{0%,100%{transform:translateX(-5%) translateY(2px) rotate(-2deg) scaleY(.85)}50%{transform:translateX(6%) translateY(-3px) rotate(2deg) scaleY(1.08)}}
    .logo-v2-word{position:absolute;z-index:7;left:50%;top:49%;width:88%;transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;gap:.005em;perspective:1100px;pointer-events:none;white-space:nowrap}
    .logo-v2-letter{display:inline-block;font-family:"Arial Black","Trebuchet MS",sans-serif;font-size:clamp(17px,5.7vw,31px);font-weight:900;line-height:1;letter-spacing:-.08em;text-shadow:0 2px 0 rgba(255,255,255,.35),0 4px 10px rgba(0,0,0,.28);opacity:0;animation:v2letter 4.35s cubic-bezier(.15,.8,.2,1) both;animation-delay:var(--delay);transform-style:preserve-3d}
    .logo-v2-letter.space{width:.28em}
    @keyframes v2letter{0%{opacity:0;transform:translate3d(var(--lx),var(--ly),430px) rotateX(var(--lrx)) rotateY(var(--lry)) rotateZ(var(--lrz)) scale(.15)}18%{opacity:1}70%{opacity:1;transform:translate3d(0,0,18px) rotateX(0) rotateY(0) rotateZ(0) scale(1.09)}86%{transform:translate3d(0,0,0) scale(1)}100%{opacity:0;transform:translate3d(0,0,-90px) scale(.75)}}
    .logo-stage.v2-done .logo-v2{opacity:0;transform:scale(.86);filter:blur(7px);transition:opacity .42s ease,transform .55s ease,filter .45s ease}
    .logo-stage.v2-done + .welcome-script{opacity:1!important;transform:none!important}
    @media(prefers-reduced-motion:reduce){.logo-v2{display:none}.logo-stage .brand-logo{opacity:1!important;transform:none!important;filter:none!important}}
  `;
  document.head.appendChild(style);

  stage.querySelectorAll('.season-intro,.logo-letters').forEach(el=>el.remove());
  const img=stage.querySelector('.brand-logo');
  if(!img)return;

  const v2=document.createElement('div');
  v2.className='logo-v2';
  v2.setAttribute('aria-hidden','true');
  v2.innerHTML=`
    <div class="logo-v2-shard tl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v2-shard tr"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v2-shard bl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v2-shard br"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v2-effects">
      <div class="fx-quadrant fx-spring"><i class="blossom">🌸</i><i class="blossom">🌼</i><i class="blossom">🌺</i><i class="blossom">🌸</i></div>
      <div class="fx-quadrant fx-summer"><b class="sea-wave"></b><b class="sea-wave w2"></b><b class="sea-wave w3"></b></div>
      <div class="fx-quadrant fx-autumn"><i class="leaf">🍂</i><i class="leaf">🍁</i><i class="leaf">🍂</i><i class="leaf">🍁</i></div>
      <div class="fx-quadrant fx-winter"><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i></div>
    </div>
    <div class="logo-v2-word"></div>`;
  stage.insertBefore(v2,img);

  const word=v2.querySelector('.logo-v2-word');
  const chars=[
    ['G','#ef8b21','-230px','-170px','72deg','-55deg','-28deg'],
    ['E','#f2b134','195px','-195px','-58deg','80deg','24deg'],
    ['Z','#2eaa62','-245px','25px','88deg','38deg','-48deg'],
    ['İ','#d83b34','220px','120px','-72deg','-75deg','42deg'],
    [' ','','0','0','0','0','0'],
    ['P','#2e8dc4','-205px','195px','72deg','70deg','54deg'],
    ['L','#f0a126','230px','-88px','-86deg','50deg','-22deg'],
    ['A','#60a84b','-175px','-225px','60deg','-88deg','32deg'],
    ['T','#df4a35','185px','215px','-66deg','76deg','-46deg'],
    ['F','#2789b6','-238px','128px','96deg','32deg','28deg'],
    ['O','#ee8b23','238px','0','-60deg','-86deg','52deg'],
    ['R','#65a448','-162px','225px','70deg','85deg','-28deg'],
    ['M','#d84135','172px','-225px','-80deg','-56deg','37deg'],
    ['U','#2c8fb8','0','245px','90deg','46deg','-42deg']
  ];
  let visibleIndex=0;
  chars.forEach(([ch,color,x,y,rx,ry,rz])=>{
    const s=document.createElement('span');
    if(ch===' '){s.className='logo-v2-letter space';s.innerHTML='&nbsp;';word.appendChild(s);return;}
    s.className='logo-v2-letter';
    s.textContent=ch;
    s.style.color=color;
    s.style.setProperty('--lx',x);s.style.setProperty('--ly',y);s.style.setProperty('--lrx',rx);s.style.setProperty('--lry',ry);s.style.setProperty('--lrz',rz);s.style.setProperty('--delay',`${0.04+visibleIndex*0.075}s`);
    visibleIndex++;
    word.appendChild(s);
  });

  window.setTimeout(()=>{
    stage.classList.add('v2-done');
    window.setTimeout(()=>v2.remove(),700);
  },5000);
})();