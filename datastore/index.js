const fs = require('fs');

let _data = { 'subscriptions': [] };
const _datastore_path = 'db.json';

module.exports = {
  async connectToDatastore() {
    fs.readFile(_datastore_path, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Create local datastore
          module.exports.commit();
        }
        else {
          throw err;
        }
      }
      else {
        _data = JSON.parse(data);
      }
    });
  },
  add({ channelId, githubProjectUrl, commit = true }) {
    const snapshot = module.exports.query({ channelId: channelId, githubProjectUrl: githubProjectUrl });
    if (snapshot.length === 0) {
      _data.subscriptions.push({ channelId: channelId, githubProjectUrl: githubProjectUrl.toLowerCase() });
      if (commit) {
        module.exports.commit();
      }
    }
    else {
      throw Error('Subscription entry already exists!');
    }
  },
  remove({ channelId, githubProjectUrl, commit = true }) {
    const index = _data.subscriptions.findIndex(subscription => subscription.channelId === channelId &&
      subscription.githubProjectUrl === githubProjectUrl.toLowerCase());
    if (index > -1) {
      _data.subscriptions.splice(index, 1);
      if (commit) {
        module.exports.commit();
      }
    }
    else {
      throw Error('Subscription entry does not exist');
    }
  },
  query({ channelId, githubProjectUrl }) {
    return _data.subscriptions.filter(subscription =>
      (channelId ? subscription.channelId === channelId : true) &&
      (githubProjectUrl ? subscription.githubProjectUrl === githubProjectUrl.toLowerCase() : true),
    );
  },
  commit() {
    fs.writeFileSync(_datastore_path, JSON.stringify(_data));
  },
};
