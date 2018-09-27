// Spawn Carina
var SparrowCarina = {
  init: function(userId, accessToken) {
    var ca = new carina.Carina({isBot: true, queryString: { Authorization: "Bearer " + accessToken}}).open();
    
    // Subscribe to follow events
    ca.subscribe('channel:'+userId+':followed', function (data) {
      console.log("Follow event received, adding to queue...");
      // Follow-spam alert prevention.
      stayFollowed(data.user.username, data.following);

    });

    // Subscribe to hosted events.
    ca.subscribe('channel:'+userId+':hosted', function (data) {
      // If the hoster has no viewers, fallback to chat for the hosting alert.
      if (data.hoster.viewersCurrent != 0) {
        queue.push(new QueueEntry('host', {username: data.hoster.channel, viewers: data.hoster.viewersCurrent}));
      }

      // If the hoster has a handful of viewers, queue the hello alert!
      if (data.hoster.viewersCurrent > 5) {
        queue.push(new QueueEntry('hello'));
      }
    });

    // Subscribe to channel subscription events.
    ca.subscribe('channel:'+userId+':subscribed', function (data) {
      queue.push(new QueueEntry('sub', data.user.username));
    });
  }
}