/**
 * validation.js
 * Part 1 — Private Editor Foundation
 *
 * تمام validation rules یہاں مرکوز ہیں تاکہ Editor میں غلط data
 * (خراب WhatsApp نمبر، منفی قیمت/stock، duplicate variant وغیرہ) save نہ ہو۔
 */

const Validation = {

  /**
   * WhatsApp/Phone number کو صرف country code + digits کی صورت میں verify کرتا ہے۔
   * مثال درست: 923001234567  |  غلط: +92 300 123 4567 یا خالی
   */
  isValidWhatsAppNumber(number) {
    if (!number) return false;
    const cleaned = String(number).trim();
    return /^[1-9][0-9]{7,14}$/.test(cleaned);
  },

  /** عام فون نمبر کے لیے قدرے نرم rule (spaces/dashes قبول) */
  isValidPhoneNumber(number) {
    if (!number) return false;
    return /^[0-9+\-\s()]{7,20}$/.test(String(number).trim());
  },

  isValidUrl(url) {
    if (!url) return true; // خالی ہونا اکثر optional فیلڈز میں قابل قبول ہے
    try {
      new URL(url);
      return true;
    } catch {
      // relative/local path (مثلاً uploaded image data URL) بھی قبول کریں
      return url.startsWith("data:image") || url.startsWith("./") || url.startsWith("/");
    }
  },

  isValidPrice(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },

  isValidStock(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  },

  isNonEmptyText(value, minLength = 1) {
    return typeof value === "string" && value.trim().length >= minLength;
  },

  /**
   * ایک Product کے تمام variants میں duplicate Size+Color combination چیک کرتا ہے۔
   * واپسی: duplicate ملنے پر true index کا index array، ورنہ خالی array۔
   */
  findDuplicateVariants(variants) {
    const seen = new Map();
    const duplicateIndexes = [];
    variants.forEach((v, idx) => {
      const key = `${v.size.trim().toLowerCase()}__${v.color.trim().toLowerCase()}`;
      if (seen.has(key)) {
        duplicateIndexes.push(idx);
      } else {
        seen.set(key, idx);
      }
    });
    return duplicateIndexes;
  },

  /**
   * مکمل Product object کو validate کرتا ہے۔
   * واپسی: { valid: boolean, errors: string[] }
   */
  validateProduct(product) {
    const errors = [];

    if (!this.isNonEmptyText(product.name, 2)) {
      errors.push("Product name کم از کم 2 حروف کا ہونا چاہیے۔");
    }
    if (!this.isValidPrice(product.price)) {
      errors.push("Price ایک valid, غیر منفی نمبر ہونا چاہیے۔");
    }
    if (product.oldPrice && !this.isValidPrice(product.oldPrice)) {
      errors.push("Old Price ایک valid, غیر منفی نمبر ہونا چاہیے۔");
    }
    if (product.oldPrice && Number(product.oldPrice) > 0 && Number(product.oldPrice) <= Number(product.price)) {
      errors.push("Old Price، Price سے زیادہ ہونی چاہیے (ورنہ discount ظاہر نہیں ہوگا)۔");
    }
    if (!product.variants || product.variants.length === 0) {
      errors.push("کم از کم ایک Size/Color variant شامل کریں۔");
    } else {
      product.variants.forEach((v, i) => {
        if (!this.isNonEmptyText(v.size)) errors.push(`Variant #${i + 1}: Size خالی نہیں ہو سکتا۔`);
        if (!this.isNonEmptyText(v.color)) errors.push(`Variant #${i + 1}: Color خالی نہیں ہو سکتا۔`);
        if (!this.isValidStock(v.stock)) errors.push(`Variant #${i + 1}: Stock ایک غیر منفی پورا نمبر ہونا چاہیے۔`);
      });
      const dupes = this.findDuplicateVariants(product.variants);
      if (dupes.length > 0) {
        errors.push("ایک جیسا Size+Color combination دو بار موجود ہے، براہ کرم ہر combination صرف ایک بار رکھیں۔");
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Store کی بنیادی معلومات (Contact/Store Info tab) کو validate کرتا ہے۔
   */
  validateStoreInfo(store, contact) {
    const errors = [];
    if (!this.isNonEmptyText(store.storeName, 2)) {
      errors.push("Store Name درکار ہے (کم از کم 2 حروف)۔");
    }
    if (!this.isValidWhatsAppNumber(contact.whatsappNumber)) {
      errors.push("WhatsApp Number درست فارمیٹ میں نہیں۔ مثال: 923001234567 (بغیر + یا اسپیس کے)۔");
    }
    if (contact.phoneNumber && !this.isValidPhoneNumber(contact.phoneNumber)) {
      errors.push("Phone Number کا فارمیٹ درست نہیں۔");
    }
    if (!this.isValidUrl(contact.facebookUrl)) errors.push("Facebook URL درست نہیں۔");
    if (!this.isValidUrl(contact.instagramUrl)) errors.push("Instagram URL درست نہیں۔");
    return { valid: errors.length === 0, errors };
  }
};

window.Validation = Validation;
