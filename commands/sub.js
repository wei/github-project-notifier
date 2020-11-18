const { add } = require('../datastore');
const { validateGithubProjectUrl } = require('./utils');

module.exports = {
  name: 'sub',
  aliases: ['subscribe'],
  description: 'Subscribe to a GitHub Project board',
  usage: 'https://github.com/[owner]/[repo]/projects/1',
  args: true,
  async execute(message, args) {
    const channelId = message.channel.id;
    const githubProjectUrl = args[0].toLowerCase();

    if (validateGithubProjectUrl({ githubProjectUrl: githubProjectUrl })) {
      try {
        add({ channelId: channelId, githubProjectUrl: githubProjectUrl });
        message.channel.send(`Subscribed to \`${githubProjectUrl}\``);
      }
      catch (error) {
        message.channel.send(`Already subscribed to \`${githubProjectUrl}\``);
      }
    }
    else {
      message.channel.send('Please use correct format:\n`https://github.com/[owner]/[repo]/projects/[0-9]+`');
    }
  },
};
