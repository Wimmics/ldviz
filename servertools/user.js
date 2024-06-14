const fs = require('fs');
const path = require('path');

class Users{
    constructor() {
        this.users = []
        this.filename = path.join(__dirname, '../data/users.json')

        if (fs.existsSync(this.filename)) {
            let rawdata = fs.readFileSync(this.filename);
            this.users = JSON.parse(rawdata)
        }
    }

    async checkConnection (req) {
        if (!req.session.user) 
            return false
        return await this.get(req.session.user.email, req.session.user.password);
    }

    async get(email, password) {
        return this.users.find(user => user.email === email && user.password === password)
    }
}

module.exports = { Users: Users }