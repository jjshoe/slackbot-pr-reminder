var config = require('config');
var later = require('later');
var SlackBot = require('slackbots');

// Make sure we have a valid config
validateConfig();

// Use the defaults in spots where they weren't specified
propogateReminderDefaults();

// Get the bot connected to slack
var bot = connectBot();

// Start checking to see if we should shoot a reminder every 45 seconds
setupReminders(bot);

function setupReminders(bot) {
  var reminders = config.get('reminders');
 
  for (i = 0; i < reminders.length; i++) {
    var reminder = reminders[i];

    var composite = [];

    for (x = 0; x < reminder.times.length; x++) {
      var [jobHour, jobMinute] = reminder.times[x].split(':');

      composite.push({h: [parseInt(jobHour)], m: [parseInt(jobMinute)]})
    }

    var timer = later.setInterval(test, {schedules: composite});
  }

var d = new Date();
var h = d.getUTCHours();
var m = d.getUTCMinutes();

console.log('current: %s:%s', h, m);
}

function test() {
  console.log('test');
}

function propogateReminderDefaults() {
  var reminders = config.get('reminders');

  // Fill in defaults for anything we don't have
  for (i = 0; i < reminders.length; i++) {
    var reminder = reminders[i];

    if (!reminder['channel']) {
      reminder['channel'] = config.get('default_channel');
    }

    if (!reminder['times'] || reminder['times'].length <= 0) {
      reminder['times'] = config.get('default_times');
    }
  }
}

function connectBot() {
  // We've already verified the config options exist
 bot = new SlackBot({
    name: config.get('bot_name'),
    token: config.get('slack_api_token')
  });
}

function validateConfig() {
  var errors = [];

  var validateOptions = ['bot_name', 'slack_api_token', 'default_channel', 'default_times', 'reminders'];

  for (i = 0; i < validateOptions.length; i++) {
    var validateOption = validateOptions[i];

    if (!config.has(validateOption)) {
      errors.push("You must define '" + validateOption + "' in your config file");
    }
  }

  if (errors.length >= 1) {
    for (i = 0; i < errors.length; i++) {
      console.log(errors[i]);
    }

    process.exit(1)
  }
}
