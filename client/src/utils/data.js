import { IMAGES } from './images';

export const ALL_PRODUCTS = [
  { id:1,  title: 'Samsung 55" 4K Smart TV',     category:'electronics', image: IMAGES.samsung_tv,   price:'42,999', oldPrice:'62,999', discount:32, reviews:'1,285' },
  { id:2,  title: 'HP Laptop 15s Core i5',       category:'electronics', image: IMAGES.laptop,       price:'36,999', oldPrice:'51,999', discount:28, reviews:'985'   },
  { id:3,  title: 'LG Refrigerator 350L',        category:'appliances',  image: IMAGES.refrigerator, price:'34,999', oldPrice:'58,999', discount:40, reviews:'632'   },
  { id:4,  title: 'Sofa Set 3+2 Seater',         category:'furniture',   image: IMAGES.sofa,         price:'24,999', oldPrice:'33,999', discount:25, reviews:'421'   },
  { id:5,  title: 'Aashirvaad Atta 5 Kg',        category:'grocery',     image: IMAGES.atta,         price:'299',    oldPrice:'429',    discount:30, reviews:'5,120' },
  { id:6,  title: 'Mixer Grinder 750W',          category:'appliances',  image: IMAGES.mixer,        price:'2,999',  oldPrice:'4,599',  discount:35, reviews:'1,980' },
  { id:7,  title: "Men's Casual Shirt",          category:'fashion',     image: IMAGES.shirt,        price:'799',    oldPrice:'999',    discount:20, reviews:'3,100' },
  { id:8,  title: 'Ergonomic Office Chair',      category:'furniture',   image: IMAGES.chair,        price:'4,999',  oldPrice:'6,099',  discount:18, reviews:'960'   },
  { id:9,  title: 'Bosch Washing Machine 7kg',   category:'appliances',  image: IMAGES.washing,      price:'28,999', oldPrice:'42,000', discount:31, reviews:'740'   },
  { id:10, title: 'OnePlus 12 5G Mobile',        category:'electronics', image: IMAGES.mobile,       price:'64,999', oldPrice:'74,999', discount:13, reviews:'2,300' },
  { id:11, title: 'Sony WH-1000XM5 Headphones', category:'electronics', image: IMAGES.headphones,   price:'24,990', oldPrice:'34,990', discount:28, reviews:'1,540' },
  { id:12, title: 'India Gate Basmati Rice 5Kg', category:'grocery',     image: IMAGES.rice,         price:'499',    oldPrice:'649',    discount:23, reviews:'8,420' },
];

export const CATEGORY_DATA = {
  electronics: { label: 'Electronics',      image: IMAGES.electronics, desc: 'TVs, Laptops, Mobiles & more' },
  furniture:   { label: 'Furniture',        image: IMAGES.furniture,   desc: 'Sofas, Beds, Dining & more'   },
  grocery:     { label: 'Grocery',          image: IMAGES.grocery,     desc: 'Fresh staples & daily needs'   },
  fashion:     { label: 'Cloth & Fashion',  image: IMAGES.fashion,     desc: 'Men, Women & Kids clothing'    },
  kitchen:     { label: 'Home & Kitchen',   image: IMAGES.kitchen,     desc: 'Cookware, storage & décor'     },
  beauty:      { label: 'Beauty & Care',    image: IMAGES.beauty,      desc: 'Skincare, hair & wellness'     },
  appliances:  { label: 'Appliances',       image: IMAGES.electronics, desc: 'Washing, Fridge, Mixer & more' },
};
