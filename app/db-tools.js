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

  createUsersIfNotExists: function() {
    let db = new sqlite3.Database('./sqlite/mixer.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Checking for the existence of the users table.');
      let sql = "CREATE TABLE IF NOT EXISTS 'users' (`id` NUMERIC, `accessToken` TEXT, `refreshToken` TEXT, `tokenDate` INTEGER, `profile` BLOB, PRIMARY KEY(`id`) );"
      db.run(sql);

      db.close();
    });
  },
}

module.exports = dbTools;