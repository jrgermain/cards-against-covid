function Enum(...members) {
    if (!new.target) {
        return new Enum(...members);
    }

    members.forEach((member) => {
        this[member] = Symbol(member);
    });

    Object.freeze(this);
}

module.exports = Enum;
