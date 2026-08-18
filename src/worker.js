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

    return env.ASSETS.fetch(request);
  }
};

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

  let resendRes;
  try {
    resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "The Bear Pantry <orders@thebearpantry.com>",
        to: ["orders@thebearpantry.com"],
        reply_to: customer.email,
        subject: "New order request from " + customer.name,
        html: html,
        text: text
      })
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: "Couldn't reach the email service. Please try again." }, 502);
  }

  if (!resendRes.ok) {
    const detail = await resendRes.text();
    return jsonResponse({ ok: false, error: "The email service rejected the order.", detail: detail }, 502);
  }

  return jsonResponse({ ok: true });
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
