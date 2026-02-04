export default class CustomDB {
  constructor(dbName, storeName, keyPath = "id") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.keyPath = keyPath;
    this.db = null;
  }

  async open(version = 1) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: this.keyPath,
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => reject(event.target.error);
    });
  }

  async add(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async clearAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async update(id, newData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const oldData = getReq.result;
        if (!oldData) return reject("Data not found");

        const updatedData = { ...oldData, ...newData, id };

        const putReq = store.put(updatedData);

        putReq.onsuccess = () => resolve(updatedData);
        putReq.onerror = (e) => reject(e.target.error);
      };

      getReq.onerror = (e) => reject(e.target.error);
    });
  }
}
