class Player {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type; // "batter" 또는 "pitcher"
        this.stats = stats;
    }
}

function createBatter(name, { contact = 50, power = 50 } = {}) {
    return new Player(name, "batter", { contact, power });
}

function createPitcher(name, { control = 50, stuff = 50 } = {}) {
    return new Player(name, "pitcher", { control, stuff });
}