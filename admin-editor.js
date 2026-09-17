/**
 * admin-editor.js
 * Part 1 — Private Editor Foundation
 *
 * یہ فائل پورے Private Editor کا "Controller" ہے:
 * - Tabs کے درمیان switching
 * - Forms کو data کے ساتھ bind کرنا
 * - Save/Load/New/Delete Client
 * - Image upload (base64) ہینڈل کرنا
 * - ہر تبدیلی پر Live Preview کو update کرنا
 *
 * انحصار (اسی ترتیب میں HTML میں load ہونی چاہئیں):
 * store-data.js -> validation.js -> storage-manager.js -> product-manager.js -> live-preview.js -> admin-editor.js
 */

const EditorState = {
  currentClient: null,
  activeTab: "store-info",
  activeProductId: null
};

/* -------------------------------------------------------
   Initialization
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initClientSelector();
  bindTabButtons();
  bindGlobalActions();
  loadInitialClient();
});

function loadInitialClient() {
  const activeId = StorageManager.getActiveClientId();
  const existing = activeId ? StorageManager.loadClient(activeId) : null;
  EditorState.currentClient = existing || createEmptyClientData();
  if (!existing) {
    EditorState.currentClient.meta.clientId = generateId("client");
  }
  refreshClientDropdown();
  renderActiveTab();
  updatePreview();
}

/* -------------------------------------------------------
   Tabs
------------------------------------------------------- */
function bindTabButtons() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      EditorState.activeTab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderActiveTab();
    });
  });
}

function renderActiveTab() {
  const container = document.getElementById("tabContent");
  container.innerHTML = "";

  switch (EditorState.activeTab) {
    case "store-info": return renderStoreInfoTab(container);
    case "branding": return renderBrandingTab(container);
    case "products": return renderProductsTab(container);
    case "policies": return renderPoliciesTab(container);
    case "contact": return renderContactTab(container);
    case "clients": return renderClientsTab(container);
  }
}

/* -------------------------------------------------------
   Tab: Store Info
------------------------------------------------------- */
function renderStoreInfoTab(container) {
  const s = EditorState.currentClient.store;
  container.innerHTML = `
    <h2>Store Information</h2>
    <label>Store Name *</label>
    <input type="text" id="fld-storeName" value="${escapeAttr(s.storeName)}" placeholder="مثلاً ABC Garments">

    <label>Tagline (مختصر جملہ)</label>
    <input type="text" id="fld-tagline" value="${escapeAttr(s.tagline)}" placeholder="مثلاً بہترین قیمت، بہترین کوالٹی">

    <label>About Text</label>
    <textarea id="fld-aboutText" rows="5" placeholder="اپنے اسٹور کا مختصر تعارف">${escapeHtml(s.aboutText)}</textarea>

    <div class="form-actions">
      <button class="btn-primary" id="btnSaveStoreInfo">محفوظ کریں</button>
    </div>
    <div id="storeInfoErrors" class="error-box"></div>
  `;

  document.getElementById("btnSaveStoreInfo").addEventListener("click", () => {
    s.storeName = val("fld-storeName");
    s.tagline = val("fld-tagline");
    s.aboutText = val("fld-aboutText");

    const result = Validation.validateStoreInfo(s, EditorState.currentClient.contact);
    showErrors("storeInfoErrors", result.valid ? [] : result.errors.filter(e => e.includes("Store Name")));
    persistAndPreview();
  });

  // ٹائپ کرتے ہی preview فوری اپڈیٹ ہو (بغیر save کیے بھی)
  ["fld-storeName", "fld-tagline", "fld-aboutText"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      s.storeName = val("fld-storeName");
      s.tagline = val("fld-tagline");
      s.aboutText = val("fld-aboutText");
      updatePreview();
    });
  });
}

/* -------------------------------------------------------
   Tab: Branding (Logo, Colors, Banners)
------------------------------------------------------- */
function renderBrandingTab(container) {
  const s = EditorState.currentClient.store;
  container.innerHTML = `
    <h2>Branding</h2>

    <label>Logo</label>
    <div class="image-row">
      ${s.logoUrl ? `<img class="thumb" src="${s.logoUrl}">` : `<div class="thumb thumb-empty">No Logo</div>`}
      <input type="file" id="fld-logoUpload" accept="image/*">
    </div>

    <label>Primary Color</label>
    <input type="color" id="fld-primaryColor" value="${s.primaryColor || "#1a1a1a"}">

    <label>Secondary Color</label>
    <input type="color" id="fld-secondaryColor" value="${s.secondaryColor || "#d4a373"}">

    <label>Banner Images (متعدد منتخب کر سکتے ہیں)</label>
    <input type="file" id="fld-bannerUpload" accept="image/*" multiple>
    <div class="image-row" id="bannerThumbs">
      ${s.bannerImages.map((b, i) => `
        <div class="thumb-wrap">
          <img class="thumb" src="${b.url}">
          <button class="thumb-remove" data-idx="${i}">✕</button>
        </div>
      `).join("")}
    </div>
  `;

  document.getElementById("fld-logoUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    s.logoUrl = await fileToDataURL(file);
    persistAndPreview();
    renderActiveTab();
  });

  document.getElementById("fld-primaryColor").addEventListener("input", (e) => {
    s.primaryColor = e.target.value;
    updatePreview();
  });
  document.getElementById("fld-secondaryColor").addEventListener("input", (e) => {
    s.secondaryColor = e.target.value;
    updatePreview();
  });
  document.getElementById("fld-primaryColor").addEventListener("change", persistAndPreview);
  document.getElementById("fld-secondaryColor").addEventListener("change", persistAndPreview);

  document.getElementById("fld-bannerUpload").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const url = await fileToDataURL(file);
      s.bannerImages.push({ url, caption: "", link: "" });
    }
    persistAndPreview();
    renderActiveTab();
  });

  container.querySelectorAll(".thumb-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      s.bannerImages.splice(Number(btn.dataset.idx), 1);
      persistAndPreview();
      renderActiveTab();
    });
  });
}

/* -------------------------------------------------------
   Tab: Products
------------------------------------------------------- */
function renderProductsTab(container) {
  const client = EditorState.currentClient;

  if (EditorState.activeProductId) {
    return renderProductEditor(container, EditorState.activeProductId);
  }

  container.innerHTML = `
    <h2>Products</h2>
    <div class="form-actions">
      <button class="btn-primary" id="btnAddProduct">+ نیا پروڈکٹ شامل کریں</button>
      <button class="btn-secondary" id="btnAddCategory">+ نئی کیٹیگری</button>
    </div>

    <div class="category-list">
      ${client.categories.map(c => `<span class="chip">${escapeHtml(c.name)} <button data-cat="${c.id}" class="chip-x">✕</button></span>`).join("") || "<em>ابھی کوئی کیٹیگری نہیں۔</em>"}
    </div>

    <table class="data-table">
      <thead><tr><th>تصویر</th><th>نام</th><th>قیمت</th><th>Variants</th><th>Total Stock</th><th></th></tr></thead>
      <tbody>
        ${client.products.map(p => `
          <tr>
            <td>${p.images[0] ? `<img class="thumb-sm" src="${p.images[0]}">` : "—"}</td>
            <td>${escapeHtml(p.name || "(بلا عنوان)")}</td>
            <td>Rs. ${p.price || 0}</td>
            <td>${p.variants.length}</td>
            <td>${p.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)}</td>
            <td>
              <button class="btn-small" data-edit="${p.id}">Edit</button>
              <button class="btn-small btn-danger" data-del="${p.id}">Delete</button>
            </td>
          </tr>
        `).join("") || `<tr><td colspan="6"><em>ابھی کوئی پروڈکٹ شامل نہیں کیا گیا۔</em></td></tr>`}
      </tbody>
    </table>
  `;

  document.getElementById("btnAddProduct").addEventListener("click", () => {
    const p = ProductManager.addProduct(client);
    EditorState.activeProductId = p.id;
    persistAndPreview();
    renderActiveTab();
  });

  document.getElementById("btnAddCategory").addEventListener("click", () => {
    const name = prompt("نئی کیٹیگری کا نام درج کریں:");
    if (name && name.trim()) {
      ProductManager.addCategory(client, name.trim());
      persistAndPreview();
      renderActiveTab();
    }
  });

  container.querySelectorAll(".chip-x").forEach(btn => {
    btn.addEventListener("click", () => {
      ProductManager.deleteCategory(client, btn.dataset.cat);
      persistAndPreview();
      renderActiveTab();
    });
  });

  container.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      EditorState.activeProductId = btn.dataset.edit;
      renderActiveTab();
    });
  });

  container.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("کیا واقعی یہ پروڈکٹ حذف کرنا چاہتے ہیں؟")) {
        ProductManager.deleteProduct(client, btn.dataset.del);
        persistAndPreview();
        renderActiveTab();
      }
    });
  });
}

function renderProductEditor(container, productId) {
  const client = EditorState.currentClient;
  const product = ProductManager.getProduct(client, productId);

  container.innerHTML = `
    <button class="btn-link" id="btnBackToList">← Products کی فہرست پر واپس جائیں</button>
    <h2>Edit Product</h2>

    <label>Product Name *</label>
    <input type="text" id="fld-pName" value="${escapeAttr(product.name)}">

    <label>Description</label>
    <textarea id="fld-pDesc" rows="4">${escapeHtml(product.description)}</textarea>

    <div class="two-col">
      <div>
        <label>Price *</label>
        <input type="number" id="fld-pPrice" value="${product.price}" min="0">
      </div>
      <div>
        <label>Old Price (Discount دکھانے کے لیے)</label>
        <input type="number" id="fld-pOldPrice" value="${product.oldPrice}" min="0">
      </div>
    </div>

    <label>Category</label>
    <select id="fld-pCategory">
      <option value="">— منتخب کریں —</option>
      ${client.categories.map(c => `<option value="${c.id}" ${c.id === product.categoryId ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
    </select>

    <label>Size Guide / Measurement Info</label>
    <textarea id="fld-pSizeGuide" rows="3">${escapeHtml(product.sizeGuide)}</textarea>

    <label>Product Images</label>
    <input type="file" id="fld-pImages" accept="image/*" multiple>
    <div class="image-row">
      ${product.images.map((img, i) => `
        <div class="thumb-wrap">
          <img class="thumb" src="${img}">
          <button class="thumb-remove" data-imgidx="${i}">✕</button>
        </div>
      `).join("")}
    </div>

    <h3>Size / Color Variants</h3>
    <table class="data-table" id="variantTable">
      <thead><tr><th>Size</th><th>Color</th><th>Stock</th><th></th></tr></thead>
      <tbody>
        ${product.variants.map(v => `
          <tr data-vid="${v.id}">
            <td><input type="text" class="v-size" value="${escapeAttr(v.size)}" placeholder="مثلاً M, L, 40, 42"></td>
            <td><input type="text" class="v-color" value="${escapeAttr(v.color)}" placeholder="مثلاً Black, Red"></td>
            <td><input type="number" class="v-stock" value="${v.stock}" min="0"></td>
            <td><button class="btn-small btn-danger v-remove">✕</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <button class="btn-secondary" id="btnAddVariant">+ Size/Color شامل کریں</button>

    <div id="productErrors" class="error-box"></div>
    <div class="form-actions">
      <button class="btn-primary" id="btnSaveProduct">Product محفوظ کریں</button>
    </div>
  `;

  document.getElementById("btnBackToList").addEventListener("click", () => {
    EditorState.activeProductId = null;
    renderActiveTab();
  });

  document.getElementById("fld-pImages").addEventListener("change", async (e) => {
    for (const file of Array.from(e.target.files)) {
      product.images.push(await fileToDataURL(file));
    }
    persistAndPreview();
    renderProductEditor(container, productId);
  });

  container.querySelectorAll(".thumb-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      product.images.splice(Number(btn.dataset.imgidx), 1);
      persistAndPreview();
      renderProductEditor(container, productId);
    });
  });

  document.getElementById("btnAddVariant").addEventListener("click", () => {
    ProductManager.addVariant(client, productId);
    persistAndPreview();
    renderProductEditor(container, productId);
  });

  container.querySelectorAll(".v-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      ProductManager.deleteVariant(client, productId, row.dataset.vid);
      persistAndPreview();
      renderProductEditor(container, productId);
    });
  });

  document.getElementById("btnSaveProduct").addEventListener("click", () => {
    product.name = val("fld-pName");
    product.description = val("fld-pDesc");
    product.price = Number(val("fld-pPrice")) || 0;
    product.oldPrice = Number(val("fld-pOldPrice")) || 0;
    product.categoryId = val("fld-pCategory");
    product.sizeGuide = val("fld-pSizeGuide");

    // ہر variant row سے تازہ data اٹھائیں
    container.querySelectorAll("#variantTable tbody tr").forEach(row => {
      const vid = row.dataset.vid;
      ProductManager.updateVariant(client, productId, vid, {
        size: row.querySelector(".v-size").value.trim(),
        color: row.querySelector(".v-color").value.trim(),
        stock: row.querySelector(".v-stock").value
      });
    });

    const result = Validation.validateProduct(product);
    showErrors("productErrors", result.errors);
    if (result.valid) {
      persistAndPreview();
      EditorState.activeProductId = null;
      renderActiveTab();
    }
  });
}

/* -------------------------------------------------------
   Tab: Policies
------------------------------------------------------- */
function renderPoliciesTab(container) {
  const p = EditorState.currentClient.policies;
  container.innerHTML = `
    <h2>Policies</h2>
    <label>Shipping Policy</label>
    <textarea id="fld-shipping" rows="4">${escapeHtml(p.shippingPolicy)}</textarea>

    <label>Return Policy</label>
    <textarea id="fld-return" rows="4">${escapeHtml(p.returnPolicy)}</textarea>

    <label>Privacy Policy</label>
    <textarea id="fld-privacy" rows="4">${escapeHtml(p.privacyPolicy)}</textarea>

    <label>Terms & Conditions</label>
    <textarea id="fld-terms" rows="4">${escapeHtml(p.termsAndConditions)}</textarea>

    <div class="form-actions">
      <button class="btn-primary" id="btnSavePolicies">محفوظ کریں</button>
    </div>
  `;
  document.getElementById("btnSavePolicies").addEventListener("click", () => {
    p.shippingPolicy = val("fld-shipping");
    p.returnPolicy = val("fld-return");
    p.privacyPolicy = val("fld-privacy");
    p.termsAndConditions = val("fld-terms");
    persistAndPreview();
  });
}

/* -------------------------------------------------------
   Tab: Contact & Social
------------------------------------------------------- */
function renderContactTab(container) {
  const c = EditorState.currentClient.contact;
  container.innerHTML = `
    <h2>Contact & Social</h2>

    <label>WhatsApp Number * (بغیر + کے، مثلاً 923001234567)</label>
    <input type="text" id="fld-whatsapp" value="${escapeAttr(c.whatsappNumber)}">

    <label>Phone Number</label>
    <input type="text" id="fld-phone" value="${escapeAttr(c.phoneNumber)}">

    <label>Address</label>
    <input type="text" id="fld-address" value="${escapeAttr(c.address)}">

    <label>City</label>
    <input type="text" id="fld-city" value="${escapeAttr(c.city)}">

    <label>Facebook URL</label>
    <input type="text" id="fld-facebook" value="${escapeAttr(c.facebookUrl)}">

    <label>Instagram URL</label>
    <input type="text" id="fld-instagram" value="${escapeAttr(c.instagramUrl)}">

    <div id="contactErrors" class="error-box"></div>
    <div class="form-actions">
      <button class="btn-primary" id="btnSaveContact">محفوظ کریں</button>
    </div>
  `;
  document.getElementById("btnSaveContact").addEventListener("click", () => {
    c.whatsappNumber = val("fld-whatsapp").replace(/[^0-9]/g, "");
    c.phoneNumber = val("fld-phone");
    c.address = val("fld-address");
    c.city = val("fld-city");
    c.facebookUrl = val("fld-facebook");
    c.instagramUrl = val("fld-instagram");

    const result = Validation.validateStoreInfo(EditorState.currentClient.store, c);
    showErrors("contactErrors", result.errors.filter(e => !e.includes("Store Name")));
    persistAndPreview();
  });
}

/* -------------------------------------------------------
   Tab: Clients (Save/Load/New/Export/Import)
------------------------------------------------------- */
function renderClientsTab(container) {
  const ids = StorageManager.listClientIds();
  container.innerHTML = `
    <h2>Clients Manager</h2>
    <p>موجودہ Client ID: <strong>${EditorState.currentClient.meta.clientId}</strong></p>

    <div class="form-actions">
      <button class="btn-primary" id="btnNewClient">+ نیا Client شروع کریں</button>
      <button class="btn-secondary" id="btnExportJson">Export (JSON) کریں</button>
      <label class="btn-secondary file-label">Import (JSON)
        <input type="file" id="fld-importJson" accept="application/json" style="display:none">
      </label>
    </div>

    <table class="data-table">
      <thead><tr><th>Client ID</th><th>Store Name</th><th></th></tr></thead>
      <tbody>
        ${ids.map(id => {
          const c = StorageManager.loadClient(id);
          return `<tr>
            <td>${id}</td>
            <td>${escapeHtml(c.store.storeName || "(بلا نام)")}</td>
            <td>
              <button class="btn-small" data-load="${id}">Load</button>
              <button class="btn-small btn-danger" data-remove="${id}">Delete</button>
            </td>
          </tr>`;
        }).join("") || `<tr><td colspan="3"><em>ابھی کوئی محفوظ شدہ client نہیں۔</em></td></tr>`}
      </tbody>
    </table>
  `;

  document.getElementById("btnNewClient").addEventListener("click", () => {
    if (!confirm("موجودہ unsaved تبدیلیاں ضائع ہو سکتی ہیں۔ نیا client شروع کریں؟")) return;
    EditorState.currentClient = createEmptyClientData();
    EditorState.currentClient.meta.clientId = generateId("client");
    EditorState.activeProductId = null;
    renderActiveTab();
    updatePreview();
  });

  document.getElementById("btnExportJson").addEventListener("click", () => {
    StorageManager.exportClientAsJSON(EditorState.currentClient);
  });

  document.getElementById("fld-importJson").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await StorageManager.importClientFromJSONFile(file);
      EditorState.currentClient = data;
      EditorState.activeProductId = null;
      persistAndPreview();
      renderActiveTab();
      alert("Client data کامیابی سے import ہو گیا۔");
    } catch (err) {
      alert(err.message);
    }
  });

  container.querySelectorAll("[data-load]").forEach(btn => {
    btn.addEventListener("click", () => {
      EditorState.currentClient = StorageManager.loadClient(btn.dataset.load);
      EditorState.activeProductId = null;
      StorageManager.setActiveClient(btn.dataset.load);
      renderActiveTab();
      updatePreview();
    });
  });

  container.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("کیا واقعی یہ client مکمل طور پر حذف کرنا چاہتے ہیں؟")) {
        StorageManager.deleteClient(btn.dataset.remove);
        renderActiveTab();
      }
    });
  });
}

/* -------------------------------------------------------
   Global actions (top bar: Save Client, Generate placeholder)
------------------------------------------------------- */
function bindGlobalActions() {
  document.getElementById("btnGlobalSave").addEventListener("click", () => {
    try {
      StorageManager.saveClient(EditorState.currentClient);
      flashMessage("Client محفوظ ہو گیا۔");
      refreshClientDropdown();
    } catch (err) {
      alert(err.message);
    }
  });

  // Part 3 (Website Generator) میں یہ بٹن اصل ZIP جنریشن سے جوڑا جائے گا۔
  document.getElementById("btnGlobalGenerate").addEventListener("click", () => {
    alert("Website Generator ابھی Part 3 میں شامل کیا جائے گا۔ فی الحال آپ Client کا مکمل data یہاں تیار اور محفوظ کر سکتے ہیں۔");
  });
}

function initClientSelector() {
  // Placeholder — dropdown کو refreshClientDropdown() کے ذریعے پُر کیا جاتا ہے۔
}

function refreshClientDropdown() {
  const select = document.getElementById("quickClientSelect");
  if (!select) return;
  const ids = StorageManager.listClientIds();
  select.innerHTML = `<option value="">— Client منتخب کریں —</option>` +
    ids.map(id => {
      const c = StorageManager.loadClient(id);
      const label = c.store.storeName || id;
      const selected = id === EditorState.currentClient.meta.clientId ? "selected" : "";
      return `<option value="${id}" ${selected}>${escapeHtml(label)}</option>`;
    }).join("");

  select.onchange = () => {
    if (!select.value) return;
    EditorState.currentClient = StorageManager.loadClient(select.value);
    EditorState.activeProductId = null;
    StorageManager.setActiveClient(select.value);
    renderActiveTab();
    updatePreview();
  };
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function persistAndPreview() {
  // خودکار طور پر localStorage میں بھی رکھ دیں (safety net)، مکمل "Save" الگ سے موجود ہے۔
  try { StorageManager.saveClient(EditorState.currentClient); } catch (e) { /* clientId نہ ہو تو نظر انداز */ }
  updatePreview();
}

function updatePreview() {
  LivePreview.render(EditorState.currentClient);
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function showErrors(containerId, errors) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = errors.length
    ? `<ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`
    : "";
}

function flashMessage(msg) {
  const el = document.getElementById("flashMessage");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
