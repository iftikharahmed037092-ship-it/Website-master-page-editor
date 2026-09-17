const Validation = {

  isValidWhatsAppNumber(number) {
    if (!number) return false;
    return /^[1-9][0-9]{7,14}$/.test(String(number).trim());
  },

  isValidPhoneNumber(number) {
    if (!number) return false;
    return /^[0-9+\-\s()]{7,20}$/.test(String(number).trim());
  },

  isValidUrl(url) {
    if (!url) return true;

    try {
      const parsed = new URL(String(url).trim());

      return parsed.protocol === "http:" ||
             parsed.protocol === "https:";

    } catch {
      return String(url).startsWith("data:image") ||
             String(url).startsWith("./") ||
             String(url).startsWith("/");
    }
  },

  isValidPrice(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0;
  },

  isValidStock(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 0;
  },

  isNonEmptyText(value, minLength = 1) {
    return typeof value === "string" &&
      value.trim().length >= minLength;
  },

  findDuplicateVariants(variants) {
    const seen = new Set();
    const duplicates = [];

    (variants || []).forEach((v, index) => {

      const size = String(v?.size || "").trim().toLowerCase();
      const color = String(v?.color || "").trim().toLowerCase();

      const key = `${size}__${color}`;

      if (seen.has(key)) {
        duplicates.push(index);
      } else {
        seen.add(key);
      }
    });

    return duplicates;
  },

  validateProduct(product) {
    const errors = [];

    if (!this.isNonEmptyText(product.name, 2)) {
      errors.push("Product name کم از کم 2 حروف کا ہونا چاہیے۔");
    }

    if (!this.isValidPrice(product.price)) {
      errors.push("Price درست اور غیر منفی نمبر ہونا چاہیے۔");
    }

    if (product.oldPrice &&
        (!this.isValidPrice(product.oldPrice))) {
      errors.push("Old Price درست نمبر ہونا چاہیے۔");
    }

    if (Number(product.oldPrice) > 0 &&
        Number(product.oldPrice) <= Number(product.price)) {
      errors.push("Old Price، Price سے زیادہ ہونی چاہیے۔");
    }

    /*
     * Variant optional رکھا گیا ہے تاکہ Garments کے ساتھ
     * Watches, Accessories, Electronics وغیرہ بھی support ہوں۔
     */

    if (!Array.isArray(product.variants)) {
      errors.push("Variants data درست نہیں ہے۔");
    } else {

      product.variants.forEach((v, i) => {

        const hasSize = String(v.size || "").trim();
        const hasColor = String(v.color || "").trim();

        if (!hasSize && !hasColor) {
          errors.push(
            `Variant #${i + 1}: Size یا Color میں کم از کم ایک درج کریں۔`
          );
        }

        if (!this.isValidStock(v.stock)) {
          errors.push(
            `Variant #${i + 1}: Stock غیر منفی پورا نمبر ہونا چاہیے۔`
          );
        }
      });

      if (this.findDuplicateVariants(product.variants).length) {
        errors.push(
          "ایک جیسا Size + Color combination ایک سے زیادہ بار موجود ہے۔"
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  validateStoreInfo(store, contact) {
    const errors = [];

    if (!this.isNonEmptyText(store.storeName, 2)) {
      errors.push("Store Name کم از کم 2 حروف کا ہونا چاہیے۔");
    }

    if (!this.isValidWhatsAppNumber(contact.whatsappNumber)) {
      errors.push(
        "WhatsApp Number درست فارمیٹ میں درج کریں، مثلاً 923001234567۔"
      );
    }

    if (
      contact.phoneNumber &&
      !this.isValidPhoneNumber(contact.phoneNumber)
    ) {
      errors.push("Phone Number کا فارمیٹ درست نہیں۔");
    }

    if (!this.isValidUrl(contact.facebookUrl)) {
      errors.push("Facebook URL درست نہیں۔");
    }

    if (!this.isValidUrl(contact.instagramUrl)) {
      errors.push("Instagram URL درست نہیں۔");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

window.Validation = Validation;
