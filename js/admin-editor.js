const EditorState = {
  currentClient: null,
  activeTab: "store-info",
  activeProductId: null
};

document.addEventListener("DOMContentLoaded", () => {

  try {

    bindTabButtons();
    bindGlobalActions();
    loadInitialClient();

  } catch (error) {

    console.error(error);

    alert("Editor شروع نہیں ہو سکا: " + error.message);
  }
});

/* ================= INITIALIZATION ================= */

function loadInitialClient() {

  const activeId =
    StorageManager.getActiveClientId();

  const existing =
    activeId
      ? StorageManager.loadClient(activeId)
      : null;

  EditorState.currentClient =
    existing || createEmptyClientData();

  if (!existing) {

    EditorState.currentClient.meta.clientId =
      generateId("client");
  }

  refreshClientDropdown();
  renderActiveTab();
  updatePreview();
}

/* ================= TABS ================= */

function bindTabButtons() {

  document.querySelectorAll(".tab-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        EditorState.activeTab =
          btn.dataset.tab;

        EditorState.activeProductId = null;

        document.querySelectorAll(".tab-btn")
          .forEach(b =>
            b.classList.remove("active")
          );

        btn.classList.add("active");

        renderActiveTab();

      });

    });
}

function renderActiveTab() {

  const container =
    document.getElementById("tabContent");

  container.innerHTML = "";

  switch (EditorState.activeTab) {

    case "store-info":
      renderStoreInfoTab(container);
      break;

    case "branding":
      renderBrandingTab(container);
      break;

    case "products":
      renderProductsTab(container);
      break;

    case "policies":
      renderPoliciesTab(container);
      break;

    case "contact":
      renderContactTab(container);
      break;

    case "clients":
      renderClientsTab(container);
      break;
  }
}

/* ================= STORE INFO ================= */

function renderStoreInfoTab(container) {

  const s =
    EditorState.currentClient.store;

  container.innerHTML = `

    <h2>🏪 Store Information</h2>

    <label>Store Name *</label>

    <input
      type="text"
      id="fld-storeName"
      value="${escapeAttr(s.storeName)}"
      placeholder="مثلاً ABC Garments">

    <label>Tagline</label>

    <input
      type="text"
      id="fld-tagline"
      value="${escapeAttr(s.tagline)}"
      placeholder="بہترین قیمت، بہترین کوالٹی">

    <label>About Text</label>

    <textarea
      id="fld-aboutText"
      rows="6"
      placeholder="اپنے اسٹور کا تعارف">${escapeHtml(s.aboutText)}</textarea>

    <div id="storeInfoErrors" class="error-box"></div>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnSaveStoreInfo">

        💾 محفوظ کریں

      </button>

    </div>
  `;

  [
    "fld-storeName",
    "fld-tagline",
    "fld-aboutText"
  ]
  .forEach(id => {

    document.getElementById(id)
      .addEventListener("input", () => {

        s.storeName =
          val("fld-storeName");

        s.tagline =
          val("fld-tagline");

        s.aboutText =
          val("fld-aboutText");

        updatePreview();

      });
  });

  document.getElementById(
    "btnSaveStoreInfo"
  ).addEventListener("click", () => {

    s.storeName = val("fld-storeName");
    s.tagline = val("fld-tagline");
    s.aboutText = val("fld-aboutText");

    const result =
      Validation.validateStoreInfo(
        s,
        EditorState.currentClient.contact
      );

    showErrors(
      "storeInfoErrors",
      result.errors
    );

    if (result.valid) {

      saveCurrentClient();

      flashMessage("Store Information محفوظ ہو گئی۔");
    }
  });
}

/* ================= BRANDING ================= */

function renderBrandingTab(container) {

  const s =
    EditorState.currentClient.store;

  const banners =
    Array.isArray(s.bannerImages)
      ? s.bannerImages
      : [];

  container.innerHTML = `

    <h2>🎨 Branding & Banners</h2>

    <label>Logo</label>

    <div class="image-row">

      ${
        s.logoUrl
          ? `
            <div class="thumb-wrap">

              <img
                class="thumb"
                src="${escapeAttr(s.logoUrl)}">

              <button
                class="thumb-remove"
                id="btnRemoveLogo">

                ✕

              </button>

            </div>
          `
          : `
            <div class="thumb thumb-empty">
              No Logo
            </div>
          `
      }

      <input
        type="file"
        id="fld-logoUpload"
        accept="image/*">

    </div>

    <label>Primary Color</label>

    <input
      type="color"
      id="fld-primaryColor"
      value="${escapeAttr(s.primaryColor || "#16a34a")}">

    <label>Secondary Color</label>

    <input
      type="color"
      id="fld-secondaryColor"
      value="${escapeAttr(s.secondaryColor || "#0ea5e9")}">

    <label>Banner Images</label>

    <input
      type="file"
      id="fld-bannerUpload"
      accept="image/*"
      multiple>

    <div
      class="image-row"
      id="bannerThumbs">

      ${
        banners.length
          ? banners.map((b, i) => `

            <div class="thumb-wrap">

              <img
                class="thumb"
                src="${escapeAttr(b.url)}">

              <button
                class="thumb-remove"
                data-banner-remove="${i}">

                ✕

              </button>

            </div>

          `).join("")
          : `
            <em>
              ابھی کوئی banner شامل نہیں کیا گیا۔
            </em>
          `
      }

    </div>

    <div id="bannerErrors" class="error-box"></div>
  `;

  const logoInput =
    document.getElementById(
      "fld-logoUpload"
    );

  logoInput.addEventListener(
    "change",
    async e => {

      const file = e.target.files[0];

      if (!file) return;

      if (!isImageFile(file)) {

        showErrors(
          "bannerErrors",
          ["صرف image فائل استعمال کریں۔"]
        );

        return;
      }

      s.logoUrl =
        await fileToDataURL(file);

      saveCurrentClient();
      renderActiveTab();
      updatePreview();

    }
  );

  const removeLogo =
    document.getElementById(
      "btnRemoveLogo"
    );

  if (removeLogo) {

    removeLogo.addEventListener(
      "click",
      () => {

        s.logoUrl = "";

        saveCurrentClient();
        renderActiveTab();
        updatePreview();

      }
    );
  }

  document.getElementById(
    "fld-primaryColor"
  ).addEventListener("input", e => {

    s.primaryColor = e.target.value;

    updatePreview();

  });

  document.getElementById(
    "fld-secondaryColor"
  ).addEventListener("input", e => {

    s.secondaryColor = e.target.value;

    updatePreview();

  });

  document.getElementById(
    "fld-primaryColor"
  ).addEventListener(
    "change",
    saveCurrentClient
  );

  document.getElementById(
    "fld-secondaryColor"
  ).addEventListener(
    "change",
    saveCurrentClient
  );

  document.getElementById(
    "fld-bannerUpload"
  ).addEventListener(
    "change",
    async e => {

      const files =
        Array.from(e.target.files || []);

      for (const file of files) {

        if (!isImageFile(file)) {
          continue;
        }

        const url =
          await fileToDataURL(file);

        banners.push({
          url,
          caption: "",
          link: ""
        });
      }

      s.bannerImages = banners;

      saveCurrentClient();
      renderActiveTab();
      updatePreview();

    }
  );

  container.querySelectorAll(
    "[data-banner-remove]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const index =
          Number(btn.dataset.bannerRemove);

        banners.splice(index, 1);

        s.bannerImages = banners;

        saveCurrentClient();
        renderActiveTab();
        updatePreview();

      }
    );
  });
}

/* ================= PRODUCTS ================= */

function renderProductsTab(container) {

  const client =
    EditorState.currentClient;

  if (EditorState.activeProductId) {

    renderProductEditor(
      container,
      EditorState.activeProductId
    );

    return;
  }

  container.innerHTML = `

    <h2>📦 Products</h2>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnAddProduct">

        + نیا Product

      </button>

      <button
        class="btn-secondary"
        id="btnAddCategory">

        + نئی Category

      </button>

    </div>

    <div class="category-list">

      ${
        client.categories.length
          ? client.categories.map(c => `

            <span class="chip">

              ${escapeHtml(c.name)}

              <button
                class="chip-x"
                data-cat="${escapeAttr(c.id)}">

                ✕

              </button>

            </span>

          `).join("")
          : `
            <em>
              ابھی کوئی category نہیں۔
            </em>
          `
      }

    </div>

    <div style="overflow:auto">

      <table class="data-table">

        <thead>

          <tr>

            <th>تصویر</th>
            <th>نام</th>
            <th>قیمت</th>
            <th>Variants</th>
            <th>Stock</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          ${
            client.products.length
              ? client.products.map(p => {

                  const stock =
                    p.variants.reduce(
                      (sum, v) =>
                        sum + Number(v.stock || 0),
                      0
                    );

                  return `

                  <tr>

                    <td>

                      ${
                        p.images?.[0]
                          ? `
                            <img
                              class="thumb-sm"
                              src="${escapeAttr(p.images[0])}">
                          `
                          : "—"
                      }

                    </td>

                    <td>

                      ${escapeHtml(
                        p.name ||
                        "(بلا عنوان)"
                      )}

                    </td>

                    <td>

                      Rs. ${Number(
                        p.price || 0
                      ).toLocaleString()}

                    </td>

                    <td>
                      ${p.variants.length}
                    </td>

                    <td>
                      ${stock}
                    </td>

                    <td>

                      <button
                        class="btn-small"
                        data-edit="${escapeAttr(p.id)}">

                        Edit

                      </button>

                      <button
                        class="btn-small btn-danger"
                        data-del="${escapeAttr(p.id)}">

                        Delete

                      </button>

                    </td>

                  </tr>

                `;

                }).join("")
              : `
                <tr>

                  <td colspan="6">

                    <em>
                      ابھی کوئی Product نہیں۔
                    </em>

                  </td>

                </tr>
              `
          }

        </tbody>

      </table>

    </div>
  `;

  document.getElementById(
    "btnAddProduct"
  ).addEventListener("click", () => {

    const product =
      ProductManager.addProduct(client);

    EditorState.activeProductId =
      product.id;

    saveCurrentClient();
    renderActiveTab();

  });

  document.getElementById(
    "btnAddCategory"
  ).addEventListener("click", () => {

    const name =
      prompt("نئی Category کا نام:");

    if (!name?.trim()) return;

    try {

      ProductManager.addCategory(
        client,
        name
      );

      saveCurrentClient();
      renderActiveTab();
      updatePreview();

    } catch (error) {

      alert(error.message);
    }
  });

  container.querySelectorAll(
    "[data-edit]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        EditorState.activeProductId =
          btn.dataset.edit;

        renderActiveTab();

      }
    );
  });

  container.querySelectorAll(
    "[data-del]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        if (
          !confirm(
            "کیا واقعی یہ Product delete کرنا چاہتے ہیں؟"
          )
        ) return;

        ProductManager.deleteProduct(
          client,
          btn.dataset.del
        );

        saveCurrentClient();
        renderActiveTab();
        updatePreview();

      }
    );
  });

  container.querySelectorAll(
    "[data-cat]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        if (
          !confirm(
            "Category delete کرنے سے اس category کے products Uncategorized ہو جائیں گے۔ جاری رکھیں؟"
          )
        ) return;

        ProductManager.deleteCategory(
          client,
          btn.dataset.cat
        );

        saveCurrentClient();
        renderActiveTab();
        updatePreview();

      }
    );
  });
}

/* ================= PRODUCT EDITOR ================= */

function renderProductEditor(
  container,
  productId
) {

  const client =
    EditorState.currentClient;

  const product =
    ProductManager.getProduct(
      client,
      productId
    );

  if (!product) {

    EditorState.activeProductId = null;

    renderProductsTab(container);

    return;
  }

  container.innerHTML = `

    <button
      class="btn-link"
      id="btnBackToList">

      ← Products کی فہرست

    </button>

    <h2>📦 Edit Product</h2>

    <label>Product Name *</label>

    <input
      type="text"
      id="fld-pName"
      value="${escapeAttr(product.name)}">

    <label>Description</label>

    <textarea
      id="fld-pDesc"
      rows="5">${escapeHtml(product.description)}</textarea>

    <div class="two-col">

      <div>

        <label>Price *</label>

        <input
          type="number"
          id="fld-pPrice"
          value="${product.price}"
          min="0">

      </div>

      <div>

        <label>Old Price</label>

        <input
          type="number"
          id="fld-pOldPrice"
          value="${product.oldPrice}"
          min="0">

      </div>

    </div>

    <label>Category</label>

    <select id="fld-pCategory">

      <option value="">
        — Uncategorized —
      </option>

      ${
        client.categories.map(c => `

          <option
            value="${escapeAttr(c.id)}"
            ${
              c.id === product.categoryId
                ? "selected"
                : ""
            }>

            ${escapeHtml(c.name)}

          </option>

        `).join("")
      }

    </select>

    <label>Size Guide / Measurement Info</label>

    <textarea
      id="fld-pSizeGuide"
      rows="4">${escapeHtml(product.sizeGuide)}</textarea>

    <label>Product Images</label>

    <input
      type="file"
      id="fld-pImages"
      accept="image/*"
      multiple>

    <div class="image-row">

      ${
        product.images.length
          ? product.images.map((img, i) => `

            <div class="thumb-wrap">

              <img
                class="thumb"
                src="${escapeAttr(img)}">

              <button
                class="thumb-remove"
                data-imgidx="${i}">

                ✕

              </button>

            </div>

          `).join("")
          : `
            <em>
              ابھی کوئی image نہیں۔
            </em>
          `
      }

    </div>

    <h3>Size / Color Variants</h3>

    <div style="overflow:auto">

      <table
        class="data-table"
        id="variantTable">

        <thead>

          <tr>

            <th>Size</th>
            <th>Color</th>
            <th>Stock</th>
            <th></th>

          </tr>

        </thead>

        <tbody>

          ${
            product.variants.length
              ? product.variants.map(v => `

                <tr data-vid="${escapeAttr(v.id)}">

                  <td>

                    <input
                      type="text"
                      class="v-size"
                      value="${escapeAttr(v.size)}"
                      placeholder="M, L, 40">

                  </td>

                  <td>

                    <input
                      type="text"
                      class="v-color"
                      value="${escapeAttr(v.color)}"
                      placeholder="Black">

                  </td>

                  <td>

                    <input
                      type="number"
                      class="v-stock"
                      value="${v.stock}"
                      min="0">

                  </td>

                  <td>

                    <button
                      class="btn-small btn-danger v-remove">

                      ✕

                    </button>

                  </td>

                </tr>

              `).join("")
              : `
                <tr>

                  <td colspan="4">

                    <em>
                      Variant optional ہے۔ اگر ضرورت ہو تو نیچے button سے شامل کریں۔
                    </em>

                  </td>

                </tr>
              `
          }

        </tbody>

      </table>

    </div>

    <button
      class="btn-secondary"
      id="btnAddVariant">

      + Size / Color شامل کریں

    </button>

    <div
      id="productErrors"
      class="error-box">
    </div>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnSaveProduct">

        💾 Product محفوظ کریں

      </button>

    </div>
  `;

  document.getElementById(
    "btnBackToList"
  ).addEventListener("click", () => {

    EditorState.activeProductId = null;

    renderActiveTab();

  });

  document.getElementById(
    "fld-pImages"
  ).addEventListener(
    "change",
    async e => {

      const files =
        Array.from(e.target.files || []);

      for (const file of files) {

        if (!isImageFile(file)) {
          continue;
        }

        product.images.push(
          await fileToDataURL(file)
        );
      }

      saveCurrentClient();

      renderProductEditor(
        container,
        productId
      );

      updatePreview();

    }
  );

  container.querySelectorAll(
    "[data-imgidx]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        product.images.splice(
          Number(btn.dataset.imgidx),
          1
        );

        saveCurrentClient();

        renderProductEditor(
          container,
          productId
        );

        updatePreview();

      }
    );
  });

  document.getElementById(
    "btnAddVariant"
  ).addEventListener(
    "click",
    () => {

      ProductManager.addVariant(
        client,
        productId
      );

      saveCurrentClient();

      renderProductEditor(
        container,
        productId
      );

    }
  );

  container.querySelectorAll(
    ".v-remove"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      e => {

        const row =
          e.target.closest("tr");

        ProductManager.deleteVariant(
          client,
          productId,
          row.dataset.vid
        );

        saveCurrentClient();

        renderProductEditor(
          container,
          productId
        );

      }
    );
  });

  document.getElementById(
    "btnSaveProduct"
  ).addEventListener(
    "click",
    () => {

      product.name =
        val("fld-pName");

      product.description =
        val("fld-pDesc");

      product.price =
        Number(val("fld-pPrice")) || 0;

      product.oldPrice =
        Number(val("fld-pOldPrice")) || 0;

      product.categoryId =
        val("fld-pCategory");

      product.sizeGuide =
        val("fld-pSizeGuide");

      container.querySelectorAll(
        "#variantTable tbody tr[data-vid]"
      ).forEach(row => {

        ProductManager.updateVariant(
          client,
          productId,
          row.dataset.vid,
          {

            size:
              row.querySelector(
                ".v-size"
              ).value.trim(),

            color:
              row.querySelector(
                ".v-color"
              ).value.trim(),

            stock:
              row.querySelector(
                ".v-stock"
              ).value

          }
        );
      });

      const result =
        Validation.validateProduct(
          product
        );

      showErrors(
        "productErrors",
        result.errors
      );

      if (!result.valid) return;

      saveCurrentClient();

      EditorState.activeProductId = null;

      renderActiveTab();

      updatePreview();

      flashMessage(
        "Product محفوظ ہو گیا۔"
      );

    }
  );
}

/* ================= POLICIES ================= */

function renderPoliciesTab(container) {

  const p =
    EditorState.currentClient.policies;

  container.innerHTML = `

    <h2>📄 Policies</h2>

    <label>Shipping Policy</label>

    <textarea
      id="fld-shipping"
      rows="5">${escapeHtml(p.shippingPolicy)}</textarea>

    <label>Return Policy</label>

    <textarea
      id="fld-return"
      rows="5">${escapeHtml(p.returnPolicy)}</textarea>

    <label>Privacy Policy</label>

    <textarea
      id="fld-privacy"
      rows="5">${escapeHtml(p.privacyPolicy)}</textarea>

    <label>Terms & Conditions</label>

    <textarea
      id="fld-terms"
      rows="5">${escapeHtml(p.termsAndConditions)}</textarea>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnSavePolicies">

        💾 Policies محفوظ کریں

      </button>

    </div>
  `;

  document.getElementById(
    "btnSavePolicies"
  ).addEventListener("click", () => {

    p.shippingPolicy =
      val("fld-shipping");

    p.returnPolicy =
      val("fld-return");

    p.privacyPolicy =
      val("fld-privacy");

    p.termsAndConditions =
      val("fld-terms");

    saveCurrentClient();

    updatePreview();

    flashMessage(
      "Policies محفوظ ہو گئی ہیں۔"
    );

  });
}

/* ================= CONTACT ================= */

function renderContactTab(container) {

  const c =
    EditorState.currentClient.contact;

  container.innerHTML = `

    <h2>📞 Contact & Social</h2>

    <label>
      WhatsApp Number *
      <small>
        بغیر +، مثلاً 923001234567
      </small>
    </label>

    <input
      type="text"
      id="fld-whatsapp"
      value="${escapeAttr(c.whatsappNumber)}">

    <label>Phone Number</label>

    <input
      type="text"
      id="fld-phone"
      value="${escapeAttr(c.phoneNumber)}">

    <label>Address</label>

    <input
      type="text"
      id="fld-address"
      value="${escapeAttr(c.address)}">

    <label>City</label>

    <input
      type="text"
      id="fld-city"
      value="${escapeAttr(c.city)}">

    <label>Facebook URL</label>

    <input
      type="url"
      id="fld-facebook"
      value="${escapeAttr(c.facebookUrl)}"
      placeholder="https://facebook.com/...">

    <label>Instagram URL</label>

    <input
      type="url"
      id="fld-instagram"
      value="${escapeAttr(c.instagramUrl)}"
      placeholder="https://instagram.com/...">

    <div
      id="contactErrors"
      class="error-box">
    </div>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnSaveContact">

        💾 Contact محفوظ کریں

      </button>

    </div>
  `;

  document.getElementById(
    "btnSaveContact"
  ).addEventListener("click", () => {

    c.whatsappNumber =
      val("fld-whatsapp")
        .replace(/[^0-9]/g, "");

    c.phoneNumber =
      val("fld-phone");

    c.address =
      val("fld-address");

    c.city =
      val("fld-city");

    c.facebookUrl =
      val("fld-facebook");

    c.instagramUrl =
      val("fld-instagram");

    const result =
      Validation.validateStoreInfo(
        EditorState.currentClient.store,
        c
      );

    showErrors(
      "contactErrors",
      result.errors
    );

    if (!result.valid) return;

    saveCurrentClient();

    updatePreview();

    flashMessage(
      "Contact information محفوظ ہو گئی۔"
    );

  });
}

/* ================= CLIENTS ================= */

function renderClientsTab(container) {

  const ids =
    StorageManager.listClientIds();

  container.innerHTML = `

    <h2>👥 Clients Manager</h2>

    <p>
      Current Client ID:

      <strong>
        ${escapeHtml(
          EditorState.currentClient.meta.clientId
        )}
      </strong>

    </p>

    <div class="form-actions">

      <button
        class="btn btn-primary"
        id="btnNewClient">

        + نیا Client

      </button>

      <button
        class="btn-secondary"
        id="btnExportJson">

        Export JSON

      </button>

      <label class="btn-secondary file-label">

        Import JSON

        <input
          type="file"
          id="fld-importJson"
          accept="application/json"
          hidden>

      </label>

    </div>

    <div style="overflow:auto">

      <table class="data-table">

        <thead>

          <tr>

            <th>Client ID</th>
            <th>Store Name</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          ${
            ids.length
              ? ids.map(id => {

                  const c =
                    StorageManager.loadClient(id);

                  return `

                  <tr>

                    <td>
                      ${escapeHtml(id)}
                    </td>

                    <td>
                      ${escapeHtml(
                        c?.store?.storeName ||
                        "(بلا نام)"
                      )}
                    </td>

                    <td>

                      <button
                        class="btn-small"
                        data-load="${escapeAttr(id)}">

                        Load

                      </button>

                      <button
                        class="btn-small btn-danger"
                        data-remove="${escapeAttr(id)}">

                        Delete

                      </button>

                    </td>

                  </tr>

                `;

                }).join("")
              : `
                <tr>

                  <td colspan="3">
                    ابھی کوئی saved client نہیں۔
                  </td>

                </tr>
              `
          }

        </tbody>

      </table>

    </div>
  `;

  document.getElementById(
    "btnNewClient"
  ).addEventListener("click", () => {

    if (
      !confirm(
        "نیا Client شروع کرنا چاہتے ہیں؟"
      )
    ) return;

    EditorState.currentClient =
      createEmptyClientData();

    EditorState.activeProductId = null;

    localStorage.removeItem(
      StorageManager.ACTIVE_CLIENT_KEY
    );

    refreshClientDropdown();
    renderActiveTab();
    updatePreview();

    flashMessage(
      "نیا Client تیار ہے۔"
    );

  });

  document.getElementById(
    "btnExportJson"
  ).addEventListener("click", () => {

    StorageManager.exportClientAsJSON(
      EditorState.currentClient
    );

  });

  document.getElementById(
    "fld-importJson"
  ).addEventListener(
    "change",
    async e => {

      const file =
        e.target.files[0];

      if (!file) return;

      try {

        const imported =
          await StorageManager
            .importClientFromJSONFile(file);

        /*
         * Imported ID اگر موجود ہو تو بھی
         * existing client کو silently overwrite
         * نہیں کرتے؛ نیا ID بناتے ہیں۔
         */

        const originalId =
          imported.meta.clientId;

        if (
          StorageManager.loadClient(originalId)
        ) {

          imported.meta.clientId =
            generateId("client");
        }

        EditorState.currentClient =
          imported;

        EditorState.activeProductId = null;

        saveCurrentClient();

        refreshClientDropdown();
        renderActiveTab();
        updatePreview();

        alert(
          "Client data کامیابی سے import ہو گیا۔"
        );

      } catch (error) {

        alert(error.message);
      }

      e.target.value = "";

    }
  );

  container.querySelectorAll(
    "[data-load]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const loaded =
          StorageManager.loadClient(
            btn.dataset.load
          );

        if (!loaded) {

          alert("Client نہیں ملا۔");

          return;
        }

        EditorState.currentClient =
          loaded;

        EditorState.activeProductId =
          null;

        StorageManager.setActiveClient(
          loaded.meta.clientId
        );

        refreshClientDropdown();
        renderActiveTab();
        updatePreview();

        flashMessage(
          "Client load ہو گیا۔"
        );

      }
    );
  });

  container.querySelectorAll(
    "[data-remove]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        if (
          !confirm(
            "کیا واقعی یہ Client مکمل delete کرنا چاہتے ہیں؟"
          )
        ) return;

        const deletingId =
          btn.dataset.remove;

        StorageManager.deleteClient(
          deletingId
        );

        if (
          EditorState.currentClient
            .meta.clientId === deletingId
        ) {

          const remaining =
            StorageManager.listClientIds();

          if (remaining.length) {

            const next =
              StorageManager.loadClient(
                remaining[0]
              );

            EditorState.currentClient =
              next;

            StorageManager.setActiveClient(
              next.meta.clientId
            );

          } else {

            EditorState.currentClient =
              createEmptyClientData();

            localStorage.removeItem(
              StorageManager.ACTIVE_CLIENT_KEY
            );
          }

          EditorState.activeProductId = null;
        }

        refreshClientDropdown();
        renderActiveTab();
        updatePreview();

        flashMessage(
          "Client delete ہو گیا۔"
        );

      }
    );
  });
}

/* ================= GLOBAL ACTIONS ================= */

function bindGlobalActions() {

  document.getElementById(
    "btnGlobalSave"
  ).addEventListener("click", () => {

    try {

      saveCurrentClient();

      refreshClientDropdown();

      flashMessage(
        "Client محفوظ ہو گیا۔"
      );

    } catch (error) {

      alert(error.message);
    }

  });

  document.getElementById(
    "btnGlobalGenerate"
  ).addEventListener("click", () => {

    alert(
      "Client Website Generator Part 3 میں آئے گا۔ ابھی Master Editor میں Client data تیار اور محفوظ کیا جا سکتا ہے۔"
    );

  });
}

/* ================= HELPERS ================= */

function saveCurrentClient() {

  EditorState.currentClient =
    normalizeClientData(
      EditorState.currentClient
    );

  StorageManager.saveClient(
    EditorState.currentClient
  );
}

function refreshClientDropdown() {

  const select =
    document.getElementById(
      "quickClientSelect"
    );

  if (!select) return;

  const ids =
    StorageManager.listClientIds();

  const currentId =
    EditorState.currentClient
      ?.meta?.clientId || "";

  select.innerHTML =
    `<option value="">
      — Client منتخب کریں —
    </option>` +

    ids.map(id => {

      const c =
        StorageManager.loadClient(id);

      return `
        <option
          value="${escapeAttr(id)}"
          ${
            id === currentId
              ? "selected"
              : ""
          }>

          ${escapeHtml(
            c?.store?.storeName ||
            id
          )}

        </option>
      `;

    }).join("");

  select.onchange = () => {

    if (!select.value) return;

    const loaded =
      StorageManager.loadClient(
        select.value
      );

    if (!loaded) return;

    EditorState.currentClient =
      loaded;

    EditorState.activeProductId = null;

    StorageManager.setActiveClient(
      loaded.meta.clientId
    );

    renderActiveTab();
    updatePreview();

  };
}

function updatePreview() {

  LivePreview.render(
    EditorState.currentClient
  );
}

function val(id) {

  const el =
    document.getElementById(id);

  return el
    ? el.value.trim()
    : "";
}

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char])
  );
}

function escapeAttr(value) {

  return escapeHtml(value);
}

function showErrors(
  containerId,
  errors
) {

  const box =
    document.getElementById(
      containerId
    );

  if (!box) return;

  box.innerHTML =
    errors.length
      ? `
        <ul>

          ${errors.map(
            e =>
              `<li>${escapeHtml(e)}</li>`
          ).join("")}

        </ul>
      `
      : "";
}

function flashMessage(message) {

  const el =
    document.getElementById(
      "flashMessage"
    );

  if (!el) return;

  el.textContent = message;

  el.classList.add("show");

  clearTimeout(
    flashMessage.timer
  );

  flashMessage.timer =
    setTimeout(
      () => el.classList.remove("show"),
      2200
    );
}

function fileToDataURL(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        () => resolve(reader.result);

      reader.onerror =
        () => reject(
          new Error(
            "Image پڑھنے میں ناکامی ہوئی۔"
          )
        );

      reader.readAsDataURL(file);
    }
  );
}

function isImageFile(file) {

  return Boolean(
    file &&
    typeof file.type === "string" &&
    file.type.startsWith("image/")
  );
}
