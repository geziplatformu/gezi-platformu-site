window.TOUR_POLICY={
  default:{deposit:0,child:{mode:'adult'}},
  'dogu-ekspresi-erzurum-kars-agri-van':{deposit:2500,child:{mode:'percent',discountPercent:20,label:'7–11 Yaş — %20 İndirimli'}},
  'buyuk-bati-karadeniz':{deposit:0,child:{mode:'fixedDiscount',discount:2500,label:'7–11 Yaş — 2.500 TL İndirimli'}},
  'sonbahar-ozel-bati-karadeniz':{deposit:2000,child:{mode:'fixedDiscount',discount:1000,label:'7–10 Yaş — 1.000 TL İndirimli'}},
  'kadim-topraklar-turu':{deposit:2000,child:{mode:'fixedDiscount',discount:1000,label:'7–10 Yaş — 1.000 TL İndirimli'}},
  'camliyayla-doga-turu':{deposit:600,child:{mode:'adult'}},
  'baskonus-menzelet-ali-kayasi':{deposit:750,child:{mode:'adult'}},
  'nemrut-rumkale-gaziantep-turu':{deposit:1000,child:{mode:'adult'}},
  'sivas-divrigi-turu':{deposit:1000,child:{mode:'adult'}},
  'hatay-turu':{deposit:750,child:{mode:'adult'}}
};
window.getTourPolicy=id=>window.TOUR_POLICY[id]||window.TOUR_POLICY.default;
