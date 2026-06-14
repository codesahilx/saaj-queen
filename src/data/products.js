export const categories = [
  { id: 'necklace', label: 'Necklaces',      img: '/necklace1.jpeg' },
  { id: 'earring',  label: 'Earrings',        img: null },
  { id: 'ring',     label: 'Finger Rings',    img: null },
  { id: 'anklet',   label: 'Anklets',         img: null },
  { id: 'watch',    label: 'Vintage Watches', img: '/watch1.jpeg' },
  { id: 'bracelet', label: 'Bracelets',       img: null },
  { id: 'bag',      label: 'Bags',            img: null },
  { id: 'giftbox',  label: 'Gift Boxes',      img: null },
];

export const products = [];

export const heroSlides = [
  {
    id: 1,
    title: 'Wear Your',
    titleAccent: 'Royal Elegance',
    subtitle: 'Handcrafted jewellery, watches & accessories for the queen in you',
    img: '/necklace4.jpeg',
    cta: 'Explore Collection',
    ctaLink: '/products',
  },
  {
    id: 2,
    title: 'Gifts That',
    titleAccent: 'Say It All',
    subtitle: 'Curated gift boxes & bridal sets — wrapped in luxury, delivered with love',
    img: '/necklace6.jpeg',
    cta: 'Shop Gift Boxes',
    ctaLink: '/products?category=giftbox',
  },
  {
    id: 3,
    title: 'Upto 50% Off',
    titleAccent: 'On All Orders',
    subtitle: 'Limited time sale — premium accessories at prices that feel like celebrations',
    img: '/watch2.jpeg',
    cta: 'Shop Sale',
    ctaLink: '/products?sale=1',
  },
];
