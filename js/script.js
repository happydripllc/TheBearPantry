/* THE BEAR PANTRY — site behavior
   Mobile nav, cart (localStorage), quick view modal, FAQ accordion,
   shop filter/sort/search, email + contact + checkout form handling. */

(function () {
  "use strict";

  var CART_KEY = "bearPantryCart";

  /* ---------- Cart storage ---------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }
  function cartCount(cart) {
    cart = cart || getCart();
    return cart.reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function cartTotal(cart) {
    cart = cart || getCart();
    return cart.reduce(function (n, i) { return n + i.qty * i.price; }, 0);
  }
  function findProduct(slug) {
    return (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).filter(function (p) { return p.slug === slug; })[0];
  }

  /* ---------- Inventory (live stock from /api/inventory) ----------
     A product with no entry in the fetched stock map is untracked and
     always treated as available — inventory tracking is opt-in per
     product (set in the admin page), not automatic for the whole catalog. */
  var STOCK = {};
  var stockListeners = [];
  function onStockLoaded(fn) { stockListeners.push(fn); }
  function stockFor(key) { return STOCK[key]; }
  function isSoldOut(p) {
    if (p.comingSoon) return false;
    if (p.sizes) return p.sizes.every(function (s) { return stockFor(s.stockKey) === 0; });
    return stockFor(p.slug) === 0;
  }
  function fetchInventory() {
    return fetch("/api/inventory")
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data && data.ok && data.stock) STOCK = data.stock; })
      .catch(function () { /* offline/misconfigured — everything just stays available */ })
      .then(function () { stockListeners.forEach(function (fn) { fn(); }); });
  }

  function addToCart(slug, qty, sizeIndex) {
    qty = qty || 1;
    var product = findProduct(slug);
    if (!product || product.comingSoon) return;
    var variant = (product.sizes && product.sizes[sizeIndex || 0]) || null;
    var stockKey = variant ? variant.stockKey : product.slug;
    var price = variant ? variant.price : product.price;
    var size = variant ? variant.size : product.size;
    if (stockFor(stockKey) === 0) {
      if (product.sizes) showToast(product.name + " — that size is sold out. Pick a different size on the product page.");
      return;
    }
    var cart = getCart();
    var line = cart.filter(function (i) { return i.slug === slug && (i.stockKey || i.slug) === stockKey; })[0];
    if (line) {
      line.qty += qty;
    } else {
      cart.push({
        slug: product.slug, stockKey: stockKey, name: product.name, price: price,
        size: size, image: product.image, maker: product.maker, qty: qty
      });
    }
    saveCart(cart);
    showToast(product.name + (variant ? " (" + size + ")" : "") + " added to your pantry cart.");
    renderCartPage();
  }
  function removeFromCart(slug, stockKey) {
    saveCart(getCart().filter(function (i) { return !(i.slug === slug && (i.stockKey || i.slug) === (stockKey || slug)); }));
    renderCartPage();
  }
  function setQty(slug, qty, stockKey) {
    var cart = getCart();
    var line = cart.filter(function (i) { return i.slug === slug && (i.stockKey || i.slug) === (stockKey || slug); })[0];
    if (!line) return;
    line.qty = Math.max(1, qty);
    saveCart(cart);
    renderCartPage();
  }
  function clearCart() { saveCart([]); renderCartPage(); }

  function updateCartBadge() {
    var count = cartCount();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var btn = document.getElementById("hamburgerBtn");
    var nav = document.getElementById("mobileNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        item.closest(".faq-list").querySelectorAll(".faq-item").forEach(function (i) { i.classList.remove("open"); });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  /* ---------- Product card markup ---------- */
  function badgeClass(b) {
    var m = { "Small Batch": "badge-batch", "Mama Bear's Pick": "badge-mama", "Papa Bear's Pick": "badge-papa", "Seasonal": "badge-seasonal", "Pantry Favorite": "badge-batch", "Gift Set": "badge-seasonal" };
    return m[b] || "badge-outline";
  }
  function productCardHTML(p, base) {
    base = base || "";
    var soldOut = isSoldOut(p);
    var detail = p.detail || ("shop/product.html?slug=" + p.slug);
    var link = p.comingSoon ? "javascript:void(0)" : base + detail;
    var badges = p.badges.map(function (b) { return '<span class="badge ' + badgeClass(b) + '">' + b + "</span>"; }).join("");
    var soonBadge = p.comingSoon
      ? '<span class="badge badge-soon">Coming Soon</span>'
      : soldOut ? '<span class="badge badge-soldout">Sold Out</span>' : "";
    var priceHTML = (p.price != null)
      ? '<span class="product-price">$' + p.price.toFixed(2) + ' <span class="size">' + p.size + "</span></span>"
      : '<span class="product-price">Coming soon</span>';
    var cartBtn = p.comingSoon
      ? '<button class="add-cart-btn" title="Mama Bear needs to make another batch" disabled>' + bellIcon() + "</button>"
      : soldOut
      ? '<button class="add-cart-btn" title="Sold out — check back soon" disabled>' + bellIcon() + "</button>"
      : '<button class="add-cart-btn" title="Add to cart" onclick="event.preventDefault();BearPantry.addToCart(\'' + p.slug + "', 1)\">" + cartIcon() + "</button>";
    return (
      '<article class="product-card' + (p.comingSoon ? " soon" : "") + (soldOut ? " sold-out" : "") + '">' +
      '<a href="' + link + '" class="product-media" ' + (p.comingSoon ? 'onclick="return false;"' : "") + '>' +
      '<img src="' + base + p.image + '" alt="' + p.name + '" loading="lazy" />' +
      '<div class="product-badges">' + badges + soonBadge + "</div>" +
      (p.comingSoon ? "" : '<button class="quick-view-btn" onclick="event.preventDefault();BearPantry.openQuickView(\'' + p.slug + "')\">Quick View</button>") +
      "</a>" +
      '<div class="product-body">' +
      '<span class="maker">' + (p.maker === "mama" ? "Mama Bear's" : p.maker === "papa" ? "Papa Bear's" : "The Bear Pantry") + "</span>" +
      '<h3><a href="' + link + '">' + p.name.replace(/^(Mama|Papa) Bear's /, "") + "</a></h3>" +
      '<p class="desc">' + p.desc + "</p>" +
      '<div class="product-foot">' + priceHTML + cartBtn + "</div>" +
      "</div></article>"
    );
  }
  function cartIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  }
  function bellIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>';
  }

  /* ---------- Quick view modal ---------- */
  function openQuickView(slug) {
    var product = findProduct(slug);
    if (!product) return;
    var overlay = document.getElementById("quickViewOverlay");
    var body = document.getElementById("quickViewBody");
    if (!overlay || !body) return;
    var base = document.body.getAttribute("data-depth") === "1" ? "../" : "";
    var detail = product.detail || ("shop/product.html?slug=" + product.slug);
    var badges = product.badges.map(function (b) { return '<span class="badge ' + badgeClass(b) + '">' + b + "</span>"; }).join("");
    var soldOut = isSoldOut(product);
    var addBtnHTML = product.sizes
      ? '<a class="btn btn-primary" href="' + base + detail + '">Choose Size &amp; Add to Cart</a>'
      : soldOut
      ? '<button class="btn btn-primary" disabled>Sold Out — Check Back Soon</button>'
      : '<button class="btn btn-primary" onclick="BearPantry.addToCart(\'' + product.slug + "', 1); BearPantry.closeQuickView();\">Add to Cart</button>";
    var priceLabel = product.sizes ? "From $" + Math.min.apply(null, product.sizes.map(function (s) { return s.price; })).toFixed(2) : "$" + product.price.toFixed(2);
    body.innerHTML =
      '<span class="pdp-maker">' + (product.maker === "mama" ? "Mama Bear's" : product.maker === "papa" ? "Papa Bear's" : "The Bear Pantry") + "</span>" +
      "<h2 class=\"pdp-title\" style=\"font-size:1.7rem\">" + product.name + "</h2>" +
      '<div class="pdp-price">' + priceLabel + ' <span class="size">' + product.size + "</span></div>" +
      '<p class="pdp-desc">' + product.desc + "</p>" +
      '<div class="pdp-badges">' + badges + (soldOut ? '<span class="badge badge-soldout">Sold Out</span>' : "") + "</div>" +
      '<div class="hero-ctas">' +
      addBtnHTML +
      '<a class="btn btn-secondary" href="' + base + detail + '">Full Details</a>' +
      "</div>";
    document.getElementById("quickViewImg").src = base + product.image;
    document.getElementById("quickViewImg").alt = product.name;
    overlay.classList.add("open");
  }
  function closeQuickView() {
    var overlay = document.getElementById("quickViewOverlay");
    if (overlay) overlay.classList.remove("open");
  }

  /* ---------- Cart page render ---------- */
  function renderCartPage() {
    var container = document.getElementById("cartItems");
    if (!container) return;
    var cart = getCart();
    var emptyState = document.getElementById("emptyCart");
    var filledState = document.getElementById("filledCart");
    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (filledState) filledState.style.display = "none";
      return;
    }
    if (emptyState) emptyState.style.display = "none";
    if (filledState) filledState.style.display = "grid";

    container.innerHTML = cart.map(function (item) {
      return (
        '<div class="cart-item">' +
        '<img src="' + item.image + '" alt="' + item.name + '" />' +
        '<div class="name-wrap"><span class="maker">' + (item.maker === "mama" ? "Mama Bear's" : item.maker === "papa" ? "Papa Bear's" : "The Bear Pantry") + '</span><div class="name">' + item.name + '</div><div style="font-size:0.82rem;color:var(--ink-soft)">' + item.size + "</div></div>" +
        '<div class="qty-stepper">' +
        '<button onclick="BearPantry.setQty(\'' + item.slug + "', " + (item.qty - 1) + ", '" + (item.stockKey || item.slug) + '\')">−</button>' +
        "<span>" + item.qty + "</span>" +
        '<button onclick="BearPantry.setQty(\'' + item.slug + "', " + (item.qty + 1) + ", '" + (item.stockKey || item.slug) + '\')">+</button>' +
        "</div>" +
        '<div class="product-price">$' + (item.price * item.qty).toFixed(2) + "</div>" +
        '<button class="cart-remove" onclick="BearPantry.removeFromCart(\'' + item.slug + "', '" + (item.stockKey || item.slug) + "')\">Remove</button>" +
        "</div>"
      );
    }).join("");

    var subtotal = cartTotal(cart);
    var subtotalEl = document.getElementById("cartSubtotal");
    var totalEl = document.getElementById("cartTotal");
    var countEl = document.getElementById("cartItemCount");
    if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = "$" + subtotal.toFixed(2);
    if (countEl) countEl.textContent = cartCount(cart);
  }

  /* ---------- Checkout order summary (reads cart, read-only) ---------- */
  function renderCheckoutSummary() {
    var container = document.getElementById("checkoutItems");
    if (!container) return;
    var cart = getCart();
    if (cart.length === 0) {
      container.innerHTML = '<p style="color:var(--ink-soft)">Your pantry cart is empty — <a href="shop.html" style="text-decoration:underline">head back to the shop</a> before checking out.</p>';
      return;
    }
    container.innerHTML = cart.map(function (item) {
      return '<div class="cart-summary-row"><span>' + item.qty + "× " + item.name + "</span><span>$" + (item.price * item.qty).toFixed(2) + "</span></div>";
    }).join("");
    var subtotal = cartTotal(cart);
    var totalEl = document.getElementById("checkoutTotal");
    if (totalEl) totalEl.textContent = "$" + subtotal.toFixed(2);
  }

  /* ---------- Shop grid: filter / sort / search ---------- */
  function initShop() {
    var grid = document.getElementById("shopGrid");
    if (!grid) return;
    var basePath = "";
    var state = { category: [], maker: [], search: "", sort: "featured" };

    function applyURLPreset() {
      var params = new URLSearchParams(window.location.search);
      var cat = params.get("category");
      if (cat) state.category = [cat];
    }
    applyURLPreset();

    function matches(p) {
      if (state.category.length && state.category.indexOf(p.category) === -1) return false;
      if (state.maker.length && state.maker.indexOf(p.maker) === -1) return false;
      if (state.search && p.name.toLowerCase().indexOf(state.search.toLowerCase()) === -1 && p.desc.toLowerCase().indexOf(state.search.toLowerCase()) === -1) return false;
      return true;
    }
    function sortList(list) {
      var l = list.slice();
      if (state.sort === "price-asc") l.sort(function (a, b) { return a.price - b.price; });
      else if (state.sort === "price-desc") l.sort(function (a, b) { return b.price - a.price; });
      else if (state.sort === "name") l.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else l.sort(function (a, b) { return (a.comingSoon === b.comingSoon) ? 0 : a.comingSoon ? 1 : -1; });
      return l;
    }
    function render() {
      var filtered = sortList(PRODUCTS.filter(matches));
      grid.innerHTML = filtered.length
        ? filtered.map(function (p) { return productCardHTML(p, basePath); }).join("")
        : '<div class="empty-state"><h3>Mama Bear hasn\'t made that yet.</h3><p>Try a different filter, or check back after her next canning day.</p></div>';
      var countEl = document.getElementById("resultCount");
      if (countEl) countEl.textContent = filtered.length + (filtered.length === 1 ? " jar found" : " jars found");
    }

    document.querySelectorAll("[data-filter-category]").forEach(function (cb) {
      if (state.category.indexOf(cb.value) !== -1) cb.checked = true;
      cb.addEventListener("change", function () {
        state.category = Array.from(document.querySelectorAll("[data-filter-category]:checked")).map(function (c) { return c.value; });
        render();
      });
    });
    document.querySelectorAll("[data-filter-maker]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        state.maker = Array.from(document.querySelectorAll("[data-filter-maker]:checked")).map(function (c) { return c.value; });
        render();
      });
    });
    var searchInput = document.getElementById("shopSearch");
    if (searchInput) searchInput.addEventListener("input", function () { state.search = this.value; render(); });
    var sortSelect = document.getElementById("shopSort");
    if (sortSelect) sortSelect.addEventListener("change", function () { state.sort = this.value; render(); });

    onStockLoaded(render);
    render();
  }

  /* ---------- Featured products (homepage) ---------- */
  function initFeatured() {
    var el = document.getElementById("featuredGrid");
    if (!el) return;
    var slugs = ["papa-bears-smokey-jalapeno-salsa", "mama-bears-bread-and-butter-pickles", "papa-bears-classic-green-beans", "mama-bears-blackberry-jam"];
    function render() {
      el.innerHTML = slugs.map(function (s) { return productCardHTML(findProduct(s)); }).join("");
    }
    onStockLoaded(render);
    render();
  }

  /* ---------- Generic product page (shop/product.html?slug=...) ---------- */
  function initGenericProductPage() {
    var page = document.getElementById("genericProductPage");
    if (!page) return;

    var slug = new URLSearchParams(window.location.search).get("slug");
    var product = slug ? findProduct(slug) : null;

    if (!product) {
      document.getElementById("pdpContent").style.display = "none";
      document.getElementById("pdpNotFound").style.display = "block";
      return;
    }

    document.title = product.name + " | The Bear Pantry";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", product.desc);

    document.getElementById("pdpCrumbName").textContent = product.name;
    document.getElementById("pdpImage").src = "../" + product.image;
    document.getElementById("pdpImage").alt = product.name + " jar, The Bear Pantry";
    document.getElementById("pdpMaker").textContent =
      product.maker === "mama" ? "Mama Bear's" : product.maker === "papa" ? "Papa Bear's" : "The Bear Pantry";
    document.getElementById("pdpTitleText").textContent = product.name;
    document.getElementById("pdpBadges").innerHTML =
      product.badges.map(function (b) { return '<span class="badge ' + badgeClass(b) + '">' + b + "</span>"; }).join("");
    document.getElementById("pdpPriceText").innerHTML =
      (product.price != null)
        ? "$" + product.price.toFixed(2) + ' <span class="size">' + product.size + "</span>"
        : "Coming soon";
    document.getElementById("pdpDescText").textContent = product.desc;

    var metaRows = "";
    if (product.ingredients) {
      metaRows += '<div class="pdp-meta-row"><span class="k">Ingredients</span><span class="v">' + product.ingredients + "</span></div>";
    }
    if (product.heat) {
      metaRows += '<div class="pdp-meta-row"><span class="k">Heat Level</span><span class="v">' + product.heat + "</span></div>";
    }
    metaRows += '<div class="pdp-meta-row"><span class="k">Availability</span><span class="v">Made in small batches — while supplies last</span></div>';
    document.getElementById("pdpMeta").innerHTML = metaRows;

    var addBtn = document.getElementById("pdpAddBtn");
    if (product.comingSoon) {
      addBtn.textContent = "Mama Bear needs to make another batch";
      addBtn.disabled = true;
    } else {
      addBtn.setAttribute("data-slug", product.slug);
    }

    var relatedGrid = document.getElementById("relatedGrid");
    if (relatedGrid) relatedGrid.setAttribute("data-exclude", product.slug);

    var galleryEl = document.querySelector(".pdp-gallery");
    if (galleryEl) galleryEl.setAttribute("data-slug", product.slug);
  }

  /* ---------- Product photo gallery (scrollable thumbs when >1 real photo) ---------- */
  function initPDPGallery() {
    document.querySelectorAll(".pdp-gallery[data-slug]").forEach(function (galleryEl) {
      var product = findProduct(galleryEl.getAttribute("data-slug"));
      var mainImg = galleryEl.querySelector("img");
      if (!product || !mainImg) return;
      var base = document.body.getAttribute("data-depth") === "1" ? "../" : "";
      var images = [product.image].concat(product.gallery || []);
      if (images.length < 2) return;

      var thumbs = document.createElement("div");
      thumbs.className = "pdp-gallery-thumbs";
      thumbs.innerHTML = images
        .map(function (src, i) {
          return (
            '<img src="' + base + src + '" alt="' + product.name + " photo " + (i + 1) + '" ' +
            'class="' + (i === 0 ? "active" : "") + '" data-src="' + base + src + '" />'
          );
        })
        .join("");
      galleryEl.appendChild(thumbs);

      thumbs.querySelectorAll("img").forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          mainImg.src = thumb.getAttribute("data-src");
          thumbs.querySelectorAll("img").forEach(function (t) { t.classList.remove("active"); });
          thumb.classList.add("active");
        });
      });
    });
  }

  /* ---------- Product image lightbox (click main image to view full size) ---------- */
  function ensureLightbox() {
    var lb = document.getElementById("pdpLightbox");
    if (lb) return lb;
    lb = document.createElement("div");
    lb.className = "pdp-lightbox";
    lb.id = "pdpLightbox";
    lb.innerHTML = '<button class="pdp-lightbox-close" aria-label="Close">&times;</button><img src="" alt="" />';
    document.body.appendChild(lb);
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("pdp-lightbox-close")) {
        lb.classList.remove("open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lb.classList.remove("open");
    });
    return lb;
  }
  function initImageLightbox() {
    var galleryEl = document.querySelector(".pdp-gallery");
    if (!galleryEl) return;
    galleryEl.addEventListener("click", function (e) {
      var img = e.target.closest("img");
      if (!img || img.closest(".pdp-gallery-thumbs")) return;
      var lb = ensureLightbox();
      var lbImg = lb.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add("open");
    });
  }

  /* ---------- Product detail page: qty stepper + add to cart ---------- */
  function applyPDPStockState() {
    // Works for both the generic template and the bespoke static PDP pages —
    // both end up with #pdpAddBtn[data-slug] set before this runs. Coming
    // Soon products never get a data-slug (see initGenericProductPage), so
    // this only ever touches purchasable products.
    var addBtn = document.getElementById("pdpAddBtn");
    if (!addBtn) return;
    var slug = addBtn.getAttribute("data-slug");
    if (!slug) return;
    var product = findProduct(slug);
    if (!product || product.comingSoon) return;
    var sizeIndex = parseInt(addBtn.getAttribute("data-size-index"), 10) || 0;
    var variant = product.sizes ? product.sizes[sizeIndex] : null;
    var stockKey = variant ? variant.stockKey : product.slug;
    var soldOut = stockFor(stockKey) === 0;
    addBtn.disabled = soldOut;
    addBtn.textContent = soldOut ? "Sold Out — Check Back Soon" : "Add to Cart";
  }
  function initPDPSizeSelector() {
    var addBtn = document.getElementById("pdpAddBtn");
    var priceEl = document.getElementById("pdpPriceText");
    if (!addBtn || !priceEl) return;
    var slug = addBtn.getAttribute("data-slug");
    var product = slug ? findProduct(slug) : null;
    if (!product || !product.sizes || document.querySelector(".pdp-size-selector")) return;

    var wrap = document.createElement("div");
    wrap.className = "pdp-size-selector";
    wrap.innerHTML = product.sizes.map(function (s, i) {
      return '<button type="button" class="pdp-size-option' + (i === 0 ? " active" : "") + '" data-index="' + i + '">' + s.size + "</button>";
    }).join("");
    priceEl.parentNode.insertBefore(wrap, priceEl.nextSibling);

    function selectSize(i) {
      addBtn.setAttribute("data-size-index", i);
      var variant = product.sizes[i];
      priceEl.innerHTML = "$" + variant.price.toFixed(2) + ' <span class="size">' + variant.size + "</span>";
      wrap.querySelectorAll(".pdp-size-option").forEach(function (btn, idx) {
        btn.classList.toggle("active", idx === i);
      });
      applyPDPStockState();
    }
    wrap.querySelectorAll(".pdp-size-option").forEach(function (btn) {
      btn.addEventListener("click", function () { selectSize(parseInt(btn.getAttribute("data-index"), 10)); });
    });
    selectSize(0);
  }
  function initPDP() {
    var stepper = document.getElementById("pdpQtyStepper");
    var qtyEl = document.getElementById("pdpQty");
    var addBtn = document.getElementById("pdpAddBtn");
    if (!stepper || !qtyEl || !addBtn) return;
    stepper.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = Math.max(1, parseInt(qtyEl.textContent, 10) + parseInt(btn.getAttribute("data-step"), 10));
        qtyEl.textContent = val;
      });
    });
    addBtn.addEventListener("click", function () {
      var sizeIndex = parseInt(addBtn.getAttribute("data-size-index"), 10) || 0;
      addToCart(addBtn.getAttribute("data-slug"), parseInt(qtyEl.textContent, 10), sizeIndex);
    });
    initPDPSizeSelector();
    applyPDPStockState();
    onStockLoaded(applyPDPStockState);
  }

  /* ---------- Related products (product detail pages) ---------- */
  function initRelated() {
    var el = document.getElementById("relatedGrid");
    if (!el) return;
    function render() {
      var exclude = el.getAttribute("data-exclude");
      var list = PRODUCTS.filter(function (p) { return p.slug !== exclude; }).slice(0, 4);
      el.innerHTML = list.map(function (p) { return productCardHTML(p, "../"); }).join("");
    }
    onStockLoaded(render);
    render();
  }

  /* ---------- Pantry list (flavors without dedicated photography yet) ---------- */
  function initPantryList() {
    var el = document.getElementById("pantryList");
    if (!el || typeof PANTRY_LIST === "undefined") return;
    if (!PANTRY_LIST.length) {
      var band = el.closest(".pantry-list-band");
      var section = band ? band.closest("section") : null;
      if (section) section.style.display = "none";
      return;
    }
    el.innerHTML = PANTRY_LIST.map(function (group) {
      return (
        '<div class="pantry-list-col">' +
        "<h4>" + group.group + "</h4>" +
        "<ul>" + group.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- Checkout: submits the cart to /api/order (see src/worker.js) ---------- */
  function initCheckoutForm() {
    var form = document.getElementById("checkoutForm");
    if (!form) return;

    var addressWrap = document.getElementById("deliveryAddressFields");
    var addrStreet = document.getElementById("addrStreet");
    var addrCity = document.getElementById("addrCity");
    var addrZip = document.getElementById("addrZip");

    function syncDeliveryAddressFields() {
      if (!addressWrap) return;
      var isDelivery = form.fulfillment.value === "delivery";
      addressWrap.style.display = isDelivery ? "grid" : "none";
      [addrStreet, addrCity, addrZip].forEach(function (f) {
        if (f) f.required = isDelivery;
      });
    }
    form.querySelectorAll('input[name="fulfillment"]').forEach(function (radio) {
      radio.addEventListener("change", syncDeliveryAddressFields);
    });
    syncDeliveryAddressFields();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cart = getCart();
      if (cart.length === 0) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      var payload = {
        customer: {
          name: form.fullName.value,
          phone: form.phone.value,
          email: form.email.value
        },
        fulfillment: form.fulfillment.value,
        notes: form.notes.value,
        items: cart
      };
      if (form.fulfillment.value === "delivery") {
        payload.deliveryAddress = {
          street: addrStreet ? addrStreet.value : "",
          city: addrCity ? addrCity.value : "",
          zip: addrZip ? addrZip.value : ""
        };
      }

      fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data.ok) {
            throw new Error((result.data && result.data.error) || "Something went wrong sending your order.");
          }
          var wrap = document.createElement("div");
          wrap.className = "form-note";
          wrap.style.marginTop = "18px";
          wrap.innerHTML = "<strong>Got it! Mama Bear (or someone on her behalf) will reach out shortly to confirm your order and arrange pickup.</strong>";
          form.appendChild(wrap);
          form.querySelectorAll("input, textarea, select, button[type=submit]").forEach(function (f) { f.disabled = true; });
          clearCart();
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          var wrap = document.createElement("div");
          wrap.className = "form-note";
          wrap.style.borderColor = "var(--rust)";
          wrap.style.marginTop = "18px";
          wrap.innerHTML = "<strong>" + err.message + " Please try again, or reach out through the Contact page.</strong>";
          form.appendChild(wrap);
        });
    });
  }

  /* ---------- Contact form: submits to /api/contact (see src/worker.js) ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      var payload = {
        name: form.name.value,
        email: form.email.value,
        reason: form.reason.value,
        message: form.message.value
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data.ok) {
            throw new Error((result.data && result.data.error) || "Something went wrong sending your message.");
          }
          var wrap = document.createElement("div");
          wrap.className = "form-note";
          wrap.style.marginTop = "18px";
          wrap.innerHTML = "<strong>Thanks for reaching out — we'll get back to you soon.</strong>";
          form.appendChild(wrap);
          form.querySelectorAll("input, textarea, select, button[type=submit]").forEach(function (f) { f.disabled = true; });
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          var wrap = document.createElement("div");
          wrap.className = "form-note";
          wrap.style.borderColor = "var(--rust)";
          wrap.style.marginTop = "18px";
          wrap.innerHTML = "<strong>" + err.message + " Please try again, or email us directly at hello@thebearpantry.com.</strong>";
          form.appendChild(wrap);
        });
    });
  }

  /* ---------- Forms (newsletter signup submits to Zoho; others still local-only) ---------- */
  function ensureZohoFrame() {
    if (document.querySelector('iframe[name="zohoNewsletterFrame"]')) return;
    var frame = document.createElement("iframe");
    frame.name = "zohoNewsletterFrame";
    frame.style.display = "none";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);
  }
  function initForms() {
    ensureZohoFrame();
    document.querySelectorAll("form[data-brand-form]:not(#checkoutForm):not(#contactForm)").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        // Newsletter forms have a real action/target (see HTML) and actually
        // submit to Zoho via the hidden iframe — don't block that submission.
        var isNewsletter = form.hasAttribute("data-newsletter-form");

        if (isNewsletter) {
          var emailInput = form.querySelector('input[type="email"]');
          var existingErr = form.querySelector(".form-error");
          if (existingErr) existingErr.remove();
          if (emailInput && !emailInput.value.trim()) {
            // Autofill can sometimes show a suggestion without actually
            // committing a value to the field — catch that here instead of
            // silently sending Zoho a blank entry with a fake success message.
            e.preventDefault();
            emailInput.focus();
            var err = document.createElement("div");
            err.className = "form-error";
            err.style.cssText = "margin-top:10px;color:var(--rust);font-size:0.86rem;";
            err.textContent = "That didn't come through — please type your email and try again.";
            form.appendChild(err);
            return;
          }
        }

        if (!isNewsletter) e.preventDefault();
        var successMsg = form.getAttribute("data-success") || "Thanks — we got it!";
        var wrap = document.createElement("div");
        wrap.className = "form-note";
        wrap.style.marginTop = "18px";
        wrap.innerHTML = "<strong>" + successMsg + "</strong>";
        form.appendChild(wrap);
        var disableFields = function () {
          form.querySelectorAll("input, textarea, select, button[type=submit]").forEach(function (f) { f.disabled = true; });
        };
        // Disabling the submit button synchronously while the submit event is
        // still being handled makes the browser abort its own form submission
        // — so for the newsletter forms (which need that real submission to
        // reach Zoho), defer disabling to the next tick instead.
        if (isNewsletter) {
          setTimeout(disableFields, 0);
        } else {
          disableFields();
        }
      });
    });

    document.querySelectorAll(".radio-card-group").forEach(function (group) {
      group.querySelectorAll(".radio-card").forEach(function (card) {
        var input = card.querySelector("input");
        function refresh() {
          group.querySelectorAll(".radio-card").forEach(function (c) { c.classList.remove("selected"); });
          if (input.checked) card.classList.add("selected");
        }
        input.addEventListener("change", function () {
          group.querySelectorAll(".radio-card").forEach(function (c) { c.classList.remove("selected"); });
          card.classList.add("selected");
        });
        if (input.checked) card.classList.add("selected");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initFaq();
    initShop();
    initFeatured();
    initPantryList();
    initGenericProductPage();
    initPDPGallery();
    initImageLightbox();
    initPDP();
    initRelated();
    initCheckoutForm();
    initContactForm();
    initForms();
    updateCartBadge();
    renderCartPage();
    renderCheckoutSummary();
    fetchInventory();

    var overlay = document.getElementById("quickViewOverlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closeQuickView(); });
    }
  });

  window.BearPantry = {
    addToCart: addToCart, removeFromCart: removeFromCart, setQty: setQty, clearCart: clearCart,
    openQuickView: openQuickView, closeQuickView: closeQuickView
  };
})();
