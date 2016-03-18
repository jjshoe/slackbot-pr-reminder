module.exports = Prs;

function Prs(config, repository, callback) {
  this._config = config;

  var Github = require('octonode');
  this._github = Github.client(this._config.get('github_api_token'));
  this._repository = this._github.repo(repository);

  this._callback = callback;

  this._prs = [];

  this.getPrs();
};

// Validate the config file (poorly)
Prs.prototype.getPrs = function(page) {
  if (typeof page === 'undefined') {
    page = 1;
  }

  this._repository.prs({page: page, per_page: 100}, function(err, data, headers) {
    if (err != null) {
      // XXX TODO FIXME Throw an exception here
      console.log("error: " + err);
    }
    else {
      var currentDate = new Date();

      for (var x = 0; x < data.length; x++) {
        var pr = data[x];

        var createdAt = new Date(pr.created_at);
        var dateDifference = new Date(currentDate - createdAt);
        var daysElapsed = dateDifference.getUTCDate() - 1;

        this._prs.push({elapsed: daysElapsed, message: '<' + pr.url + '|' + daysElapsed + ' days old  - ' + pr.title + ' - PR #' + pr.number + '>'});
      }

      if (headers.link && headers.link.match(/next/) != null) {
        page += 1;
        this.getPrs(page);
      }
      else if (this._prs.length >= 1) {
        this._callback.call(this);
      }
    }
  }.bind(this));
}

