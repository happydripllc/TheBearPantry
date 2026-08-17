/* THE BEAR PANTRY — product data
   Single source of truth for the shop grid, homepage featured cards,
   quick view modal, and cart line items. Add a new jar here and it
   shows up everywhere automatically. */

const PRODUCTS = [
  {
    slug: "papa-bears-smokey-jalapeno-salsa",
    name: "Papa Bear's Smokey Jalapeño Salsa",
    maker: "papa",
    category: "savory",
    price: 9.5,
    size: "16 oz jar",
    heat: "Medium",
    badges: ["Small Batch", "Papa Bear's Pick"],
    image: "images/papa-bears-smokey-jalapeno-salsa.png",
    desc: "Roasted jalapeños, ripe tomatoes, and a slow-smoked kick. Papa Bear's favorite way to clear a sinus.",
    ingredients: "Tomatoes, jalapeños, onion, garlic, cilantro, lime, salt, smoked paprika.",
    comingSoon: false,
    detail: "shop/papa-bears-smokey-jalapeno-salsa.html"
  },
  {
    slug: "mama-bears-bread-and-butter-pickles",
    name: "Mama Bear's Bread & Butter Pickles",
    maker: "mama",
    category: "pickled",
    price: 8.5,
    size: "16 oz jar",
    badges: ["Small Batch", "Mama Bear's Pick"],
    image: "images/mama-bears-bread-and-butter-pickles.png",
    desc: "Sweet, tangy, and crisp enough to snap. The jar Mama Bear quietly hides from the grandkids.",
    ingredients: "Cucumbers, onion, vinegar, sugar, mustard seed, turmeric, celery seed.",
    comingSoon: false,
    detail: "shop/mama-bears-bread-and-butter-pickles.html"
  },
  {
    slug: "papa-bears-classic-green-beans",
    name: "Papa Bear's Classic Green Beans",
    maker: "papa",
    category: "pantry",
    price: 7.5,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/papa-bears-classic-green-beans.png",
    desc: "Simple, tender, put-up-right green beans — the way Papa Bear always asked for them at supper.",
    ingredients: "Green beans, water, salt.",
    comingSoon: false,
    detail: "shop/papa-bears-classic-green-beans.html"
  },
  {
    slug: "mama-bears-blackberry-jam",
    name: "Mama Bear's Blackberry Jam",
    maker: "mama",
    category: "sweet",
    price: 8,
    size: "8 oz jar",
    badges: ["Seasonal", "Small Batch"],
    image: "images/BlackberryJam.jpg",
    desc: "Wild blackberries, slow-simmered until Mama Bear decides it's ready — usually when the kitchen smells right.",
    comingSoon: true
  },
  {
    slug: "sunrise-orange-marmalade",
    name: "Sunrise Orange Marmalade",
    maker: "mama",
    category: "sweet",
    price: 8,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/Beans-orange-marmalade.jpg",
    desc: "Bright, bittersweet, and stubbornly good on a warm biscuit.",
    comingSoon: true
  },
  {
    slug: "cowboy-candy",
    name: "Cowboy Candy",
    maker: "",
    category: "pickled",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledGoods.jpg",
    desc: "Candied jalapeños — sweet, hot, and gone in a hurry on crackers with cream cheese.",
    comingSoon: true
  },
  {
    slug: "the-welcome-basket",
    name: "The Welcome Basket",
    maker: "",
    category: "gift",
    price: 45,
    size: "Gift box · 4 jars",
    badges: ["Gift Set"],
    image: "images/TheBearPantryShelf.jpg",
    desc: "A little bit of everything, boxed up for someone who needs a reason to smile.",
    comingSoon: true
  }
];

const CATEGORY_LABELS = {
  sweet: "Jams & Preserves",
  savory: "Salsa & Sauces",
  pickled: "Pickled & Preserved",
  pantry: "Pantry Goods",
  seasonal: "Seasonal",
  gift: "Gift Sets"
};

/* Everything else Mama Bear makes — no dedicated photography yet,
   so these live in a plain list instead of a fake product card. */
const PANTRY_LIST = [
  {
    group: "More Jams & Preserves",
    items: ["Strawberry Jam", "Raspberry Jam", "Aprium Jam", "Ginger Aprium Jam"]
  },
  {
    group: "Pickled & Canned Vegetables",
    items: ["Beets", "Pickled Beets", "Pickled Carrots", "Pickled Sweet Peppers", "Carrots"]
  },
  {
    group: "Pantry & Canned Goods",
    items: ["Canned Pineapple", "Canned Grapes", "Canned Cherries", "Canned Chicken", "Apple Pie Filling", "Chicken Stew", "Chili with Beans", "Pinto Beans with Ham", "Navy Beans with Ham", "Dried Onions", "Breadcrumbs", "Italian Dressing", "Applesauce"]
  },
  {
    group: "Coming Soon Specialties",
    items: ["Candied Pecans, Walnuts & Almonds — sweet, spicy or both", "Seasonal Chocolate & Peanut Butter Fudge"]
  }
];
