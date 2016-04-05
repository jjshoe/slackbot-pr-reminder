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

  this._repository.prs({page: page, per_page: 100, state: 'all'}, function(err, data, headers) {
    if (err != null) {
      // XXX TODO FIXME Throw an exception here
      console.log("error: " + err);
    }
    else {
      for (var x = 0; x < data.length; x++) {
        this._prs.push(data[x]);
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

Prs.prototype.getOpenPrs = function() {
  return getPrsByState.call(this, 'open');
}

Prs.prototype.getClosedPrs = function() {
  return getPrsByState.call(this, 'closed');
}

function getPrsByState(state) {
  var prs = [];

  for (var x = 0; x < this._prs.length; x++) {
    var pr = this._prs[x];

    if (pr.state == state) {
      prs.push(pr);
    }
  }

  return prs;
}
