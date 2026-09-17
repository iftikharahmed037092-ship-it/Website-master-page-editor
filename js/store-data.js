/**
 * Part 1 — Master E-commerce Editor
 * Central data schema.
 */
const StoreDataSchema = {
  meta: {
    clientId: "",
    generatedAt: "",
    schemaVersion: "1.1"
  },

  store: {
    storeName: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#16a34a",
    secondaryColor: "#0ea5e9",
    bannerImages: [],
    aboutText: "",
    tagline: ""
  },

  contact: {
    whatsappNumber: "",
    phoneNumber: "",
    address: "",
    city: "",
    facebookUrl: "",
    instagramUrl: ""
  },

  policies: {
    shippingPolicy: "",
    returnPolicy: "",
    privacyPolicy: "",
    termsAndConditions: ""
  },

  categories: [],
  products: []
};

function generateId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyProduct() {
  return {
    id: generateId("prod"),
    name: "",
    description: "",
    price: 0,
    oldPrice: 0,
    categoryId: "",
    images: [],
    sizeGuide: "",
    variants: []
  };
}

function createEmptyVariant() {
  return {
    id: generateId("var"),
    size: "",
    color: "",
    stock: 0
  };
}

function createEmptyClientData() {
  const data = JSON.parse(JSON.stringify(StoreDataSchema));
  data.meta.clientId = generateId("client");
  return data;
}

/**
 * Imported/old client data کو current schema کے مطابق normalize کرتا ہے۔
 */
function normalizeClientData(input) {
  const base = createEmptyClientData();

  if (!input || typeof input !== "object") {
    return base;
  }

  base.meta = {
    ...base.meta,
    ...(input.meta || {})
  };

  base.store = {
    ...base.store,
    ...(input.store || {})
  };

  base.contact = {
    ...base.contact,
    ...(input.contact || {})
  };

  base.policies = {
    ...base.policies,
    ...(input.policies || {})
  };

  base.categories = Array.isArray(input.categories)
    ? input.categories
        .filter(c => c && typeof c === "object")
        .map(c => ({
          id: String(c.id || generateId("cat")),
          name: String(c.name || "").trim()
        }))
        .filter(c => c.name)
    : [];

  base.products = Array.isArray(input.products)
    ? input.products
        .filter(p => p && typeof p === "object")
        .map(p => ({
          id: String(p.id || generateId("prod")),
          name: String(p.name || ""),
          description: String(p.description || ""),
          price: Number(p.price) >= 0 ? Number(p.price) : 0,
          oldPrice: Number(p.oldPrice) >= 0 ? Number(p.oldPrice) : 0,
          categoryId: String(p.categoryId || ""),
          images: Array.isArray(p.images)
            ? p.images.filter(Boolean).map(String)
            : [],
          sizeGuide: String(p.sizeGuide || ""),
          variants: Array.isArray(p.variants)
            ? p.variants.map(v => ({
                id: String(v.id || generateId("var")),
                size: String(v.size || ""),
                color: String(v.color || ""),
                stock: Number.isInteger(Number(v.stock)) && Number(v.stock) >= 0
                  ? Math.floor(Number(v.stock))
                  : 0
              }))
            : []
        }))
    : [];

  if (!Array.isArray(base.store.bannerImages)) {
    base.store.bannerImages = [];
  }

  base.store.bannerImages = base.store.bannerImages
    .filter(Boolean)
    .map(b => ({
      url: String(b.url || ""),
      caption: String(b.caption || ""),
      link: String(b.link || "")
    }))
    .filter(b => b.url);

  return base;
}

window.StoreDataSchema = StoreDataSchema;
window.generateId = generateId;
window.createEmptyProduct = createEmptyProduct;
window.createEmptyVariant = createEmptyVariant;
window.createEmptyClientData = createEmptyClientData;
window.normalizeClientData = normalizeClientData;
