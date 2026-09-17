const ProductManager = {

  addProduct(client) {

    const product = createEmptyProduct();

    client.products.push(product);

    return product;
  },

  getProduct(client, id) {

    return client.products.find(
      p => p.id === id
    ) || null;
  },

  updateProduct(client, id, fields) {

    const product = this.getProduct(client, id);

    if (!product) {
      throw new Error("Product نہیں ملا۔");
    }

    Object.assign(product, fields);

    return product;
  },

  deleteProduct(client, id) {

    client.products = client.products.filter(
      p => p.id !== id
    );
  },

  addVariant(client, productId) {

    const product = this.getProduct(client, productId);

    if (!product) {
      throw new Error("Product نہیں ملا۔");
    }

    const variant = createEmptyVariant();

    product.variants.push(variant);

    return variant;
  },

  getVariant(client, productId, variantId) {

    const product = this.getProduct(client, productId);

    if (!product) return null;

    return product.variants.find(
      v => v.id === variantId
    ) || null;
  },

  updateVariant(client, productId, variantId, fields) {

    const variant = this.getVariant(
      client,
      productId,
      variantId
    );

    if (!variant) {
      throw new Error("Variant نہیں ملا۔");
    }

    if ("stock" in fields) {

      const stock = Number(fields.stock);

      fields.stock =
        Number.isFinite(stock) && stock >= 0
          ? Math.floor(stock)
          : 0;
    }

    Object.assign(variant, fields);

    return variant;
  },

  deleteVariant(client, productId, variantId) {

    const product = this.getProduct(client, productId);

    if (!product) {
      throw new Error("Product نہیں ملا۔");
    }

    product.variants = product.variants.filter(
      v => v.id !== variantId
    );
  },

  wouldBeDuplicate(
    product,
    size,
    color,
    excludeVariantId = null
  ) {

    const wantedSize = String(size || "")
      .trim()
      .toLowerCase();

    const wantedColor = String(color || "")
      .trim()
      .toLowerCase();

    return product.variants.some(v => {

      return (
        v.id !== excludeVariantId &&
        String(v.size || "").trim().toLowerCase() === wantedSize &&
        String(v.color || "").trim().toLowerCase() === wantedColor
      );
    });
  },

  addCategory(client, name) {

    const clean = String(name || "").trim();

    if (!clean) {
      throw new Error("Category name ضروری ہے۔");
    }

    const duplicate = client.categories.some(
      c =>
        String(c.name || "")
          .trim()
          .toLowerCase() === clean.toLowerCase()
    );

    if (duplicate) {
      throw new Error("یہ Category پہلے سے موجود ہے۔");
    }

    const category = {
      id: generateId("cat"),
      name: clean
    };

    client.categories.push(category);

    return category;
  },

  deleteCategory(client, categoryId) {

    client.categories = client.categories.filter(
      c => c.id !== categoryId
    );

    client.products.forEach(product => {

      if (product.categoryId === categoryId) {
        product.categoryId = "";
      }
    });
  }
};

window.ProductManager = ProductManager;
