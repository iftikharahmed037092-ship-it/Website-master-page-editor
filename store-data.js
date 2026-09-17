/**
 * store-data.js
 * Part 1 — Private Editor Foundation
 *
 * یہ فائل پورے سسٹم کا "Data Schema" ہے۔
 * ہر client کی معلومات اسی structure کے مطابق محفوظ ہوتی ہے۔
 * Storefront (Part 2) اور Generator (Part 3) دونوں اسی schema کو پڑھیں گے،
 * اس لیے اس structure کو تبدیل کرتے وقت احتیاط کریں۔
 */

const StoreDataSchema = {
  meta: {
    clientId: "",          // مثلاً "abc-garments"
    generatedAt: "",
    schemaVersion: "1.0"
  },

  store: {
    storeName: "",
    logoUrl: "",           // base64 یا external URL
    faviconUrl: "",
    primaryColor: "#1a1a1a",
    secondaryColor: "#d4a373",
    bannerImages: [],      // [{ url, caption, link }]
    aboutText: "",
    tagline: ""
  },

  contact: {
    whatsappNumber: "",    // بغیر + کے، صرف country code + number مثلاً "923001234567"
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

  categories: [
    // { id, name }
  ],

  products: [
    /*
    {
      id: "prod_001",
      name: "",
      description: "",
      price: 0,
      oldPrice: 0,
      categoryId: "",
      images: [],           // ["url1", "url2"]
      sizeGuide: "",         // measurement/instructions text
      variants: [
        // { id, size, color, stock }
      ]
    }
    */
  ]
};

/**
 * ایک بالکل خالی/نئی client کی object واپس کرتا ہے (deep copy)۔
 */
function createEmptyClientData() {
  return JSON.parse(JSON.stringify(StoreDataSchema));
}

/**
 * Unique ID generator — products, variants, categories, banners کے لیے۔
 */
function generateId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * ایک خالی/نیا Product object بناتا ہے۔
 */
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

/**
 * ایک خالی/نیا Variant (Size + Color + Stock) object بناتا ہے۔
 */
function createEmptyVariant() {
  return {
    id: generateId("var"),
    size: "",
    color: "",
    stock: 0
  };
}

// دوسری فائلوں (admin-editor.js, product-manager.js وغیرہ) میں استعمال کے لیے۔
window.StoreDataSchema = StoreDataSchema;
window.createEmptyClientData = createEmptyClientData;
window.createEmptyProduct = createEmptyProduct;
window.createEmptyVariant = createEmptyVariant;
window.generateId = generateId;
