var clientInfo = require('./config/clientinfo.json');
var config = require('./config/config.json');
var morgan = require('morgan');
var User = require('./app/user');
var dbTools = require('./app/db-tools');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var express = require('express'), fs = require('fs'), app = express(), response = {};
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport'),
MixerStrategy = require('passport-mixer').Strategy;
var request = require('request');
var SQLiteStore = require('connect-sqlite3')(session);

var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {
  key: privateKey,
  cert: certificate,
}

var mixerApi = "https://mixer.com/api/v1";

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.static(appDir+'/public'));
app.use(session({
  store: new SQLiteStore,
  secret: 'nonsensegibberish', 
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365
  }
}));
app.set('view engine', 'ejs');
app.set('views',appDir+"\/views");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new MixerStrategy({
    clientID: clientInfo.id,
    clientSecret: clientInfo.secret,
    callbackURL: "https://localhost/auth/mixer/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile.id, {"accessToken": accessToken, "refreshToken": refreshToken, "tokenDate": Date.now(), "_raw": profile._raw});
    // console.log(profile._raw);
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("Passport Deserialize");
  User.findById(id, function(err, user) {
    // console.log("USER: "+JSON.stringify(user));
    done(null, user);
  })
});

app.get('/auth/mixer', function(req, res) {
  dbTools.createUsersIfNotExists();
  res.redirect('/auth/mixer/redirect');
})

app.get('/auth/mixer/redirect',
  passport.authenticate('mixer', {scope: "channel:update:self+channel:analytics:self+user:analytics:self+user:details:self"}));

app.get('/auth/mixer/callback',
  passport.authenticate('mixer', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('Successful authentication, redirect to dash.')
    res.redirect('/dashboard');
  });

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/overlay');
  } else {
    res.redirect('/dashboard');
  }
});

app.get('/overlay', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('overlay/overlay', {user: req.user, isAuthenticated: true, config: config.remote});
  } else {
    res.redirect('/dashboard');
  }
});

app.get('/failed', (req, res) => {
  res.send(html);
});

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('dashboard', {user: req.user, isAuthenticated: true});
  } else {
    res.render('dashboard', {isAuthenticated: false});
  }
});

app.get('/remote', (req, res) => {
  res.render('remote', {config: config.remote});
});

app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/dashboard');
});

app.get('/favicon.ico', (req, res) => {
  res.status(404)        // HTTP status 404: NotFound
   .send('Not found');
});

server = https.createServer(credentials, app).listen(config.server.port, function(){
  console.log("Express HTTPS server listening on port " + config.server.port);
});

http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(config.server.http_port);
console.log("Express HTTP server listening on port " + config.server.http_port);

var WebSocketServer = require('websocket').server;

var wsHttpsServer = https.createServer(credentials, app).listen(config.remote.port, function() {
  console.log('WebSockets server spawned on port '+config.remote.port);
});

var wsRemotes = [];
var wsOverlays = [];
// create the server
wsServer = new WebSocketServer({
  httpServer: wsHttpsServer
});

// WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '
      + request.origin + '.');
  var connection = request.accept(null, request.origin);
  var index;
  var clientType;

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    console.log(message);
    // connection.send(message.utf8Data);
    message = JSON.parse(message.utf8Data);
    Client = message.Client;
    if (message.Client) {
      if (Client.intent == 'identify') {
        if (Client.type == "remote") {
          index = wsRemotes.push(connection) - 1;
          clientType = "remote";
          console.log("Remote connected.");
        } else if (Client.type == "overlay") {
          index = wsOverlays.push(connection) - 1;
          clientType = "overlay";
          console.log("Overlay connected.");
        }
      }

      if ((Client.intent == "action" && Client.type == "remote") || 
          (Client.intent=="tracker" && Client.type == "remote")) {
        var json = JSON.stringify({ type:'message', data: message });
        for (var i=0; i < wsOverlays.length; i++) {
          wsOverlays[i].sendUTF(json);
        }
      }
    }

  });

  connection.on('close', function(connection) {
    // close user connection
    if (clientType == "overlay") {
      wsOverlays.splice(index, 1);
    }
    if (clientType == "remote") {
      wsRemotes.splice(index, 1);
    }
    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });
});