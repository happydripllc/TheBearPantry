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
    slug: "papa-bears-roasted-corn-salsa",
    name: "Papa Bear's Roasted Corn Salsa",
    maker: "papa",
    category: "savory",
    price: 9,
    size: "16 oz jar",
    heat: "Mild",
    badges: ["Papa Bear's Pick"],
    image: "images/CornSalsa.jpg",
    desc: "Charred corn, peppers, and just enough heat to keep you honest.",
    comingSoon: true
  },
  {
    slug: "golden-pineapple-salsa",
    name: "Golden Pineapple Salsa",
    maker: "",
    category: "savory",
    price: 9,
    size: "16 oz jar",
    heat: "Mild",
    badges: ["Seasonal"],
    image: "images/PineappleSalsa.jpg",
    desc: "Sweet, sunny, and the first jar to disappear at every family gathering.",
    comingSoon: true
  },
  {
    slug: "seasonal-pickled-assortment",
    name: "Seasonal Pickled Assortment",
    maker: "",
    category: "pickled",
    price: 12,
    size: "3-jar sampler",
    badges: ["Seasonal"],
    image: "images/PickledGoods.jpg",
    desc: "Whatever Mama Bear got carried away pickling that week. Never the same jar twice.",
    comingSoon: true
  },
  {
    slug: "dried-fruit-drink-boosters",
    name: "Dried Fruit Drink Boosters",
    maker: "",
    category: "pantry",
    price: 6,
    size: "4 oz pouch",
    badges: ["Pantry Favorite"],
    image: "images/DriedFruitDrinkBoosters.jpg",
    desc: "Dehydrated fruit made for dropping into tea, water, or whatever's sweating on the porch table.",
    comingSoon: true
  },
  {
    slug: "mama-bears-banana-bread",
    name: "Mama Bear's Banana Bread",
    maker: "mama",
    category: "seasonal",
    price: 8,
    size: "1 loaf",
    badges: ["Seasonal"],
    image: "images/BananaBread.jpg",
    desc: "Made whenever the bananas on the counter finally win the argument.",
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
