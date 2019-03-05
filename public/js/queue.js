// Variable initialization
var timeSinceLastAnimation = 0, 
lastCheck = {}, 
queue = [];
function QueueEntry(type, content) {
  this.type = type;
  this.content = content;
};

// Animation library
// @TODO: Implement resubscribe events.
// @TODO: Implement directPurchase events
// @TODO: Restore donations.
var AnimLib = {
  follower: function(follower) {
    $('.js_follower_target').text(follower);
    follower = $('.js_follower_target').parents('.overlay').addClass('animating');
    window.setTimeout(function () {
      follower.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  subscriber: function(subscriber) {
    $('.js_subscriber_target').text(subscriber);
    sub = $('.js_subscriber_target').parents('.overlay').addClass('animating');
    window.setTimeout(function () {
      sub.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  host: function(host) {
    $('.js_host_target').text(host.username);
    $('.js_host_viewers').text(host.viewers);
    host = $('.js_host_target').parents('.overlay').addClass('animating');
    window.setTimeout(function () {
      host.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  // @TODO: Restore later once I sort out how donations work in future.
  // donation: function(donation) {
  //   $('.js_donation_target').text(donation.amount);
  //   $('.js_donation_donor_target').text(donation.donor);
  //   var donation = $('.js_donation_target').parents('.overlay').addClass('animating');
  //   window.setTimeout(function () {
  //     donation.removeClass('animating');
  //   }, 10000);
  //   timeSinceLastAnimation = 0;
  // },
}

var genericAnim = {
  discord: function() {
    var discord = $('.js_discord_target').addClass('animating');
    window.setTimeout(function () {
      discord.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  schedule: function() {
    var schedule = $('.js_schedule_target').addClass('animating');
    window.setTimeout(function () {
      schedule.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  hello: function() {
    var hello = $('.js_hello_target').addClass('animating');
    window.setTimeout(function () {
      hello.removeClass('animating');
    }, 15000);
    timeSinceLastAnimation = 0;
  },
  humble: function() {
    var hello = $('.js_humble_target').addClass('animating');
    window.setTimeout(function () {
      hello.removeClass('animating');
    }, 20000);
    timeSinceLastAnimation = -5;
  }
}

function discordQueue() {
  console.log('Discord queued!')
  queue.push(new QueueEntry('discord'));
}

function scheduleQueue() {
  console.log('Schedule queued!')
  queue.push(new QueueEntry('schedule'));
}

function helloQueue() {
  console.log('Hello queued!')
  queue.push(new QueueEntry('hello'));
}

function humbleQueue() {
  console.log('Humble queued!')
  queue.push(new QueueEntry('humble'));
}

function queueCheck() {
// we want anims on 15s intervals
if (timeSinceLastAnimation >= 14) {
  if (queue.length) {
    switch (queue[0].type) {
      case 'follow': 
        AnimLib.follower(queue[0].content);
        queue.splice(0,1);
        break;
      case 'sub':
        AnimLib.subscriber(queue[0].content);
        queue.splice(0,1);
        break;
      case 'host':
        AnimLib.host(queue[0].content);
        queue.splice(0,1);
        break;
      case 'cheer':
        AnimLib.cheer(queue[0].content);
        queue.splice(0,1);
        break;
      case 'donation':
        AnimLib.donation(queue[0].content);
        queue.splice(0,1);
        break;
      case 'discord':
        genericAnim.discord();
        queue.splice(0,1);
        break;
      case 'schedule':
        genericAnim.schedule();
        queue.splice(0,1);
        break;
      case 'hello':
        genericAnim.hello();
        queue.splice(0,1);
        break;
      case 'humble':
        genericAnim.humble();
        queue.splice(0,1);
        break;
    }
  }
}
}

function timer() {
  timeSinceLastAnimation++;
}

window.setInterval(timer, 1000)
window.setInterval(queueCheck, 5000);

var loopedItems = [helloQueue, discordQueue, humbleQueue];
var loopInterval = 5; // minute(s)
var loopTimer = loopInterval * 60 * 1000;

// 5 * 60 * 1000
for (var x = 0; x < loopedItems.length; x++) {
  createTimeout(loopedItems[x], x);
}

function createTimeout(callback, y) {
  window.setTimeout(function() {
    console.log('Started ' + callback + ' looping');
    callback();
    window.setInterval(callback, ((loopInterval * loopedItems.length) * 60 * 1000));
  }, (loopTimer * (y + 1)));
}

var followerQueue = [];
var stayFollowed = function(username, following) {
  // If the queue has something...
  if (followerQueue.length > 0) {
    // If we got an unfollow event...
    if (!following) {
      // Boot them from the queue.
      console.log("Got an unfollow event.")
      if (followerQueue.indexOf(username) != -1) {
        followerQueue.splice(followerQueue.indexOf(username));
      }
    }
  // Otherwise...
  } else {
    // Make sure we have a follow event.
    if (following) {
      // Spawn a timer.
      followerQueue.push(username)

      var followTimer = 0;
      var checker = window.setInterval(function() {
        var followerRemained = followerCheck(username);
        if (followerRemained == false) {
          followerQueue.splice(followerQueue.indexOf(username));
          window.clearInterval(checker);
        } else {
          followTimer++;
          console.log(username + ": " + followTimer);

          if (followTimer >= 30) {
            console.log("Pushing alert for confirmed follower.");

            queue.push(new QueueEntry('follow', username));
            followerQueue.splice(followerQueue.indexOf(username));
            window.clearInterval(checker);
          }
        }
      },1000);
    }
  }
}

var followerCheck = function(username) {
  if (followerQueue.indexOf(username) > -1) {
    return true;
  } else {
    return false;
  }
}
