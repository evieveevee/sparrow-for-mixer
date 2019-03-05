 var SparrowRemote = { 
  init: function(config) {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('wss://'+config.host+':'+config.port);

    connection.onopen = function () {
      // connection is opened and ready to use
      var clientInfo = {
        Client: {
          intent: 'identify',
          type: 'overlay',
        }
      }
      connection.send(JSON.stringify(clientInfo));
      console.log("Connection Established")
    };

    connection.onerror = function (error) {
      // an error occurred when sending/receiving data
      console.log("An error occured! The error was '"+error+"'");
    };

    connection.onmessage = function (message) {
      console.log(message);
      message = JSON.parse(message.data);
      var intent = message.data.Client.intent;
      console.log("Intent: "+intent);

      if (intent == "action") {
        var action = message.data.Action.type;
        switch (action) {
          case 'hello':
            helloQueue();
            break;
          case 'kofi':
            kofiQueue();
            break;
          case 'discord':
            discordQueue();
            break;
          case 'humble':
            humbleQueue();
            break;
        }
      } else if (intent == "tracker") {
        console.log("Tracker.")
        var tracker = JSON.stringify(message.data.Tracker);
        console.log(tracker);
        queue.push(new QueueEntry('tracker', tracker));
      }
    }
  }
}
