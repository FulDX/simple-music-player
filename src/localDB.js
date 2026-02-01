export default class localDB {
    #namaDatabase;
    constructor(namaDatabase) {
        this.#namaDatabase = namaDatabase;
        if (!localStorage.getItem(this.#namaDatabase)) {
            this.#saveToLocal([]);
        }
    }

    #saveToLocal(value) {
        localStorage.setItem(this.#namaDatabase, JSON.stringify(value));
    }

    getFromLocal() {
        const data = localStorage.getItem(this.#namaDatabase);
        return data ? JSON.parse(data) : [];
    }

    addToLocal(newItem) {
        const oldData = this.getFromLocal();
        oldData.push(newItem);
        this.#saveToLocal(oldData)
    }

    removeFromLocal(index) {
        const oldData = this.getFromLocal();
        if (index < 0 || index >= oldData.length) {
            console.error("Index is not valid");
            return;
        }
        oldData.splice(index, 1);
        this.#saveToLocal(oldData);
    }

    editFromLocal(index, updatedItem) {
        const oldData = this.getFromLocal();
        if (index < 0 || index >= oldData.length) {
            console.error("Index is not valid");
            return;
        }
        oldData[index] = updatedItem;
        this.#saveToLocal(oldData);
    }
}