class Log {
    constructor() {
        this.messages = [];
    }

    add(message) {
        this.messages.push(message);
        console.log(message);
    }

    getAll() {
        return this.messages;
    }

    clear() {
        this.messages = [];
    }
}