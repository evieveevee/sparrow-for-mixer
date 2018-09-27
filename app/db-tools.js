const sqlite3 = require('sqlite3').verbose();

var dbTools = {
  openDbReadWrite: function() {
    let db = new sqlite3.Database('./sqlite/mixer.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }); 
    return db;
  },
  openDbReadOnly: function() {
    let db = new sqlite3.Database('./sqlite/mixer.db', sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }); 
    return db;
  },
}

module.exports = dbTools;