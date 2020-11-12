function Enum(...members) {
    if (!new.target) {
        return new Enum(...members);
    }

    for (const member of members) {
        this[member] = Symbol(member);
    }

    Object.freeze(this);
}

module.exports = Enum;