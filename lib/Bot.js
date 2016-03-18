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
    messagePrs.call(self, channel, repository, this._prs);
  });
}

function messagePrs (channel, repository, prs) {
  prs.sort(function(a, b) {
    return b.elapsed - a.elapsed;
  });

  var messages = prs.map(function(element) {
    return element.message;
  });

  this._slackbotPrReminders.postMessageToChannel(channel, "Hey <!channel>, <http://www.github.com/" + repository + "|" + repository + "> has " + prs.length + " pull requests waiting for review\n" + messages.join("\n"));
}
