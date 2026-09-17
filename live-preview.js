/**
 * live-preview.js
 * Part 1 — Private Editor Foundation
 *
 * Editor کے اندر ایک زندہ (live) preview panel بناتا ہے جو current client data
 * کی بنیاد پر homepage کی جھلک دکھاتا ہے۔ اصل مکمل Storefront Part 2 میں بنے گی،
 * لیکن یہ preview وہی رنگ/لوگو/بینر/پروڈکٹس استعمال کرتا ہے تاکہ Editor میں
 * کیے گئے تبدیلیوں کا فوری اندازہ ہو۔
 */

const LivePreview = {

  render(clientData) {
    const frame = document.getElementById("previewFrame");
    if (!frame) return;

    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(this.buildPreviewHTML(clientData));
    doc.close();
  },

  buildPreviewHTML(data) {
    const store = data.store;
    const contact = data.contact;
    const products = data.products.slice(0, 8);

    const bannerHtml = store.bannerImages.length
      ? `<div class="p-banner" style="background-image:url('${this.escape(store.bannerImages[0].url)}')">
           <div class="p-banner-text">${this.escape(store.tagline || store.storeName)}</div>
         </div>`
      : `<div class="p-banner p-banner-empty"><div class="p-banner-text">${this.escape(store.tagline || "بینر امیج شامل کریں")}</div></div>`;

    const productsHtml = products.length
      ? products.map(p => this.productCardHTML(p)).join("")
      : `<p class="p-empty">ابھی کوئی پروڈکٹ شامل نہیں کیا گیا۔</p>`;

    return `
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          :root {
            --primary: ${store.primaryColor || "#1a1a1a"};
            --secondary: ${store.secondaryColor || "#d4a373"};
          }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin:0; background:#fafafa; color:#222; }
          .p-header { display:flex; align-items:center; justify-content:space-between; padding:14px 24px; background:#fff; border-bottom:1px solid #eee; }
          .p-logo { display:flex; align-items:center; gap:10px; font-weight:700; font-size:20px; color: var(--primary); }
          .p-logo img { height:36px; width:36px; object-fit:contain; border-radius:6px; }
          .p-nav { display:flex; gap:18px; font-size:14px; color:#555; }
          .p-banner { height:220px; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; background-color: var(--primary); }
          .p-banner-empty { border:2px dashed #ccc; background-color:#f0f0f0; }
          .p-banner-text { color:#fff; background:rgba(0,0,0,0.35); padding:10px 22px; border-radius:6px; font-size:22px; font-weight:600; }
          .p-section-title { text-align:center; margin:28px 0 16px; font-size:20px; color: var(--primary); }
          .p-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:16px; padding:0 24px 24px; }
          .p-card { background:#fff; border:1px solid #eee; border-radius:10px; overflow:hidden; }
          .p-card img { width:100%; height:120px; object-fit:cover; background:#eee; }
          .p-card-body { padding:10px; }
          .p-card-name { font-size:13px; font-weight:600; margin:0 0 4px; }
          .p-price { color: var(--secondary); font-weight:700; font-size:13px; }
          .p-old-price { text-decoration:line-through; color:#999; font-size:11px; margin-inline-start:6px; }
          .p-empty { text-align:center; color:#999; padding:20px; }
          .p-footer { background: var(--primary); color:#fff; text-align:center; padding:20px; font-size:13px; margin-top:20px; }
          .p-footer a { color:#fff; margin:0 6px; }
        </style>
      </head>
      <body>
        <div class="p-header">
          <div class="p-logo">
            ${store.logoUrl ? `<img src="${this.escape(store.logoUrl)}">` : ""}
            <span>${this.escape(store.storeName || "Your Store Name")}</span>
          </div>
          <div class="p-nav"><span>ہوم</span><span>شاپ</span><span>رابطہ</span></div>
        </div>

        ${bannerHtml}

        <h3 class="p-section-title">نمایاں پروڈکٹس</h3>
        <div class="p-grid">${productsHtml}</div>

        <div class="p-footer">
          <div>${this.escape(store.storeName || "")}</div>
          <div>${this.escape(contact.address || "")} ${contact.phoneNumber ? " | " + this.escape(contact.phoneNumber) : ""}</div>
          <div>
            ${contact.facebookUrl ? `<a href="#">Facebook</a>` : ""}
            ${contact.instagramUrl ? `<a href="#">Instagram</a>` : ""}
          </div>
        </div>
      </body>
      </html>
    `;
  },

  productCardHTML(p) {
    const img = p.images && p.images[0] ? p.images[0] : "";
    const discount = p.oldPrice && Number(p.oldPrice) > Number(p.price);
    return `
      <div class="p-card">
        <img src="${this.escape(img)}" onerror="this.style.opacity=0.2">
        <div class="p-card-body">
          <p class="p-card-name">${this.escape(p.name || "بلا عنوان پروڈکٹ")}</p>
          <span class="p-price">Rs. ${p.price || 0}</span>
          ${discount ? `<span class="p-old-price">Rs. ${p.oldPrice}</span>` : ""}
        </div>
      </div>
    `;
  },

  escape(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
};

window.LivePreview = LivePreview;
