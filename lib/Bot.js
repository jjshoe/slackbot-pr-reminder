module.exports = Bot;

function Bot() {
  var Config = require('./Bot/Config.js');
  this._config = new Config();

  var SlackBot = require('slackbots');
  this._slackbotPrReminders = new SlackBot({
    name:  this._config.get('bot_name'),
    token: this._config.get('slack_api_token')
  });

  var Reminders = require('./Bot/Reminders.js');
  this._reminders = new Reminders(this);

  this._Prs = require('./Prs.js');
};

Bot.prototype.fetchPrs = function(channel, repository) {
  var self = this;
  new this._Prs(this._config, repository, function () {
    prsReceived.call(self, channel, repository, this);
  });
}

function prsReceived(channel, repository, prs) {
  var openPrs = prs.getOpenPrs();
  var closedPrs = prs.getClosedPrs();

  var message = formatOpenPrs(repository, openPrs);

  message = message + "\n" + closedPrStats(closedPrs);

  this._slackbotPrReminders.postMessageToChannel(channel, message);
}

function formatOpenPrs(repository, prs) {
  var oneDay = 24*60*60*1000;
  var currentDate = new Date();
  var elapsedPrs = [];

  for (x = 0; x < prs.length; x++) {
    var pr = prs[x];

    var createdAt = new Date(pr.created_at);
    var daysElapsed = Math.round(Math.abs((currentDate.getTime() - createdAt.getTime())/(oneDay))); 

    elapsedPrs.push({elapsed: daysElapsed, message: '<' + pr.html_url + '|' + daysElapsed + ' days old  - ' + pr.title + ' - PR #' + pr.number + '>'});
  }

  elapsedPrs.sort(function(a, b) {
    return b.elapsed - a.elapsed;
  });

  var messages = elapsedPrs.map(function(element) {
    return element.message;
  });

  return "Hey <!channel>, <http://www.github.com/" + repository + "/pulls|" + repository + "> has " + prs.length + " pull requests waiting for review\n" + messages.join("\n");
}

function closedPrStats(prs) {
  var moment = require('moment');
  var prsByDays = {1: [], 7: [], 30: [], 365: []};
  var message = '';

  for (var days in prsByDays) {
    var daysAsTime = moment().subtract(days, 'days');

    for (x = 0; x < prs.length; x++) {
      var pr = prs[x];

      if (new Date(pr['closed_at']) >= daysAsTime) {
        prsByDays[days].push(Math.abs(new Date(pr['closed_at']) - new Date(pr['created_at'])));
      }
    }
  }

  for (var days in prsByDays) {
    var sum = 0;

    for (x = 0; x < prsByDays[days].length; x++) {
      var flightTime = prsByDays[days][x];

      sum += flightTime;
    } 
   
    if (prsByDays[days].length > 0) {
      var elapsedDays = Math.ceil(sum / prsByDays[days].length / 60 / 60 / 24 / 1000);

      message += "Average time to close a pr in the last " + dayText(days, "day", days + " days") + " is " + dayText(elapsedDays, "1 day", elapsedDays + " days") + "\n";
    }
  }

  return message;
}

function dayText(days, single, plural) {
  if (days == 1) {
    return single 
  }
  else {
    return plural;
  }
}
