if (window.TOURS) {
  const camliyayla = window.TOURS.find(t => t.id === 'camliyayla-doga-turu');
  if (camliyayla) camliyayla.image = 'https://sozsakarya.com/sites/1026/uploads/2026/03/07/dhbocyaxuae0dn8-1772840663.jpg';

  const doguEkspresi = window.TOURS.find(t => t.id === 'dogu-ekspresi-erzurum-kars-agri-van');
  if (doguEkspresi) doguEkspresi.image = '/assets/tours/dogu-ekspresi-cover.avif';
}
