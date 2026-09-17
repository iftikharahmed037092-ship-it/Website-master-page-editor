/**
 * storage-manager.js
 * Part 1 — Private Editor Foundation
 *
 * ذمہ داری: Client data کو Editor کے browser (localStorage) میں save/load کرنا،
 * ایک سے زیادہ clients کی list رکھنا، اور JSON کی صورت میں export/import کرنا۔
 * (Part 3 میں یہی data Generator کو ملے گا تاکہ حتمی website ZIP بنے۔)
 */

const StorageManager = {
  STORAGE_KEY: "master_editor_clients",
  ACTIVE_CLIENT_KEY: "master_editor_active_client",

  /** تمام محفوظ شدہ clients کی list (object: { clientId: clientData }) */
  getAllClients() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  },

  saveAllClients(clientsObj) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clientsObj));
  },

  /** ایک specific client کا data محفوظ کرتا ہے (create یا update) */
  saveClient(clientData) {
    if (!clientData.meta.clientId) {
      throw new Error("Client کو save کرنے سے پہلے clientId ضروری ہے۔");
    }
    const all = this.getAllClients();
    all[clientData.meta.clientId] = clientData;
    this.saveAllClients(all);
    this.setActiveClient(clientData.meta.clientId);
    return true;
  },

  loadClient(clientId) {
    const all = this.getAllClients();
    return all[clientId] || null;
  },

  deleteClient(clientId) {
    const all = this.getAllClients();
    delete all[clientId];
    this.saveAllClients(all);
  },

  listClientIds() {
    return Object.keys(this.getAllClients());
  },

  setActiveClient(clientId) {
    localStorage.setItem(this.ACTIVE_CLIENT_KEY, clientId);
  },

  getActiveClientId() {
    return localStorage.getItem(this.ACTIVE_CLIENT_KEY);
  },

  /** موجودہ client data کو .json فائل کی صورت میں download کرواتا ہے (backup/transfer کے لیے) */
  exportClientAsJSON(clientData) {
    const blob = new Blob([JSON.stringify(clientData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (clientData.store.storeName || clientData.meta.clientId || "client").replace(/\s+/g, "-");
    a.href = url;
    a.download = `${safeName}-data.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /** JSON فائل سے client data واپس import کرتا ہے۔ Promise واپس کرتا ہے۔ */
  importClientFromJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.meta || !data.store) {
            reject(new Error("یہ فائل درست client-data فارمیٹ میں نہیں ہے۔"));
            return;
          }
          resolve(data);
        } catch (err) {
          reject(new Error("JSON فائل پڑھنے میں مسئلہ ہوا: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("فائل پڑھنے میں ناکامی۔"));
      reader.readAsText(file);
    });
  }
};

window.StorageManager = StorageManager;
