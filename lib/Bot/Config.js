module.exports = Config;

function Config() {
  this._config = require('config');
  this._validateOptions = ['bot_name', 'slack_api_token', 'default_channel', 'default_times', 'reminders', 'github_api_token'];
  this._errors = [];

  this.validate();
  this.propogateDefaults();

  return this._config;
};

// Validate the config file (poorly)
Config.prototype.validate = function() {
  for (i = 0; i < this._validateOptions.length; i++) {
    var validateOption = this._validateOptions[i];

    if (!this._config.has(validateOption)) {
      this._errors.push("You must define '" + validateOption + "' in your config file");
    }
  }

  if (this._errors.length >= 1) {
    // Throw an error here 
  }
};

// Fill in defaults for anything we don't have
Config.prototype.propogateDefaults = function() {
  var reminders = this._config.get('reminders');

  for (i = 0; i < reminders.length; i++) {
    var reminder = reminders[i];

    if (!reminder['channel']) {
      reminder['channel'] = this._config.get('default_channel');
    }

    if (!reminder['times'] || reminder['times'].length <= 0) {
      reminder['times'] = this._config.get('default_times');
    }
  }
}
