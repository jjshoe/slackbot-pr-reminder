module.exports = Reminders;

function Reminders(bot) {
  this._bot = bot;
  this._config = this._bot._config;
  this._later = require('later');
  this.setupReminders();
};

// Set up the reminders to remind folks 
Reminders.prototype.setupReminders = function() {
  var reminders = this._config.get('reminders');

  for (i = 0; i < reminders.length; i++) {
    var reminder = reminders[i];

    var composite = [];

    if (this._config.has('debug')) {
      var d = new Date();
      var h = d.getUTCHours();
      var m = d.getUTCMinutes();
  
      reminder.times.push({hour: h, minute: m + 1});
    }

    for (x = 0; x < reminder.times.length; x++) {
      var time = reminder.times[x];

      composite.push({h: [parseInt(time.hour)], m: [parseInt(time.minute)]})
    }

    var timer = this._later.setInterval(function () {
        this._bot.fetchPrs(reminder.channel, reminder.repo);
    }.bind(this), {schedules: composite});
  }
};

