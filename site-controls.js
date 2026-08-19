(()=>{
  const STORAGE_THEME='gp-theme';
  const STORAGE_LANG='gp-language';
  const root=document.documentElement;

  function saved(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
  function store(key,value){try{localStorage.setItem(key,value)}catch{}}

  function injectStyles(){
    if(document.getElementById('gp-site-controls-style'))return;
    const style=document.createElement('style');
    style.id='gp-site-controls-style';
    style.textContent=`
      .gp-site-controls{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:2147483000;display:flex;align-items:center;gap:6px;padding:5px;border:1px solid rgba(18,28,31,.12);border-radius:14px;background:rgba(255,255,255,.88);box-shadow:0 8px 26px rgba(19,31,35,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .gp-site-control{height:34px;min-width:42px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:0;border-radius:10px;background:#f0f4f3;color:#17211f;font:800 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(25,43,38,.08);transition:transform .18s ease,background .18s ease,color .18s ease}
      .gp-site-control:hover{transform:translateY(-1px)}
      .gp-site-control:active{transform:translateY(0) scale(.97)}
      .gp-site-control .gp-icon{font-size:15px;line-height:1}
      #google_translate_element_gp{position:fixed!important;left:-9999px!important;top:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}
      .goog-te-banner-frame.skiptranslate,.goog-te-banner-frame,.goog-te-gadget-icon{display:none!important}
      body{top:0!important}
      html[data-site-theme="dark"]{color-scheme:dark;background:#0c1110!important}
      html[data-site-theme="dark"] body{background:#0c1110!important;color:#edf3f0!important}
      html[data-site-theme="dark"] .gp-site-controls{background:rgba(18,25,23,.9);border-color:rgba(255,255,255,.11);box-shadow:0 8px 28px rgba(0,0,0,.34)}
      html[data-site-theme="dark"] .gp-site-control{background:#27302d;color:#f5f8f7;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
      html[data-site-theme="dark"] .site-header,html[data-site-theme="dark"] header,html[data-site-theme="dark"] main,html[data-site-theme="dark"] section,html[data-site-theme="dark"] footer{color:#edf3f0}
      html[data-site-theme="dark"] .tour-card,html[data-site-theme="dark"] .card,html[data-site-theme="dark"] .faq-item,html[data-site-theme="dark"] .info-card,html[data-site-theme="dark"] .detail-card,html[data-site-theme="dark"] .contact-card,html[data-site-theme="dark"] .about-card,html[data-site-theme="dark"] .modal-card{background:#141b19!important;color:#edf3f0!important;border-color:#28332f!important;box-shadow:0 14px 36px rgba(0,0,0,.22)!important}
      html[data-site-theme="dark"] .tour-body,html[data-site-theme="dark"] .section-heading,html[data-site-theme="dark"] .section-heading p,html[data-site-theme="dark"] .tour-subtitle,html[data-site-theme="dark"] .tour-meta,html[data-site-theme="dark"] .muted,html[data-site-theme="dark"] p{color:#c7d1cd!important}
      html[data-site-theme="dark"] h1,html[data-site-theme="dark"] h2,html[data-site-theme="dark"] h3,html[data-site-theme="dark"] h4,html[data-site-theme="dark"] strong{color:#f4f8f6}
      html[data-site-theme="dark"] nav a,html[data-site-theme="dark"] .nav-link{color:#e8efec!important}
      html[data-site-theme="dark"] input,html[data-site-theme="dark"] textarea,html[data-site-theme="dark"] select{background:#101614!important;color:#eef4f1!important;border-color:#33403b!important}
      @media(max-width:560px){.gp-site-controls{top:max(7px,env(safe-area-inset-top));right:max(7px,env(safe-area-inset-right));gap:4px;padding:4px;border-radius:12px}.gp-site-control{height:31px;min-width:38px;padding:0 8px;font-size:11px}.gp-site-control .gp-icon{font-size:14px}}
    `;
    document.head.appendChild(style);
  }

  let theme=saved(STORAGE_THEME,matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  let lang=saved(STORAGE_LANG,'tr');

  function applyTheme(next){
    theme=next;
    root.dataset.siteTheme=theme;
    store(STORAGE_THEME,theme);
    const btn=document.getElementById('gpThemeToggle');
    if(btn){btn.innerHTML=theme==='dark'?'<span class="gp-icon">☀️</span>':'<span class="gp-icon">🌙</span>';btn.title=theme==='dark'?'Açık temaya geç':'Koyu temaya geç';btn.setAttribute('aria-label',btn.title)}
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',theme==='dark'?'#0c1110':'#ffffff');
  }

  function setTranslateCookie(code){
    const value=code==='en'?'/tr/en':'/tr/tr';
    document.cookie=`googtrans=${value};path=/;SameSite=Lax`;
    try{document.cookie=`googtrans=${value};path=/;domain=.geziplatformuu.com;SameSite=Lax`}catch{}
  }

  function updateLangButton(){
    const btn=document.getElementById('gpLanguageToggle');
    if(!btn)return;
    btn.textContent=lang==='en'?'TR':'EN';
    btn.title=lang==='en'?'Türkçe görüntüle':'View in English';
    btn.setAttribute('aria-label',btn.title);
  }

  function useGoogleCombo(code,attempt=0){
    const combo=document.querySelector('.goog-te-combo');
    if(combo){
      combo.value=code;
      combo.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }
    if(attempt<18){setTimeout(()=>useGoogleCombo(code,attempt+1),180);return true}
    return false;
  }

  function applyLanguage(next,userInitiated=false){
    lang=next;
    store(STORAGE_LANG,lang);
    root.lang=lang==='en'?'en':'tr';
    updateLangButton();
    setTranslateCookie(lang);
    useGoogleCombo(lang==='en'?'en':'tr');
    if(userInitiated&&lang==='tr')setTimeout(()=>location.reload(),220);
  }

  function googleTranslateElementInitGP(){
    if(!window.google?.translate?.TranslateElement)return;
    new google.translate.TranslateElement({pageLanguage:'tr',includedLanguages:'en,tr',autoDisplay:false},'google_translate_element_gp');
    if(lang==='en')setTimeout(()=>useGoogleCombo('en'),300);
  }
  window.googleTranslateElementInitGP=googleTranslateElementInitGP;

  function loadTranslator(){
    if(document.querySelector('script[data-gp-google-translate]'))return;
    const holder=document.createElement('div');holder.id='google_translate_element_gp';document.body.appendChild(holder);
    const script=document.createElement('script');
    script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInitGP';
    script.async=true;script.dataset.gpGoogleTranslate='1';document.body.appendChild(script);
  }

  function mount(){
    injectStyles();
    const wrap=document.createElement('div');
    wrap.className='gp-site-controls skiptranslate';
    wrap.setAttribute('translate','no');
    wrap.innerHTML='<button id="gpLanguageToggle" class="gp-site-control" type="button" aria-label="View in English">EN</button><button id="gpThemeToggle" class="gp-site-control" type="button" aria-label="Koyu temaya geç"><span class="gp-icon">🌙</span></button>';
    document.body.appendChild(wrap);
    document.getElementById('gpThemeToggle').addEventListener('click',()=>applyTheme(theme==='dark'?'light':'dark'));
    document.getElementById('gpLanguageToggle').addEventListener('click',()=>applyLanguage(lang==='en'?'tr':'en',true));
    applyTheme(theme);
    updateLangButton();
    loadTranslator();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
