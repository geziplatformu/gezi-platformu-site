(()=>{
  const phone=document.getElementById('instagramPhone');
  if(!phone)return;

  phone.innerHTML=`<a class="instagram-static-screen" href="https://www.instagram.com/geziplatformuu/" target="_blank" rel="noopener" aria-label="Gezi Platformu Instagram profilini aç"><img src="assets/instagram/geziplatformuu-profile.jpg" alt="Gezi Platformu Instagram profil ekranı"><span class="instagram-static-hint">Instagram profilini açmak için dokunun</span></a>`;

  // Telefonun oval köşelerinde eski siyah kare katmanın görünmesini engelle.
  phone.style.background='transparent';
  phone.style.overflow='hidden';

  const screen=phone.querySelector('.instagram-static-screen');
  const image=screen?.querySelector('img');
  if(screen){
    screen.style.borderRadius='38px';
    screen.style.overflow='hidden';
    screen.style.background='transparent';
  }
  if(image){
    image.style.borderRadius='38px';
  }
})();
