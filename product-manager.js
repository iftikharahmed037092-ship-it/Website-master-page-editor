/**
 * product-manager.js
 * Part 1 — Private Editor Foundation
 *
 * موجودہ client data (EditorState.currentClient) کے اندر products اور
 * ان کے size/color variants کو add/update/delete کرنے کی منطق۔
 */

const ProductManager = {

  addProduct(clientData) {
    const product = createEmptyProduct();
    clientData.products.push(product);
    return product;
  },

  getProduct(clientData, productId) {
    return clientData.products.find(p => p.id === productId) || null;
  },

  updateProduct(clientData, productId, fields) {
    const product = this.getProduct(clientData, productId);
    if (!product) throw new Error("Product نہیں ملا۔");
    Object.assign(product, fields);
    return product;
  },

  deleteProduct(clientData, productId) {
    clientData.products = clientData.products.filter(p => p.id !== productId);
  },

  addVariant(clientData, productId) {
    const product = this.getProduct(clientData, productId);
    if (!product) throw new Error("Product نہیں ملا۔");
    const variant = createEmptyVariant();
    product.variants.push(variant);
    return variant;
  },

  updateVariant(clientData, productId, variantId, fields) {
    const product = this.getProduct(clientData, productId);
    if (!product) throw new Error("Product نہیں ملا۔");
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new Error("Variant نہیں ملا۔");

    // Stock کبھی منفی نہ ہو
    if ("stock" in fields) {
      const num = Number(fields.stock);
      fields.stock = isNaN(num) || num < 0 ? 0 : Math.floor(num);
    }
    Object.assign(variant, fields);
    return variant;
  },

  deleteVariant(clientData, productId, variantId) {
    const product = this.getProduct(clientData, productId);
    if (!product) throw new Error("Product نہیں ملا۔");
    product.variants = product.variants.filter(v => v.id !== variantId);
  },

  /** نئی variant شامل کرنے سے پہلے duplicate size+color چیک کرتا ہے۔ */
  wouldBeDuplicate(product, size, color, excludeVariantId = null) {
    return product.variants.some(v =>
      v.id !== excludeVariantId &&
      v.size.trim().toLowerCase() === size.trim().toLowerCase() &&
      v.color.trim().toLowerCase() === color.trim().toLowerCase()
    );
  },

  addCategory(clientData, name) {
    const category = { id: generateId("cat"), name };
    clientData.categories.push(category);
    return category;
  },

  deleteCategory(clientData, categoryId) {
    clientData.categories = clientData.categories.filter(c => c.id !== categoryId);
    // اس category والے products کو "Uncategorized" کر دیں
    clientData.products.forEach(p => {
      if (p.categoryId === categoryId) p.categoryId = "";
    });
  }
};

window.ProductManager = ProductManager;
