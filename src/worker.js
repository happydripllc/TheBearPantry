/* The Bear Pantry — Worker entry point.
   This site deploys as a Cloudflare Worker with static assets (not classic
   Pages), so there's no /functions auto-routing — this file is the single
   place that intercepts API routes before falling through to the static
   site. Everything that isn't handled below is served as-is from ASSETS. */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/order" && request.method === "POST") {
      return handleOrder(request, env);
    }

    if (url.pathname === "/api/order" && request.method === "GET") {
      return jsonResponse({ ok: true, resendKeyConfigured: !!env.RESEND_API_KEY });
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    if (url.pathname === "/api/inventory" && request.method === "GET") {
      return handleGetInventory(env);
    }

    if (url.pathname === "/api/inventory" && request.method === "POST") {
      return handleUpdateInventory(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "That message didn't come through right — invalid data." }, 400);
  }

  const name = ((data && data.name) || "").trim();
  const email = ((data && data.email) || "").trim();
  const reason = ((data && data.reason) || "General Question").trim();
  const message = ((data && data.message) || "").trim();

  if (!name || !email || !message) {
    return jsonResponse({ ok: false, error: "Name, email, and a message are all required." }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return jsonResponse({ ok: false, error: "Contact form isn't configured yet — missing RESEND_API_KEY." }, 500);
  }

  const html =
    '<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2a2420;">' +
    '<h2 style="color:#26402b;">New Contact Form Message</h2>' +
    "<p><strong>" + escapeHtml(name) + "</strong><br>" + escapeHtml(email) + "</p>" +
    "<p><strong>Subject:</strong> " + escapeHtml(reason) + "</p>" +
    '<p style="white-space:pre-wrap;">' + escapeHtml(message) + "</p>" +
    '<p style="color:#6b5c45;font-size:13px;margin-top:20px;">Submitted from the thebearpantry.com contact form.</p>' +
    "</div>";

  const text =
    "New Contact Form Message\n\n" +
    name + "\n" + email + "\n\n" +
    "Subject: " + reason + "\n\n" +
    message;

  const result = await sendResendEmail(env, {
    from: "The Bear Pantry <orders@thebearpantry.com>",
    to: ["hello@thebearpantry.com"],
    reply_to: email,
    subject: "Contact form: " + reason + " — from " + name,
    html: html,
    text: text
  });

  if (!result.ok) {
    if (result.networkError) {
      return jsonResponse({ ok: false, error: "Couldn't reach the email service. Please try again." }, 502);
    }
    return jsonResponse({ ok: false, error: "The email service rejected the message.", detail: result.detail }, 502);
  }

  return jsonResponse({ ok: true });
}

async function handleOrder(request, env) {
  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "That order didn't come through right — invalid data." }, 400);
  }

  const customer = (data && data.customer) || {};
  const fulfillment = (data && data.fulfillment) || "pickup";
  const notes = (data && data.notes) || "";
  const items = (data && data.items) || [];
  const deliveryAddress = (data && data.deliveryAddress) || null;

  if (!customer.name || !customer.email || !customer.phone) {
    return jsonResponse({ ok: false, error: "Name, email, and phone are all required." }, 400);
  }
  if (!Array.isArray(items) || items.length === 0) {
    return jsonResponse({ ok: false, error: "Your pantry cart is empty." }, 400);
  }
  if (fulfillment === "delivery" && (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zip)) {
    return jsonResponse({ ok: false, error: "A full delivery address (street, city, ZIP) is required for local delivery." }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return jsonResponse({ ok: false, error: "Order email isn't configured yet — missing RESEND_API_KEY." }, 500);
  }

  // Re-check stock against KV at checkout — never trust the page-load fetch
  // alone, since stock can change between when the shopper loaded the page
  // and when they check out. Untracked products (no entry in the stock map)
  // are always allowed. KV has no transactions, so there's a small race
  // window if two orders for the same low-stock item land at the exact same
  // moment — acceptable at this business's order volume.
  const stock = await getStock(env);
  const shortfalls = [];
  for (const item of items) {
    const available = stock[item.slug];
    if (available == null) continue;
    const qty = Number(item.qty) || 0;
    if (qty > available) {
      shortfalls.push({ name: item.name, requested: qty, available: available });
    }
  }
  if (shortfalls.length > 0) {
    const detail = shortfalls.map(function (s) {
      return s.name + " (" + s.available + " left, " + s.requested + " requested)";
    }).join("; ");
    return jsonResponse({
      ok: false,
      error: "Some items in your cart sold out before checkout: " + detail + ". Please update your cart and try again.",
      shortfalls: shortfalls
    }, 409);
  }
  for (const item of items) {
    if (stock[item.slug] == null) continue;
    stock[item.slug] -= (Number(item.qty) || 0);
  }
  if (env.INVENTORY_KV) {
    await env.INVENTORY_KV.put(STOCK_KEY, JSON.stringify(stock));
  }

  const addressLine = deliveryAddress ? (deliveryAddress.street + ", " + deliveryAddress.city + " " + deliveryAddress.zip) : "";
  const mapsUrl = deliveryAddress ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addressLine) : "";

  const subtotal = items.reduce(function (sum, i) {
    return sum + (Number(i.price) || 0) * (Number(i.qty) || 0);
  }, 0);

  const itemRowsHtml = items.map(function (i) {
    return (
      "<tr>" +
      '<td style="padding:6px 10px;border-bottom:1px solid #e6ddc4;">' +
      escapeHtml(i.qty) + "&times; " + escapeHtml(i.name) + (i.size ? " (" + escapeHtml(i.size) + ")" : "") +
      "</td>" +
      '<td style="padding:6px 10px;border-bottom:1px solid #e6ddc4;text-align:right;">$' +
      ((Number(i.price) || 0) * (Number(i.qty) || 0)).toFixed(2) +
      "</td></tr>"
    );
  }).join("");

  const html =
    '<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2a2420;">' +
    '<h2 style="color:#26402b;">New Pantry Order Request</h2>' +
    "<p><strong>" + escapeHtml(customer.name) + "</strong><br>" +
    escapeHtml(customer.email) + "<br>" + escapeHtml(customer.phone) + "</p>" +
    "<p><strong>Fulfillment:</strong> " + escapeHtml(fulfillment) + "</p>" +
    (deliveryAddress
      ? "<p><strong>Delivery Address:</strong> " + escapeHtml(addressLine) +
        ' &mdash; <a href="' + mapsUrl + '">Open in Google Maps</a></p>'
      : "") +
    (notes ? "<p><strong>Notes:</strong> " + escapeHtml(notes) + "</p>" : "") +
    '<table style="width:100%;border-collapse:collapse;margin-top:16px;">' +
    itemRowsHtml +
    '<tr><td style="padding:10px;font-weight:bold;">Estimated Total</td>' +
    '<td style="padding:10px;font-weight:bold;text-align:right;">$' + subtotal.toFixed(2) + "</td></tr>" +
    "</table>" +
    '<p style="color:#6b5c45;font-size:13px;margin-top:20px;">Submitted from thebearpantry.com checkout. No payment was collected online — confirm and arrange payment directly with the customer.</p>' +
    "</div>";

  const text =
    "New Pantry Order Request\n\n" +
    customer.name + "\n" + customer.email + "\n" + customer.phone + "\n\n" +
    "Fulfillment: " + fulfillment + "\n" +
    (deliveryAddress ? "Delivery Address: " + addressLine + "\nMap: " + mapsUrl + "\n\n" : "") +
    (notes ? "Notes: " + notes + "\n\n" : "\n") +
    items.map(function (i) {
      return i.qty + " x " + i.name + (i.size ? " (" + i.size + ")" : "") + " — $" + ((Number(i.price) || 0) * (Number(i.qty) || 0)).toFixed(2);
    }).join("\n") +
    "\n\nEstimated Total: $" + subtotal.toFixed(2);

  const firstName = (customer.name || "").trim().split(/\s+/)[0] || customer.name;
  const fulfillmentPhrase = fulfillment === "delivery" ? "get your delivery lined up" : "get your pickup lined up";

  const customerHtml =
    '<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2a2420;">' +
    '<h2 style="color:#26402b;">Pull up a chair, ' + escapeHtml(firstName) + ' — you\'re on the list.</h2>' +
    "<p>Mama Bear just got your order and she's already deciding which jars to set aside for you. She'll reach out soon by phone or email to " +
    fulfillmentPhrase + " and arrange payment (cash, Venmo, or Cash App) — nothing was charged online.</p>" +
    "<p><strong>Here's what you ordered:</strong></p>" +
    '<table style="width:100%;border-collapse:collapse;margin-top:10px;">' +
    itemRowsHtml +
    '<tr><td style="padding:10px;font-weight:bold;">Estimated Total</td>' +
    '<td style="padding:10px;font-weight:bold;text-align:right;">$' + subtotal.toFixed(2) + "</td></tr>" +
    "</table>" +
    (deliveryAddress
      ? '<p style="margin-top:16px;">We\'ve got your delivery address as <strong>' + escapeHtml(addressLine) +
        "</strong>. If that's not right, just reply to this email and let us know.</p>"
      : "") +
    (notes ? "<p><strong>Your notes:</strong> " + escapeHtml(notes) + "</p>" : "") +
    '<p style="margin-top:20px;">Thanks for pulling up a chair.<br>&mdash; The Bear Pantry</p>' +
    "</div>";

  const customerText =
    "Pull up a chair, " + firstName + " — you're on the list.\n\n" +
    "Mama Bear just got your order and she's already deciding which jars to set aside for you. " +
    "She'll reach out soon by phone or email to " + fulfillmentPhrase + " and arrange payment " +
    "(cash, Venmo, or Cash App) — nothing was charged online.\n\n" +
    "Here's what you ordered:\n" +
    items.map(function (i) {
      return i.qty + " x " + i.name + (i.size ? " (" + i.size + ")" : "") + " — $" + ((Number(i.price) || 0) * (Number(i.qty) || 0)).toFixed(2);
    }).join("\n") +
    "\n\nEstimated Total: $" + subtotal.toFixed(2) +
    (deliveryAddress ? "\n\nDelivery address on file: " + addressLine + " (reply to this email if that's not right)" : "") +
    (notes ? "\n\nYour notes: " + notes : "") +
    "\n\nThanks for pulling up a chair.\n— The Bear Pantry";

  const [notifyResult, customerResult] = await Promise.all([
    sendResendEmail(env, {
      from: "The Bear Pantry <orders@thebearpantry.com>",
      to: ["orders@thebearpantry.com"],
      reply_to: customer.email,
      subject: "New order request from " + customer.name,
      html: html,
      text: text
    }),
    sendResendEmail(env, {
      from: "The Bear Pantry <orders@thebearpantry.com>",
      to: [customer.email],
      subject: "You're on the list, " + firstName + "! 🐻",
      html: customerHtml,
      text: customerText
    })
  ]);

  // Internal notification behavior is unchanged: its failure still fails the request.
  if (!notifyResult.ok) {
    if (notifyResult.networkError) {
      return jsonResponse({ ok: false, error: "Couldn't reach the email service. Please try again." }, 502);
    }
    return jsonResponse({ ok: false, error: "The email service rejected the order.", detail: notifyResult.detail }, 502);
  }

  // Customer confirmation is best-effort: the order is already in via the
  // notification above, so a failed confirmation email shouldn't block checkout.
  if (!customerResult.ok) {
    console.error("Customer confirmation email failed:", customerResult.detail || customerResult);
  }

  return jsonResponse({ ok: true });
}

/* ---------- Inventory (Cloudflare KV) ----------
   All stock counts live under one KV key as a single JSON object, e.g.
   { "papa-bears-smokey-jalapeno-salsa": 20 }. A product with no entry here
   is untracked and always shown as available — tracking is opt-in per
   product via the admin page, not automatic for the whole catalog. */
const STOCK_KEY = "stock";

async function getStock(env) {
  if (!env.INVENTORY_KV) return {};
  const stock = await env.INVENTORY_KV.get(STOCK_KEY, "json");
  return stock || {};
}

async function handleGetInventory(env) {
  const stock = await getStock(env);
  return jsonResponse({ ok: true, stock: stock });
}

async function handleUpdateInventory(request, env) {
  if (!env.INVENTORY_KV) {
    return jsonResponse({ ok: false, error: "Inventory isn't set up yet — missing the INVENTORY_KV binding." }, 500);
  }
  if (!env.ADMIN_KEY) {
    return jsonResponse({ ok: false, error: "Inventory admin isn't configured yet — missing ADMIN_KEY." }, 500);
  }
  const providedKey = request.headers.get("X-Admin-Key") || "";
  if (providedKey !== env.ADMIN_KEY) {
    return jsonResponse({ ok: false, error: "Not authorized." }, 401);
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid request body." }, 400);
  }

  const updates = (data && data.updates) || {};
  const stock = await getStock(env);

  for (const slug of Object.keys(updates)) {
    const value = updates[slug];
    if (value === null) {
      delete stock[slug];
      continue;
    }
    const count = Number(value);
    if (!Number.isInteger(count) || count < 0) {
      return jsonResponse({ ok: false, error: 'Stock count for "' + slug + '" must be a whole number 0 or greater.' }, 400);
    }
    stock[slug] = count;
  }

  await env.INVENTORY_KV.put(STOCK_KEY, JSON.stringify(stock));
  return jsonResponse({ ok: true, stock: stock });
}

async function sendResendEmail(env, payload) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, networkError: false, detail: detail };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, networkError: true, detail: String(err) };
  }
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
