var dbTools = require('./db-tools');
var clientInfo = require('../config/clientinfo.json');
var request = require('request');

var db;
var MIXER_TOKEN = "https://mixer.com/api/oauth/token";

const User = {
  findOrCreate: function(id, data, callback) {
    // id = INT
    // data = {accessToken: [TXT], refreshToken: [TXT], tokenDate: [TXT], _raw: [OBJ]}
    // callback = function

    // console.log("DATA: "+JSON.stringify(data._raw));

    dbTools.createUsersIfNotExists();
    db = dbTools.openDbReadWrite();
    let sql = `SELECT DISTINCT id name from users WHERE id = ` + id + `;`
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw (err)
      }
      console.log('ROWS FOUND: '+ rows.length);
      data.processed = JSON.stringify(data._raw).replace("'","''");
      if (rows.length > 0) {
        console.log("User found. Updating data...")
        db.run(`UPDATE users SET \
          accessToken = \"`+data.accessToken+`\",\
          refreshToken = \"`+data.refreshToken+`\",\
          tokenDate = \"`+data.tokenDate+`\",\
          profile = \'`+data.processed+`\'
          WHERE id = `+id+`;`);
        db.close();
      } else {
        console.log("No user found. Creating user with ID " + id + "...");
        db.run(`INSERT INTO users \
          (id, accessToken, refreshToken, tokenDate, profile)\
          VALUES (`+id+`,\"`+data.accessToken+`\",\"`+data.refreshToken+`\",\"`+data.tokenDate+`\",\'`+data.processed+`\');`);
        db.close();
      }
    })
    console.log('DB closed after storing new tokens, back to you, passport!')
    if (typeof(callback) == "function") {
      if (callback.length > 0) {
        return callback();
      }
    }
  },

  findById: function(id, callback) {
    var user = {};
    // Connect to local DB.
    dbTools.createUsersIfNotExists();
    let db = dbTools.openDbReadOnly();
    // Check tokens
    refreshRequired = this.checkTokens(id);
    if (refreshRequired) {
      this.refreshTokens(id);
    }
    this.refreshTokens(id);

    // Select the user with the appropriate ID.
    let sql = `SELECT * from users WHERE id = ` + id + `;`
    // Call the db and get the rows requested
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw (err)
      }
      // If we find the entry...
      if (rows.length == 1) {
        rows.forEach((row) => {
          // Parse the profile first, since it's a JSON object.
          row.profile = row.profile.replace("''","'");
          row.profile = JSON.parse(row.profile);
          // Pass the entire row to the user variable.
          db.close();
          console.log('DB closed, back to you, passport!')
          return callback(null, row);
        })
      }
    });
  },

  checkTokens: function(id) {
    let db = dbTools.openDbReadOnly();
    let sql = `SELECT tokenDate from users WHERE id = `+id+`;`

    db.all(sql, [], (err, rows) => {
      if (err) {
        throw (err)
      }
      // If we find the entry...
      if (rows.length == 1) {
        rows.forEach((row) => {
          rowDate = new Date(row.tokenDate);
          curTime = Date.now();
          diff = ((rowDate.getTime() - curTime) / 1000);
          diff /= (60 * 60);
          diff = Math.abs(diff);
          console.log("TOKEN AGE: "+diff);
          if (diff >= 4) {
            console.log("Need to refresh the tokens!");
            db.close();
            return true;
          } else {
            console.log("No need to refresh the tokens!");
            db.close();
            return false;
          }
        });
      }
    });
  },

  refreshTokens: function(id) {
    let db = dbTools.openDbReadWrite();
    let sql = `SELECT * from users WHERE id = `+id+`;`

    db.all(sql, [], (err, rows) => {
      if (err) {
        throw (err)
      }
      // If we find the entry...
      if (rows.length == 1) {
        rows.forEach((row) => {
          var options = { method: 'POST',
          url: 'https://mixer.com/api/v1/oauth/token',
          formData: { 
            grant_type: 'refresh_token',
            refresh_token: row.refreshToken,
            client_id: clientInfo.id,
            client_secret: clientInfo.secret, 
          } 
        };
        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          let tokens = JSON.parse(body);

          db.run(`UPDATE users SET \
            accessToken = \"`+tokens.access_token+`\",\
            refreshToken = \"`+tokens.refresh_token+`\",\
            tokenDate = \"`+Date.now()+`\"\
            WHERE id = `+id+`;`);
          db.close();
        });
      });
      }
    });
  }
}

module.exports = User;