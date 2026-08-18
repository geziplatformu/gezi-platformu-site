(()=>{
  const stage=document.getElementById('logoStage');
  if(!stage)return;
  stage.classList.remove('done','v2-done');

  const style=document.createElement('style');
  style.id='logo-animation-v3-style';
  style.textContent=`
    .logo-stage{overflow:visible!important;perspective:1500px!important}
    .logo-stage .brand-logo{opacity:0!important;z-index:9!important;animation:none!important;transition:opacity .48s ease,transform .68s cubic-bezier(.2,.8,.2,1),filter .5s ease!important;transform:scale(.96)!important;filter:blur(3px)!important}
    .logo-stage.v3-done .brand-logo{opacity:1!important;transform:scale(1)!important;filter:none!important}
    .logo-v3{position:absolute;inset:0;z-index:4;pointer-events:none;transform-style:preserve-3d}
    .logo-v3-base{position:absolute;inset:0;border-radius:50%;background:#fff;box-shadow:0 10px 28px rgba(21,32,37,.12)}
    .logo-v3-shard{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform,filter,opacity;animation:v3ShardIn 4.05s cubic-bezier(.14,.76,.2,1) both}
    .logo-v3-shard img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
    .logo-v3-shard.tl{--sx:-165%;--sy:-145%;--rz:-20deg;--rx:16deg;--ry:-24deg;clip-path:polygon(0 0,50% 0,50% 50%,0 50%)}
    .logo-v3-shard.tr{--sx:165%;--sy:-145%;--rz:20deg;--rx:14deg;--ry:24deg;clip-path:polygon(50% 0,100% 0,100% 50%,50% 50%)}
    .logo-v3-shard.bl{--sx:-165%;--sy:145%;--rz:18deg;--rx:-14deg;--ry:-24deg;clip-path:polygon(0 50%,50% 50%,50% 100%,0 100%)}
    .logo-v3-shard.br{--sx:165%;--sy:145%;--rz:-18deg;--rx:-16deg;--ry:24deg;clip-path:polygon(50% 50%,100% 50%,100% 100%,50% 100%)}
    @keyframes v3ShardIn{0%{opacity:0;transform:translate3d(var(--sx),var(--sy),520px) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(.58);filter:blur(8px) saturate(.65)}15%{opacity:1}74%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.035);filter:blur(0) saturate(1.14)}88%{transform:scale(.995)}100%{opacity:1;transform:none;filter:none}}
    .logo-v3-effects{position:absolute;inset:0;z-index:6;border-radius:50%;overflow:hidden;pointer-events:none}
    .fx-quadrant{position:absolute;width:50%;height:50%;overflow:hidden}.fx-spring{left:0;top:0}.fx-summer{right:0;top:0}.fx-autumn{left:0;bottom:0}.fx-winter{right:0;bottom:0}
    .flake,.leaf,.blossom{position:absolute;display:block;user-select:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.18))}
    .flake{top:-16%;color:#fff;font-size:clamp(7px,2vw,13px);animation:v3snow 1.45s linear infinite}.flake:nth-child(1){left:9%;animation-delay:-.2s}.flake:nth-child(2){left:28%;animation-delay:-1.1s}.flake:nth-child(3){left:49%;animation-delay:-.55s}.flake:nth-child(4){left:68%;animation-delay:-.9s}.flake:nth-child(5){left:86%;animation-delay:-.35s}
    @keyframes v3snow{0%{transform:translate3d(0,-10%,0) rotate(0);opacity:0}10%{opacity:.95}100%{transform:translate3d(9px,230%,0) rotate(160deg);opacity:.1}}
    .leaf{top:-18%;font-size:clamp(8px,2.4vw,16px);animation:v3leaf 1.8s ease-in infinite}.leaf:nth-child(1){left:10%;animation-delay:-.2s}.leaf:nth-child(2){left:31%;animation-delay:-1s}.leaf:nth-child(3){left:55%;animation-delay:-.55s}.leaf:nth-child(4){left:78%;animation-delay:-1.35s}
    @keyframes v3leaf{0%{transform:translate3d(-3px,-20%,0) rotate(0);opacity:0}12%{opacity:1}100%{transform:translate3d(22px,235%,0) rotate(390deg);opacity:.15}}
    .blossom{font-size:clamp(8px,2.5vw,17px);opacity:0;animation:v3bloom 1.8s ease-in-out infinite}.blossom:nth-child(1){left:12%;top:16%;animation-delay:-.2s}.blossom:nth-child(2){left:53%;top:24%;animation-delay:-1.1s}.blossom:nth-child(3){left:27%;top:61%;animation-delay:-.65s}.blossom:nth-child(4){left:73%;top:68%;animation-delay:-1.45s}
    @keyframes v3bloom{0%,100%{opacity:.12;transform:scale(.18) rotate(-18deg)}46%,70%{opacity:1;transform:scale(1.08) rotate(8deg)}}
    .sea-wave{position:absolute;left:-15%;width:130%;height:23%;border-radius:50%;border-top:2px solid rgba(255,255,255,.8);background:rgba(255,255,255,.12);bottom:2%;animation:v3wave 1.15s ease-in-out infinite}.sea-wave.w2{bottom:15%;opacity:.66;animation-delay:-.55s}.sea-wave.w3{bottom:29%;opacity:.35;animation-delay:-.2s}
    @keyframes v3wave{0%,100%{transform:translateX(-5%) translateY(2px) rotate(-2deg) scaleY(.85)}50%{transform:translateX(6%) translateY(-3px) rotate(2deg) scaleY(1.08)}}

    .logo-v3-letter-zone{position:absolute;left:12%;right:12%;top:36%;height:28%;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1%;pointer-events:none;perspective:1500px}
    .logo-v3-line{display:flex;align-items:center;justify-content:center;gap:.01em;white-space:nowrap;height:45%}
    .logo-v3-letter{display:inline-block;font-family:"Arial Black","Trebuchet MS",sans-serif;font-size:clamp(13px,4.1vw,23px);font-weight:950;line-height:1;letter-spacing:-.08em;text-shadow:0 1px 0 rgba(255,255,255,.55),0 3px 8px rgba(0,0,0,.25);opacity:0;transform-style:preserve-3d;animation:v3LetterFly 4.5s cubic-bezier(.12,.78,.18,1) both;animation-delay:var(--delay)}
    .logo-v3-line.bottom .logo-v3-letter{font-size:clamp(10px,3.2vw,18px)}
    @keyframes v3LetterFly{0%{opacity:0;transform:translate3d(var(--from-x),var(--from-y),var(--from-z)) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(.12)}12%{opacity:1}42%{transform:translate3d(var(--mid-x),var(--mid-y),180px) rotateX(calc(var(--rx) * .35)) rotateY(calc(var(--ry) * .35)) rotateZ(calc(var(--rz) * .35)) scale(.72)}74%{opacity:1;transform:translate3d(0,0,18px) rotateX(0) rotateY(0) rotateZ(0) scale(1.12)}88%{transform:translate3d(0,0,0) scale(.98)}100%{opacity:1;transform:none}}
    .logo-stage.v3-done .logo-v3-letter-zone{opacity:0;transition:opacity .18s ease}
    .logo-stage.v3-done .logo-v3{opacity:0;transition:opacity .48s ease .05s}
    .logo-stage.v3-done + .welcome-script{opacity:1!important;transform:none!important}
    @media(prefers-reduced-motion:reduce){.logo-v3{display:none}.logo-stage .brand-logo{opacity:1!important;transform:none!important;filter:none!important}}
  `;
  document.head.appendChild(style);

  stage.querySelectorAll('.season-intro,.logo-letters,.logo-v2').forEach(el=>el.remove());
  const img=stage.querySelector('.brand-logo');
  if(!img)return;

  const v3=document.createElement('div');
  v3.className='logo-v3';
  v3.setAttribute('aria-hidden','true');
  v3.innerHTML=`
    <div class="logo-v3-base"></div>
    <div class="logo-v3-shard tl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v3-shard tr"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v3-shard bl"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v3-shard br"><img src="assets/gezi-platformu-logo.webp" alt=""></div>
    <div class="logo-v3-effects">
      <div class="fx-quadrant fx-spring"><i class="blossom">🌸</i><i class="blossom">🌼</i><i class="blossom">🌺</i><i class="blossom">🌸</i></div>
      <div class="fx-quadrant fx-summer"><b class="sea-wave"></b><b class="sea-wave w2"></b><b class="sea-wave w3"></b></div>
      <div class="fx-quadrant fx-autumn"><i class="leaf">🍂</i><i class="leaf">🍁</i><i class="leaf">🍂</i><i class="leaf">🍁</i></div>
      <div class="fx-quadrant fx-winter"><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i><i class="flake">❄</i><i class="flake">●</i></div>
    </div>
    <div class="logo-v3-letter-zone"><div class="logo-v3-line top"></div><div class="logo-v3-line bottom"></div></div>`;
  stage.insertBefore(v3,img);

  const top=v3.querySelector('.logo-v3-line.top');
  const bottom=v3.querySelector('.logo-v3-line.bottom');
  const routes=[
    ['-80vw','-58vh','520px','32vw','-20vh','82deg','-64deg','-48deg'],
    ['18vw','-72vh','620px','-10vw','-28vh','-78deg','76deg','35deg'],
    ['-92vw','12vh','470px','-38vw','-4vh','96deg','42deg','-66deg'],
    ['88vw','-18vh','650px','32vw','-10vh','-88deg','-82deg','54deg'],
    ['-36vw','78vh','600px','-16vw','28vh','74deg','68deg','72deg'],
    ['96vw','54vh','490px','42vw','18vh','-92deg','56deg','-38deg'],
    ['-70vw','-82vh','700px','-26vw','-34vh','64deg','-94deg','44deg'],
    ['48vw','82vh','580px','18vw','34vh','-72deg','82deg','-58deg'],
    ['-98vw','58vh','530px','-43vw','22vh','102deg','38deg','34deg'],
    ['94vw','4vh','610px','38vw','-2vh','-66deg','-92deg','64deg'],
    ['-28vw','88vh','560px','-14vw','38vh','76deg','88deg','-42deg'],
    ['42vw','-86vh','680px','16vw','-36vh','-84deg','-62deg','52deg'],
    ['6vw','92vh','590px','2vw','42vh','98deg','52deg','-54deg']
  ];
  const colors=['#ef8b21','#f2b134','#2eaa62','#d83b34','#2e8dc4','#f0a126','#60a84b','#df4a35','#2789b6','#ee8b23','#65a448','#d84135','#2c8fb8'];
  const addLetters=(text,container,startIndex)=>{
    [...text].forEach((ch,i)=>{
      const idx=startIndex+i,r=routes[idx],s=document.createElement('span');
      s.className='logo-v3-letter';s.textContent=ch;s.style.color=colors[idx];
      s.style.setProperty('--from-x',r[0]);s.style.setProperty('--from-y',r[1]);s.style.setProperty('--from-z',r[2]);s.style.setProperty('--mid-x',r[3]);s.style.setProperty('--mid-y',r[4]);s.style.setProperty('--rx',r[5]);s.style.setProperty('--ry',r[6]);s.style.setProperty('--rz',r[7]);s.style.setProperty('--delay',`${0.03+idx*0.055}s`);
      container.appendChild(s);
    });
  };
  addLetters('GEZİ',top,0);
  addLetters('PLATFORMU',bottom,4);

  window.setTimeout(()=>{
    stage.classList.add('v3-done');
    window.setTimeout(()=>v3.remove(),650);
  },5000);
})();