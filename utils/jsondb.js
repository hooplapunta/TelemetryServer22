const path = require('path');
const fs = require('fs');
const JSONdb = require('simple-json-db');

class JSONDB {
    db;

    constructor(room, callback) {
        console.log(`Initializing room: ` + room.name);
        // *Note: We want to create a new DB for each room and reset when done
        let dbPath = path.join(path.resolve('./'), 'db', room.name);
        this.db = new JSONdb( dbPath );
        
        // Checks for DB file, creates if it does not exist.
        try {
            fs.stat(dbPath, (err, exists) => {
                if(err) {
                    this.db.sync();
                }
                return { ok: true };
            });
        } catch(ex) {
            return { ok: false, msg: ex };
        }
    }

    testWrite() {
        this.db.set('test', 'A test value');
    }

    write(key, value) {
        this.db.set(key, value);
    }

    get(key) {
        return this.db.get(key);
    }

    has(key) {
        return this.db.has(key);
    }

    dump() {
        return this.db.JSON();
    }
}

module.exports = JSONDB;