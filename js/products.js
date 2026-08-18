/* THE BEAR PANTRY — product data
   Single source of truth for the shop grid, homepage featured cards,
   quick view modal, and cart line items. Add a new jar here and it
   shows up everywhere automatically.

   Pricing note: prices below are DFW-market estimates (small-batch/
   farmers-market comps researched Aug 2026 — 8oz jams ~$6-12,
   16oz pickled/canned ~$8-12 urban artisan, candied nuts ~$12/12oz jar,
   fudge ~$12-20/lb). Treat as a starting point, not final — easy to
   adjust per item once real sales data comes in.

   Product names below match what's printed on each jar's label art —
   check the label image before renaming anything. */

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
    gallery: ["images/JalapenoSalsaOnGrill.jpg", "images/JalapenoSalsa.jpg"],
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
    ingredients: "Green beans, salt.",
    comingSoon: false,
    detail: "shop/papa-bears-classic-green-beans.html"
  },
  {
    slug: "papa-bears-kickin-corn-black-bean-salsa",
    name: "Papa Bear's Kickin Corn Black Bean Salsa",
    maker: "papa",
    category: "savory",
    price: 9,
    size: "16 oz jar",
    heat: "Hot",
    badges: ["Small Batch"],
    image: "images/CornBlackBeanSalsa.jpg",
    gallery: ["images/CornSalsa.jpg"],
    desc: "Corn, black beans, and a real kick — the salsa Papa Bear reaches for when he wants everyone at the table reaching for water.",
    ingredients: "Tomatoes, onion, corn, black beans, cumin, cilantro, brown sugar.",
    comingSoon: false
  },
  {
    slug: "mama-bears-magic-spaghetti-sauce",
    name: "Mama Bear's Magic Spaghetti Sauce",
    maker: "mama",
    category: "savory",
    price: 11,
    size: "24 oz jar",
    badges: ["Small Batch", "Mama Bear's Pick"],
    image: "images/SpaghettiSauce.jpeg",
    desc: "Slow-simmered, deeply savory, and somehow always the reason dinner runs a little late — in the best way.",
    ingredients: "Tomatoes, onion, garlic, brown sugar, oregano, thyme, basil.",
    comingSoon: false
  },

  /* ---------- Jams & Preserves ---------- */
  {
    slug: "mama-bears-blackberry-jam",
    name: "Blackberry Bear Hug Jam",
    maker: "mama",
    category: "sweet",
    price: 8.5,
    size: "8 oz jar",
    badges: ["Seasonal", "Small Batch"],
    image: "images/BlackberryJam.jpeg",
    gallery: ["images/BlackberryJamToast.jpg"],
    desc: "Wild blackberries, slow-simmered until Mama Bear decides it's ready — usually when the kitchen smells right.",
    ingredients: "Blackberries, sugar, pectin.",
    comingSoon: false
  },
  {
    slug: "sunrise-orange-marmalade",
    name: "Mama Bear's Sunrise Orange Marmalade",
    maker: "mama",
    category: "sweet",
    price: 8.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/SunriseOrangeMarmalade.jpeg",
    desc: "Bright, bittersweet, and stubbornly good on a warm biscuit.",
    ingredients: "Oranges, lemons, pectin, sugar.",
    comingSoon: false
  },
  {
    slug: "strawberry-jam",
    name: "Strawberry Snuggle Jam",
    maker: "mama",
    category: "sweet",
    price: 8,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/StrawberryJam.jpeg",
    desc: "Classic, sweet, and the first jar to go missing whenever there's fresh bread in the house.",
    comingSoon: false
  },
  {
    slug: "raspberry-jam",
    name: "Raspberry Rooftop Jam",
    maker: "mama",
    category: "sweet",
    price: 8.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/RaspberryRooftopJam.jpeg",
    desc: "Tart, bright, and seedy in the good way — the way raspberry jam is supposed to be.",
    ingredients: "Raspberries, sugar, lemon juice.",
    comingSoon: false
  },
  {
    slug: "aprium-jam",
    name: "Aprium Sunshine Jam",
    maker: "mama",
    category: "sweet",
    price: 9,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/ApriumJam.jpeg",
    desc: "Part apricot, part plum, entirely worth asking Mama Bear what an aprium even is.",
    ingredients: "Aprium plums, sugar, pectin, lemon juice.",
    comingSoon: false
  },
  {
    slug: "ginger-aprium-jam",
    name: "Golden Bear Ginger Aprium Jam",
    maker: "mama",
    category: "sweet",
    price: 9.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/GingerApriumJam.jpeg",
    desc: "The aprium jam's spicier cousin — a warm ginger kick right behind the sweetness.",
    ingredients: "Aprium plums, ginger, sugar, pectin, lemon juice.",
    comingSoon: false
  },
  {
    slug: "papa-bears-plum-jam",
    name: "Papa Bear's Plum Jam",
    maker: "papa",
    category: "sweet",
    price: 8.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/PlumJam.jpeg",
    desc: "Sweet and tart in equal measure — the jar that goes quiet fast whenever plums are actually in season.",
    ingredients: "Plums, sugar, pectin, lemon juice.",
    comingSoon: false
  },
  {
    slug: "pineapple-preserves",
    name: "Papa Bear's Pineapple Preserves",
    maker: "papa",
    category: "sweet",
    price: 8.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/PineapplePreserves.jpeg",
    desc: "Sunny, a little tropical, and gone faster than anyone expects for a jar nobody saw coming.",
    ingredients: "Pineapple, lemon juice, apple juice.",
    comingSoon: false
  },
  {
    slug: "little-bears-sweet-grapes",
    name: "Little Bear's Sweet Grapes",
    maker: "",
    category: "sweet",
    price: 8.5,
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/Grapes.png",
    desc: "Sweet, jarred whole grapes — the pantry snack nobody expects until they try it.",
    ingredients: "Grapes, lemon juice.",
    comingSoon: false
  },

  /* ---------- Pickled & Preserved ---------- */
  {
    slug: "cowboy-candy",
    name: "Mama Bear's Cowboy Candy",
    maker: "mama",
    category: "pickled",
    price: 9.5,
    size: "8 oz jar",
    badges: ["Seasonal"],
    image: "images/CowboyCandy.jpeg",
    gallery: ["images/PineappleSalsa.jpg"], // misnamed file — actually a real photo of the jarred candied jalapeños
    desc: "Candied jalapeños — sweet, hot, and gone in a hurry on crackers with cream cheese.",
    ingredients: "Pineapple, jalapeño, lemon juice.",
    comingSoon: false
  },
  {
    slug: "pickled-beets",
    name: "Mama Bear's Pickled Beets",
    maker: "mama",
    category: "pickled",
    price: 8.5,
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledBeets.jpeg",
    desc: "Earthy, tangy, and exactly the kind of jar that disappears at a family potluck.",
    ingredients: "Beets, vinegar, brown sugar, pickling spices.",
    comingSoon: false
  },
  {
    slug: "pickled-carrots",
    name: "Mama Bear's Pickled Carrots",
    maker: "mama",
    category: "pickled",
    price: 8,
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledCarrots.jpeg",
    desc: "Crisp, tangy, and dangerously snackable straight out of the jar.",
    ingredients: "Carrots, onion, vinegar, brown sugar, pickling spices.",
    comingSoon: false
  },
  {
    slug: "pickled-sweet-peppers",
    name: "Papa Bear's Pickled Sweet Peppers",
    maker: "papa",
    category: "pickled",
    price: 8.5,
    size: "16 oz jar",
    badges: ["Seasonal"],
    image: "images/PickledSweetPeppers.jpeg",
    desc: "Sweet, tangy, and the kind of thing you keep meaning to save for a sandwich and never do.",
    comingSoon: false
  },

  /* ---------- Pantry Goods ---------- */
  {
    slug: "sweet-cherries",
    name: "Mama Bear's Sweet Cherries",
    maker: "mama",
    category: "pantry",
    price: 9,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/SweetCherries.jpeg",
    desc: "Put up sweet and simple — good on their own, better over a bowl of vanilla ice cream.",
    ingredients: "Cherries, lemon juice.",
    comingSoon: false
  },
  {
    slug: "apple-pie-filling",
    name: "Papa Bear's Apple Pie Filling",
    maker: "papa",
    category: "pantry",
    price: 9,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/ApplePieFilling.jpg",
    desc: "Ready for a pie you didn't have to peel and slice for yourself — Mama Bear already did that part.",
    ingredients: "Apples, brown sugar, pectin, cinnamon, ginger.",
    comingSoon: false
  },
  {
    slug: "grizzly-good-applesauce",
    name: "Papa Bear's Grizzly Good Applesauce",
    maker: "papa",
    category: "pantry",
    price: 7.5,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/GrizzyGoodApplesauce.jpeg",
    desc: "No added nonsense, just good applesauce — the name is the whole pitch.",
    ingredients: "Apples, brown sugar, vinegar.",
    comingSoon: false
  },
  {
    slug: "dinner-carrots",
    name: "Homestyle Dinner Carrots",
    maker: "",
    category: "pantry",
    price: 9.5,
    size: "24 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/DinnerCarrots.jpeg",
    desc: "Simple canned carrots, ready for the table with nothing else required.",
    ingredients: "Carrots, salt, lemon juice.",
    comingSoon: false
  },
  {
    slug: "pinto-beans",
    name: "Pinto Beans",
    maker: "",
    category: "pantry",
    price: 6.5,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/PintoBeans.jpeg",
    desc: "Home-canned pinto beans, ready to heat and eat whenever the pantry's doing the cooking.",
    ingredients: "Pinto beans, onion, salt, pepper.",
    comingSoon: false
  },
  {
    slug: "navy-beans",
    name: "Navy Beans",
    maker: "",
    category: "pantry",
    price: 6.5,
    size: "16 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/NavyBeans.png",
    desc: "Home-canned navy beans — soft, simple, and ready whenever soup weather hits.",
    ingredients: "Navy beans, salt, pepper, onion.",
    comingSoon: false
  },
  {
    slug: "dried-onions",
    name: "Dried Onions",
    maker: "",
    category: "pantry",
    price: 5.5,
    size: "4 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/DriedOnions.jpeg",
    desc: "Dehydrated and ready for soups, stews, or anything that needs a little more onion in it.",
    ingredients: "Onions.",
    comingSoon: false
  },
  {
    slug: "breadcrumbs",
    name: "Homemade Breadcrumbs",
    maker: "",
    category: "pantry",
    price: 5.5,
    size: "8 oz jar",
    badges: ["Pantry Favorite"],
    image: "images/BreadCrumbs.jpeg",
    desc: "Homemade, seasoned, and better than the canister kind by a mile.",
    ingredients: "Flour, yeast, salt, milk.",
    comingSoon: false
  },
  {
    slug: "italian-dressing",
    name: "Papa Bear's Favorite Italian Dressing",
    maker: "papa",
    category: "pantry",
    price: 8.5,
    size: "16 fl oz bottle",
    badges: ["Pantry Favorite"],
    image: "images/ItalianDressing.jpeg",
    desc: "Made from scratch, no mystery ingredients — just the good stuff in a bottle.",
    comingSoon: false
  },

  /* ---------- Seasonal Specialties (still coming soon) ---------- */
  {
    slug: "candied-pecans",
    name: "Mama & Papa Bear's Candied Pecans",
    maker: "",
    category: "seasonal",
    price: 11.99,
    size: "12 oz jar",
    badges: ["Seasonal"],
    image: "images/CandiedPecans.jpeg",
    desc: "Sweet, crunchy, and dangerous to leave unattended on the counter.",
    ingredients: "Pecans, brown sugar, vanilla, cinnamon.",
    comingSoon: true
  },
  {
    slug: "candied-walnuts",
    name: "Mama Bear's Candied Walnuts",
    maker: "mama",
    category: "seasonal",
    price: 11.49,
    size: "12 oz jar",
    badges: ["Seasonal"],
    image: "images/CandiedWalnuts.jpeg",
    desc: "Toasty, sweet, and just as good on a salad as they are straight out of the jar.",
    ingredients: "Walnuts, sugar, butter, cinnamon, vanilla.",
    comingSoon: true
  },
  {
    slug: "candied-almonds",
    name: "Candied Almonds",
    maker: "",
    category: "seasonal",
    price: 11.49,
    size: "12 oz jar",
    badges: ["Seasonal"],
    image: "images/CandiedAlmonds.jpeg",
    desc: "Crisp, sweet, and lightly spiced — the snack that never makes it home from the car.",
    ingredients: "Almonds, brown sugar, cinnamon, vanilla.",
    comingSoon: true
  },
  {
    slug: "spicy-mixed-nuts",
    name: "Spicy Mixed Nuts",
    maker: "",
    category: "seasonal",
    price: 9.5,
    size: "8 oz bag",
    badges: ["Seasonal"],
    image: "images/MixedNuts.png",
    desc: "Pecans, walnuts, and almonds, candied with real heat — Mama Bear's answer to \"got anything spicy?\"",
    comingSoon: true
  },
  {
    slug: "chocolate-fudge",
    name: "Chocolate Fudge",
    maker: "",
    category: "seasonal",
    price: 9,
    size: "1/2 lb box",
    badges: ["Seasonal"],
    image: "images/ChocolateFudge.png",
    desc: "Rich, dense, made in small batches — and yes, it can be made to order if you ask ahead.",
    ingredients: "Semi-sweet chocolate, sugar, butter.",
    comingSoon: true
  },
  {
    slug: "peanut-butter-fudge",
    name: "Peanut Butter Fudge",
    maker: "",
    category: "seasonal",
    price: 9,
    size: "1/2 lb box",
    badges: ["Seasonal"],
    image: "images/PeanutButterFudge.png",
    desc: "Smooth, rich, and just as make-to-order-able as its chocolate cousin.",
    ingredients: "Peanut butter, sugar, butter.",
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

/* Nothing left with no photo — every real item now has a card. */
const PANTRY_LIST = [];
