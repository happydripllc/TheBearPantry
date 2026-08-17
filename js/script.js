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
  function addToCart(slug, qty) {
    qty = qty || 1;
    var product = findProduct(slug);
    if (!product || product.comingSoon) return;
    var cart = getCart();
    var line = cart.filter(function (i) { return i.slug === slug; })[0];
    if (line) {
      line.qty += qty;
    } else {
      cart.push({
        slug: product.slug, name: product.name, price: product.price,
        size: product.size, image: product.image, maker: product.maker, qty: qty
      });
    }
    saveCart(cart);
    showToast(product.name + " added to your pantry cart.");
    renderCartPage();
  }
  function removeFromCart(slug) {
    saveCart(getCart().filter(function (i) { return i.slug !== slug; }));
    renderCartPage();
  }
  function setQty(slug, qty) {
    var cart = getCart();
    var line = cart.filter(function (i) { return i.slug === slug; })[0];
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
    var link = p.comingSoon ? "javascript:void(0)" : base + p.detail;
    var badges = p.badges.map(function (b) { return '<span class="badge ' + badgeClass(b) + '">' + b + "</span>"; }).join("");
    var soonBadge = p.comingSoon ? '<span class="badge badge-soon">Coming Soon</span>' : "";
    var priceHTML = p.comingSoon
      ? '<span class="product-price">Coming soon</span>'
      : '<span class="product-price">$' + p.price.toFixed(2) + ' <span class="size">' + p.size + "</span></span>";
    var cartBtn = p.comingSoon
      ? '<button class="add-cart-btn" title="Mama Bear needs to make another batch" disabled>' + bellIcon() + "</button>"
      : '<button class="add-cart-btn" title="Add to cart" onclick="event.preventDefault();BearPantry.addToCart(\'' + p.slug + "', 1)\">" + cartIcon() + "</button>";
    return (
      '<article class="product-card' + (p.comingSoon ? " soon" : "") + '">' +
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
    var badges = product.badges.map(function (b) { return '<span class="badge ' + badgeClass(b) + '">' + b + "</span>"; }).join("");
    body.innerHTML =
      '<span class="pdp-maker">' + (product.maker === "mama" ? "Mama Bear's" : product.maker === "papa" ? "Papa Bear's" : "The Bear Pantry") + "</span>" +
      "<h2 class=\"pdp-title\" style=\"font-size:1.7rem\">" + product.name + "</h2>" +
      '<div class="pdp-price">$' + product.price.toFixed(2) + ' <span class="size">' + product.size + "</span></div>" +
      '<p class="pdp-desc">' + product.desc + "</p>" +
      '<div class="pdp-badges">' + badges + "</div>" +
      '<div class="hero-ctas">' +
      '<button class="btn btn-primary" onclick="BearPantry.addToCart(\'' + product.slug + "', 1); BearPantry.closeQuickView();\">Add to Cart</button>" +
      '<a class="btn btn-secondary" href="' + product.detail + '">Full Details</a>' +
      "</div>";
    document.getElementById("quickViewImg").src = product.image;
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
        '<button onclick="BearPantry.setQty(\'' + item.slug + "', " + (item.qty - 1) + ')">−</button>' +
        "<span>" + item.qty + "</span>" +
        '<button onclick="BearPantry.setQty(\'' + item.slug + "', " + (item.qty + 1) + ')">+</button>' +
        "</div>" +
        '<div class="product-price">$' + (item.price * item.qty).toFixed(2) + "</div>" +
        '<button class="cart-remove" onclick="BearPantry.removeFromCart(\'' + item.slug + "')\">Remove</button>" +
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

    render();
  }

  /* ---------- Featured products (homepage) ---------- */
  function initFeatured() {
    var el = document.getElementById("featuredGrid");
    if (!el) return;
    var slugs = ["papa-bears-smokey-jalapeno-salsa", "mama-bears-bread-and-butter-pickles", "papa-bears-classic-green-beans", "mama-bears-blackberry-jam"];
    el.innerHTML = slugs.map(function (s) { return productCardHTML(findProduct(s)); }).join("");
  }

  /* ---------- Product detail page: qty stepper + add to cart ---------- */
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
      addToCart(addBtn.getAttribute("data-slug"), parseInt(qtyEl.textContent, 10));
    });
  }

  /* ---------- Related products (product detail pages) ---------- */
  function initRelated() {
    var el = document.getElementById("relatedGrid");
    if (!el) return;
    var exclude = el.getAttribute("data-exclude");
    var list = PRODUCTS.filter(function (p) { return p.slug !== exclude; }).slice(0, 4);
    el.innerHTML = list.map(function (p) { return productCardHTML(p, "../"); }).join("");
  }

  /* ---------- Pantry list (flavors without dedicated photography yet) ---------- */
  function initPantryList() {
    var el = document.getElementById("pantryList");
    if (!el || typeof PANTRY_LIST === "undefined") return;
    el.innerHTML = PANTRY_LIST.map(function (group) {
      return (
        '<div class="pantry-list-col">' +
        "<h4>" + group.group + "</h4>" +
        "<ul>" + group.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- Forms (progressive — no backend yet) ---------- */
  function initForms() {
    document.querySelectorAll("form[data-brand-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var successMsg = form.getAttribute("data-success") || "Thanks — we got it!";
        var wrap = document.createElement("div");
        wrap.className = "form-note";
        wrap.style.marginTop = "18px";
        wrap.innerHTML = "<strong>" + successMsg + "</strong>";
        form.appendChild(wrap);
        if (form.id === "checkoutForm") { clearCart(); }
        form.querySelectorAll("input, textarea, select, button[type=submit]").forEach(function (f) { f.disabled = true; });
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
    initPDP();
    initRelated();
    initForms();
    updateCartBadge();
    renderCartPage();
    renderCheckoutSummary();

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
