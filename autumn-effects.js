(()=>{
  if(window.__gpAutumnEffectsLoaded)return;
  window.__gpAutumnEffectsLoaded=true;

  const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion)return;

  const style=document.createElement('style');
  style.id='gp-autumn-effects-style';
  style.textContent=`
    .gp-autumn-warmth{position:fixed;inset:0;pointer-events:none;z-index:2147482997;background:linear-gradient(180deg,rgba(173,94,31,.028) 0%,rgba(205,142,65,.012) 22%,rgba(255,255,255,0) 52%);mix-blend-mode:multiply}
    .gp-autumn-leaves{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:2147482998;contain:layout style paint}
    .gp-autumn-leaf{position:absolute;top:-12vh;left:var(--x);width:var(--size);height:var(--size);opacity:0;will-change:transform,opacity;filter:drop-shadow(0 2px 2px rgba(59,35,16,.12));animation:gpLeafFall var(--duration) linear var(--delay) forwards}
    .gp-autumn-leaf svg{display:block;width:100%;height:100%;transform-origin:50% 50%;animation:gpLeafSpin var(--spin) ease-in-out infinite alternate}
    @keyframes gpLeafFall{
      0%{transform:translate3d(0,-8vh,0) rotate(0deg);opacity:0}
      7%{opacity:var(--opacity)}
      42%{transform:translate3d(var(--drift1),42vh,0) rotate(115deg);opacity:var(--opacity)}
      76%{transform:translate3d(var(--drift2),78vh,0) rotate(245deg);opacity:calc(var(--opacity) * .9)}
      100%{transform:translate3d(var(--drift3),116vh,0) rotate(390deg);opacity:0}
    }
    @keyframes gpLeafSpin{0%{transform:rotateY(-48deg) rotateZ(-12deg) scale(.92)}100%{transform:rotateY(52deg) rotateZ(18deg) scale(1.04)}}
    @media(max-width:700px){.gp-autumn-warmth{background:linear-gradient(180deg,rgba(173,94,31,.022),rgba(255,255,255,0) 48%)}.gp-autumn-leaf{filter:drop-shadow(0 1px 1px rgba(59,35,16,.09))}}
  `;
  document.head.appendChild(style);

  const warmth=document.createElement('div');
  warmth.className='gp-autumn-warmth';
  warmth.setAttribute('aria-hidden','true');
  document.body.appendChild(warmth);

  const layer=document.createElement('div');
  layer.className='gp-autumn-leaves';
  layer.setAttribute('aria-hidden','true');
  document.body.appendChild(layer);

  const colors=['#9b4f23','#b76a2c','#c88732','#86502d','#d29a3a','#a85b27'];
  const paths=[
    'M50 3C39 19 21 26 18 46c-3 21 13 39 32 51 19-12 35-30 32-51C79 26 61 19 50 3Z',
    'M50 4c-8 14-17 17-29 25 7 4 11 10 8 18-3 7-10 10-15 15 10 2 16 8 15 18 8-1 14 2 21 16 7-14 13-17 21-16-1-10 5-16 15-18-5-5-12-8-15-15-3-8 1-14 8-18C67 21 58 18 50 4Z'
  ];

  const isMobile=()=>window.innerWidth<=700;
  const maxLeaves=()=>isMobile()?4:7;
  const rand=(min,max)=>Math.random()*(max-min)+min;

  function makeLeaf(initial=false){
    if(layer.childElementCount>=maxLeaves())return;
    const leaf=document.createElement('span');
    leaf.className='gp-autumn-leaf';
    const size=isMobile()?rand(17,29):rand(18,34);
    const startX=rand(2,96);
    const sideBias=startX<30?1:startX>70?-1:(Math.random()>.5?1:-1);
    const d1=rand(18,58)*sideBias;
    const d2=d1+rand(-32,38);
    const d3=d2+rand(-36,42);
    const duration=rand(11,19);
    const delay=initial?rand(0,.9):0;
    const opacity=rand(.42,.72);
    const spin=rand(2.8,5.2);
    const color=colors[Math.floor(Math.random()*colors.length)];
    const path=paths[Math.floor(Math.random()*paths.length)];
    leaf.style.cssText=`--x:${startX}vw;--size:${size}px;--drift1:${d1}px;--drift2:${d2}px;--drift3:${d3}px;--duration:${duration}s;--delay:${delay}s;--opacity:${opacity};--spin:${spin}s`;
    leaf.innerHTML=`<svg viewBox="0 0 100 100" focusable="false" aria-hidden="true"><path d="${path}" fill="${color}"/><path d="M50 18C49 39 50 66 48 94" fill="none" stroke="rgba(91,51,24,.42)" stroke-width="3" stroke-linecap="round"/></svg>`;
    leaf.addEventListener('animationend',()=>leaf.remove(),{once:true});
    layer.appendChild(leaf);
  }

  // Açılışta kısa bir sonbahar hissi; ardından seyrek ve sakin devam eder.
  const initialCount=isMobile()?4:7;
  for(let i=0;i<initialCount;i++)setTimeout(()=>makeLeaf(true),i*230);

  let timer;
  const scheduleNext=()=>{
    clearTimeout(timer);
    const wait=isMobile()?rand(3300,5200):rand(2400,4300);
    timer=setTimeout(()=>{makeLeaf(false);scheduleNext();},wait);
  };
  scheduleNext();

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(timer);}
    else scheduleNext();
  });
})();
