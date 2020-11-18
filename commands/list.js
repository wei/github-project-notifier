const { query } = require('../datastore');

module.exports = {
  name: 'list',
  aliases: ['ls'],
  description: 'List subscribed GitHub project boards',
  async execute(message) {
    const channelId = message.channel.id;

    const subscriptions = query({ channelId: channelId });

    if (subscriptions.length === 0) {
      message.channel.send('There are no subscribed projects for this channel. Please use `sub` command to subscribe first!');
    }
    else {
      message.channel.send(`GitHub Project boards subscribed: ${
        subscriptions.map(subscription => `\n * \`${subscription.githubProjectUrl}\``)
      }`);
    }
  },
};
