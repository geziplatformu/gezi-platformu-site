// One cover per tour for cards, details and social metadata.
if(window.TOURS){
  const covers=window.TOUR_COVERS={
  "dogu-ekspresi-erzurum-kars-agri-van": "/assets/tours/dogu-ekspresi-cover.avif",
  "kadim-topraklar-turu": "/assets/tours/kadim-topraklar-turu-cover.png",
  "sonbahar-ozel-bati-karadeniz": "/assets/tours/sonbahar-ozel-bati-karadeniz-cover.png",
  "nemrut-rumkale-gaziantep-turu": "/assets/tours/nemrut-rumkale-gaziantep-turu-cover.jpg",
  "yirce-kayin-ormanlari-doga-turu": "/assets/tours/yirce-kayin-ormanlari-doga-turu-cover.jpg",
  "camliyayla-doga-turu": "/assets/tours/camliyayla-doga-turu-cover.jpg",
  "baskonus-menzelet-ali-kayasi": "/assets/tours/baskonus-menzelet-ali-kayasi-cover.png",
  "aladaglar-doga-turu": "/assets/ortaseki-ormanlari-cover.jfif",
  "osmaniye-doga-turu": "/assets/tours/osmaniye-doga-turu-cover.png",
  "sivas-divrigi-turu": "/assets/tours/sivas-divrigi-turu-cover.jpg"
};
  window.TOURS.forEach(t=>{if(covers[t.id])t.image=covers[t.id];});
}
