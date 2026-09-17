const StorageManager = {

  STORAGE_KEY: "master_editor_clients",
  ACTIVE_CLIENT_KEY: "master_editor_active_client",

  getAllClients() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);

      if (!raw) return {};

      const parsed = JSON.parse(raw);

      return parsed && typeof parsed === "object"
        ? parsed
        : {};

    } catch (error) {
      console.error("Client storage read error:", error);
      return {};
    }
  },

  saveAllClients(clients) {
    try {

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(clients)
      );

      return true;

    } catch (error) {

      if (error?.name === "QuotaExceededError") {
        throw new Error(
          "Browser storage بھر گئی ہے۔ بڑی images کم کریں یا کچھ clients حذف کریں۔"
        );
      }

      throw new Error(
        "Client data save نہیں ہو سکا: " + error.message
      );
    }
  },

  saveClient(clientData) {

    const normalized = normalizeClientData(clientData);

    if (!normalized.meta.clientId) {
      throw new Error("Client ID ضروری ہے۔");
    }

    const all = this.getAllClients();

    all[normalized.meta.clientId] = normalized;

    this.saveAllClients(all);

    this.setActiveClient(normalized.meta.clientId);

    return true;
  },

  loadClient(clientId) {

    const all = this.getAllClients();

    if (!all[clientId]) return null;

    return normalizeClientData(all[clientId]);
  },

  deleteClient(clientId) {

    const all = this.getAllClients();

    if (!all[clientId]) return false;

    delete all[clientId];

    this.saveAllClients(all);

    if (this.getActiveClientId() === clientId) {
      localStorage.removeItem(this.ACTIVE_CLIENT_KEY);
    }

    return true;
  },

  listClientIds() {
    return Object.keys(this.getAllClients());
  },

  setActiveClient(clientId) {

    if (clientId) {
      localStorage.setItem(
        this.ACTIVE_CLIENT_KEY,
        clientId
      );
    }
  },

  getActiveClientId() {

    return localStorage.getItem(
      this.ACTIVE_CLIENT_KEY
    );
  },

  exportClientAsJSON(clientData) {

    const normalized = normalizeClientData(clientData);

    const blob = new Blob(
      [JSON.stringify(normalized, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    const safeName = (
      normalized.store.storeName ||
      normalized.meta.clientId ||
      "client"
    )
      .replace(/[^\w\u0600-\u06FF-]+/g, "-")
      .replace(/-+/g, "-");

    a.href = url;

    a.download = `${safeName}-data.json`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
  },

  importClientFromJSONFile(file) {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = e => {

        try {

          const parsed = JSON.parse(e.target.result);

          if (
            !parsed ||
            typeof parsed !== "object" ||
            !parsed.meta ||
            !parsed.store
          ) {
            throw new Error(
              "یہ درست Client JSON فائل نہیں ہے۔"
            );
          }

          resolve(normalizeClientData(parsed));

        } catch (error) {

          reject(
            new Error(
              "JSON import ناکام: " + error.message
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("فائل پڑھنے میں ناکامی ہوئی۔"));
      };

      reader.readAsText(file);
    });
  }
};

window.StorageManager = StorageManager;
