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

  /* ---------- Jams & Preserves ---------- */
  {
    slug: "mama-bears-blackberry-jam",
    name: "Mama Bear's Blackberry Jam",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal", "Small Batch"],
    image: "images/BlackberryJam.jpeg",
    desc: "Wild blackberries, slow-simmered until Mama Bear decides it's ready — usually when the kitchen smells right.",
    comingSoon: true
  },
  {
    slug: "sunrise-orange-marmalade",
    name: "Sunrise Orange Marmalade",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/SunriseOrangeMarmalade.jpeg",
    desc: "Bright, bittersweet, and stubbornly good on a warm biscuit.",
    comingSoon: true
  },
  {
    slug: "strawberry-jam",
    name: "Strawberry Jam",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/StrawberryJam.jpeg",
    desc: "Classic, sweet, and the first jar to go missing whenever there's fresh bread in the house.",
    comingSoon: true
  },
  {
    slug: "raspberry-jam",
    name: "Raspberry Jam",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/RaspberryRooftopJam.jpeg",
    desc: "Tart, bright, and seedy in the good way — the way raspberry jam is supposed to be.",
    comingSoon: true
  },
  {
    slug: "aprium-jam",
    name: "Aprium Jam",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/ApriumJam.jpeg",
    desc: "Part apricot, part plum, entirely worth asking Mama Bear what an aprium even is.",
    comingSoon: true
  },
  {
    slug: "ginger-aprium-jam",
    name: "Ginger Aprium Jam",
    maker: "mama",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/GingerApriumJam.jpeg",
    desc: "The aprium jam's spicier cousin — a warm ginger kick right behind the sweetness.",
    comingSoon: true
  },
  {
    slug: "pineapple-preserves",
    name: "Pineapple Preserves",
    maker: "",
    category: "sweet",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/PineapplePreserves.jpeg",
    desc: "Sunny, a little tropical, and gone faster than anyone expects for a jar nobody saw coming.",
    comingSoon: true
  },

  /* ---------- Pickled & Preserved ---------- */
  {
    slug: "cowboy-candy",
    name: "Cowboy Candy",
    maker: "",
    category: "pickled",
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/CowboyCandy.jpeg",
    desc: "Candied jalapeños — sweet, hot, and gone in a hurry on crackers with cream cheese.",
    comingSoon: true
  },
  {
    slug: "pickled-beets",
    name: "Pickled Beets",
    maker: "",
    category: "pickled",
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledBeets.jpeg",
    desc: "Earthy, tangy, and exactly the kind of jar that disappears at a family potluck.",
    comingSoon: true
  },
  {
    slug: "pickled-carrots",
    name: "Pickled Carrots",
    maker: "",
    category: "pickled",
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledCarrots.jpeg",
    desc: "Crisp, tangy, and dangerously snackable straight out of the jar.",
    comingSoon: true
  },
  {
    slug: "pickled-sweet-peppers",
    name: "Pickled Sweet Peppers",
    maker: "",
    category: "pickled",
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledSweetPeppers.jpeg",
    desc: "Sweet, tangy, and the kind of thing you keep meaning to save for a sandwich and never do.",
    comingSoon: true
  },

  /* ---------- Pantry Goods ---------- */
  {
    slug: "sweet-cherries",
    name: "Sweet Cherries",
    maker: "",
    category: "pantry",
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/SweetCherries.jpeg",
    desc: "Put up sweet and simple — good on their own, better over a bowl of vanilla ice cream.",
    comingSoon: true
  },
  {
    slug: "apple-pie-filling",
    name: "Apple Pie Filling",
    maker: "",
    category: "pantry",
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/ApplePieFilling.jpg",
    desc: "Ready for a pie you didn't have to peel and slice for yourself — Mama Bear already did that part.",
    comingSoon: true
  },
  {
    slug: "grizzly-good-applesauce",
    name: "Grizzly Good Applesauce",
    maker: "",
    category: "pantry",
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/GrizzyGoodApplesauce.jpeg",
    desc: "No added nonsense, just good applesauce — the name is the whole pitch.",
    comingSoon: true
  },
  {
    slug: "dinner-carrots",
    name: "Dinner Carrots",
    maker: "",
    category: "pantry",
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/DinnerCarrots.jpeg",
    desc: "Simple canned carrots, ready for the table with nothing else required.",
    comingSoon: true
  },
  {
    slug: "pinto-beans",
    name: "Pinto Beans",
    maker: "",
    category: "pantry",
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/PintoBeans.jpeg",
    desc: "Home-canned pinto beans, ready to heat and eat whenever the pantry's doing the cooking.",
    comingSoon: true
  },
  {
    slug: "dried-onions",
    name: "Dried Onions",
    maker: "",
    category: "pantry",
    size: "4 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/DriedOnions.jpeg",
    desc: "Dehydrated and ready for soups, stews, or anything that needs a little more onion in it.",
    comingSoon: true
  },
  {
    slug: "breadcrumbs",
    name: "Breadcrumbs",
    maker: "",
    category: "pantry",
    size: "8 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/BreadCrumbs.jpeg",
    desc: "Homemade, seasoned, and better than the canister kind by a mile.",
    comingSoon: true
  },
  {
    slug: "italian-dressing",
    name: "Italian Dressing",
    maker: "",
    category: "pantry",
    size: "8 oz bottle",
    badges: ["Pantry Favorite"],
    image: "images/ItalianDressing.jpeg",
    desc: "Made from scratch, no mystery ingredients — just the good stuff in a bottle.",
    comingSoon: true
  },

  /* ---------- Seasonal Specialties ---------- */
  {
    slug: "candied-mixed-nuts",
    name: "Candied Mixed Nuts",
    maker: "",
    category: "seasonal",
    size: "8 oz bag",
    badges: ["Seasonal"],
    image: "images/MixedNuts.png",
    desc: "Pecans, walnuts, and almonds candied sweet, spicy, or both — Mama Bear won't pick a favorite.",
    comingSoon: true
  },
  {
    slug: "chocolate-peanut-butter-fudge",
    name: "Chocolate & Peanut Butter Fudge",
    maker: "",
    category: "seasonal",
    size: "1/2 lb box",
    badges: ["Seasonal"],
    image: "images/ChocolateFudge.png",
    desc: "A seasonal batch made in small runs — can also be made to order if you ask ahead.",
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

/* The couple of items with no dedicated photo yet — a plain list
   instead of a fake product card. */
const PANTRY_LIST = [
  {
    group: "Also In The Pantry",
    items: ["Canned Grapes", "Navy Beans"]
  }
];
