const { remove } = require('../datastore');
const { validateGithubProjectUrl } = require('./utils');

module.exports = {
  name: 'unsub',
  aliases: ['unsubscribe'],
  description: 'Unsubscribe to a GitHub project board',
  usage: 'https://github.com/[owner]/[repo]/projects/1',
  args: true,
  async execute(message, args) {
    const channelId = message.channel.id;
    const githubProjectUrl = args[0];

    if (validateGithubProjectUrl({ githubProjectUrl: githubProjectUrl })) {
      try {
        remove({ channelId: channelId, githubProjectUrl: githubProjectUrl });
        message.channel.send(`Unsubscribed to \`${githubProjectUrl}\``);
      }
      catch (error) {
        message.channel.send('Does not exist!');
      }
    }
    else {
      message.channel.send('Please use correct format:\n`https://github.com/[owner/org]/[repo]/projects/[0-9]+`');
    }
  },
};
