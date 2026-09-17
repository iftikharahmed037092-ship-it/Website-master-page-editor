const LivePreview = {

  render(clientData) {
    const frame = document.getElementById("previewFrame");
    if (!frame) return;

    try {
      const safeData = normalizeClientData(clientData);
      const doc =
        frame.contentDocument ||
        frame.contentWindow.document;

      doc.open();
      doc.write(this.buildPreviewHTML(safeData));
      doc.close();

    } catch (error) {
      console.error("Preview error:", error);
    }
  },

  buildPreviewHTML(data) {
    const store = data.store || {};
    const contact = data.contact || {};

    const products = Array.isArray(data.products)
      ? data.products.slice(0, 8)
      : [];

    const banners = Array.isArray(store.bannerImages)
      ? store.bannerImages
      : [];

    const bannerHtml = banners.length
      ? `
        <div class="p-banner"
             style="background-image:url('${this.attr(banners[0].url)}')">

          <div class="p-banner-overlay">

            <div class="p-banner-text">
              ${this.escape(
                banners[0].caption ||
                store.tagline ||
                store.storeName ||
                "Welcome"
              )}
            </div>

          </div>
        </div>
      `
      : `
        <div class="p-banner p-banner-empty">

          <div class="p-banner-text">
            ${this.escape(
              store.tagline ||
              "اپنے اسٹور کا Banner شامل کریں"
            )}
          </div>

        </div>
      `;

    const productsHtml = products.length
      ? products.map(p => this.productCardHTML(p)).join("")
      : `<p class="p-empty">ابھی کوئی پروڈکٹ شامل نہیں کیا گیا۔</p>`;

    return `
<!DOCTYPE html>
<html lang="ur" dir="rtl">

<head>

<meta charset="UTF-8">

<style>

:root {
  --primary: ${this.color(store.primaryColor, "#16a34a")};
  --secondary: ${this.color(store.secondaryColor, "#0ea5e9")};
}

* {
  box-sizing: border-box;
}

body {
  margin:0;
  background:#f7faf8;
  color:#202820;
  font-family:
    "Segoe UI",
    Tahoma,
    Arial,
    sans-serif;
}

.p-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  padding:13px 18px;
  background:#fff;
  border-bottom:1px solid #e5e7eb;
  position:sticky;
  top:0;
  z-index:5;
}

.p-logo {
  display:flex;
  align-items:center;
  gap:9px;
  color:var(--primary);
  font-weight:800;
  font-size:18px;
}

.p-logo img {
  width:36px;
  height:36px;
  object-fit:contain;
  border-radius:8px;
}

.p-nav {
  display:flex;
  gap:12px;
  color:#64748b;
  font-size:12px;
}

.p-banner {
  height:205px;
  background-size:cover;
  background-position:center;
  background-color:var(--primary);
  display:flex;
  align-items:center;
  justify-content:center;
}

.p-banner-empty {
  border:2px dashed #cbd5e1;
  background:#eef3f0;
}

.p-banner-overlay {
  padding:13px 20px;
  background:rgba(0,0,0,.38);
  border-radius:12px;
}

.p-banner-text {
  color:white;
  font-size:21px;
  font-weight:800;
  text-align:center;
}

.p-about {
  background:#fff;
  margin:15px;
  padding:16px;
  border-radius:13px;
  border:1px solid #e5e7eb;
}

.p-about h3 {
  margin:0 0 7px;
  color:var(--primary);
}

.p-about p {
  margin:0;
  color:#64748b;
  line-height:1.7;
  font-size:12px;
}

.p-section-title {
  text-align:center;
  color:var(--primary);
  margin:24px 0 14px;
  font-size:18px;
}

.p-grid {
  display:grid;
  grid-template-columns:
    repeat(auto-fill,minmax(135px,1fr));
  gap:12px;
  padding:0 15px 18px;
}

.p-card {
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:12px;
  overflow:hidden;
}

.p-card img {
  width:100%;
  height:120px;
  object-fit:cover;
  background:#edf1ef;
}

.p-card-body {
  padding:9px;
}

.p-card-name {
  margin:0 0 5px;
  font-size:12px;
  font-weight:700;
}

.p-price {
  color:var(--secondary);
  font-weight:900;
  font-size:13px;
}

.p-old-price {
  color:#94a3b8;
  text-decoration:line-through;
  font-size:10px;
  margin-right:5px;
}

.p-stock {
  margin-top:6px;
  font-size:9px;
  color:#64748b;
}

.p-empty {
  grid-column:1/-1;
  text-align:center;
  color:#94a3b8;
  padding:25px;
}

.p-footer {
  padding:20px 15px;
  background:var(--primary);
  color:white;
  text-align:center;
  font-size:11px;
  line-height:1.8;
}

.p-footer a {
  color:white;
  margin:0 5px;
  text-decoration:none;
}

.p-wa {
  display:inline-block;
  margin-top:8px;
  padding:7px 12px;
  border-radius:8px;
  background:#fff;
  color:var(--primary);
  text-decoration:none;
  font-weight:800;
}

</style>

</head>

<body>

<header class="p-header">

  <div class="p-logo">

    ${
      store.logoUrl
        ? `<img src="${this.attr(store.logoUrl)}" alt="">`
        : ""
    }

    <span>
      ${this.escape(
        store.storeName || "Your Store"
      )}
    </span>

  </div>

  <nav class="p-nav">
    <span>ہوم</span>
    <span>شاپ</span>
    <span>رابطہ</span>
  </nav>

</header>

${bannerHtml}

${
  store.aboutText
    ? `
      <section class="p-about">

        <h3>ہمارے بارے میں</h3>

        <p>${this.escape(store.aboutText)}</p>

      </section>
    `
    : ""
}

<h3 class="p-section-title">
  نمایاں پروڈکٹس
</h3>

<div class="p-grid">
  ${productsHtml}
</div>

<footer class="p-footer">

  <div>
    ${this.escape(store.storeName || "")}
  </div>

  <div>
    ${this.escape(contact.address || "")}
    ${
      contact.city
        ? " | " + this.escape(contact.city)
        : ""
    }
  </div>

  ${
    contact.phoneNumber
      ? `<div>📞 ${this.escape(contact.phoneNumber)}</div>`
      : ""
  }

  ${
    contact.facebookUrl ||
    contact.instagramUrl
      ? `
        <div style="margin-top:6px">

          ${
            contact.facebookUrl
              ? `<a href="${this.attr(contact.facebookUrl)}"
                    target="_blank">Facebook</a>`
              : ""
          }

          ${
            contact.instagramUrl
              ? `<a href="${this.attr(contact.instagramUrl)}"
                    target="_blank">Instagram</a>`
              : ""
          }

        </div>
      `
      : ""
  }

  ${
    contact.whatsappNumber
      ? `
        <a class="p-wa"
           href="https://wa.me/${this.attr(contact.whatsappNumber)}"
           target="_blank">

          WhatsApp پر رابطہ کریں

        </a>
      `
      : ""
  }

</footer>

</body>
</html>
`;
  },

  productCardHTML(product) {

    const img =
      product.images?.[0] || "";

    const hasDiscount =
      Number(product.oldPrice) >
      Number(product.price);

    const stock =
      Array.isArray(product.variants)
        ? product.variants.reduce(
            (sum, v) =>
              sum + Number(v.stock || 0),
            0
          )
        : 0;

    return `
      <article class="p-card">

        ${
          img
            ? `
              <img
                src="${this.attr(img)}"
                alt="${this.attr(product.name || "")}"
                onerror="this.style.opacity='.25'">
            `
            : `
              <div style="
                height:120px;
                display:grid;
                place-items:center;
                background:#edf1ef;
                color:#94a3b8;
                font-size:11px">

                No Image

              </div>
            `
        }

        <div class="p-card-body">

          <p class="p-card-name">
            ${this.escape(
              product.name ||
              "بلا عنوان پروڈکٹ"
            )}
          </p>

          <span class="p-price">
            Rs. ${Number(product.price || 0).toLocaleString()}
          </span>

          ${
            hasDiscount
              ? `
                <span class="p-old-price">
                  Rs. ${Number(product.oldPrice).toLocaleString()}
                </span>
              `
              : ""
          }

          <div class="p-stock">
            Stock: ${stock}
          </div>

        </div>

      </article>
    `;
  },

  color(value, fallback) {

    const v = String(value || "").trim();

    return /^#[0-9a-fA-F]{3,8}$/.test(v)
      ? v
      : fallback;
  },

  escape(value) {

    if (value === null || value === undefined) {
      return "";
    }

    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;
  },

  attr(value) {

    return this.escape(value)
      .replace(/`/g, "&#96;");
  }
};

window.LivePreview = LivePreview;
