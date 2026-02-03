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

    getAll() {
        const data = localStorage.getItem(this.#namaDatabase);

        try {
            return JSON.parse(data) || [];
        } catch {
            return []
        }
    }

    add(item) {
        const data = this.getAll();
        data.push({id: crypto.randomUUID(), ...item});
        this.#saveToLocal(data);
    }

    removeById(id) {
        const data = this.getAll().filter(item => item.id !== id);
        this.#saveToLocal(data);
    }

    updateById(id, updatedItem) {
        const data = this.getAll().map(item => item.id === id ? {...item, ...updatedItem} : item);
        this.#saveToLocal(data);
    }

    clear() {
        this.#saveToLocal([]);
    }
}