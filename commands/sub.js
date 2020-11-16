module.exports = {
  name: 'sub',
  aliases: ['subscribe'],
  description: 'Subscribe to a GitHub project board',
  usage: 'https://github.com/[owner]/[repo]/projects/1',
  args: true,
  async execute(message, args) {
    const channelId = message.channel.id;
    const githubProjectUrl = args[0];

    console.log({ 'command': 'sub', channelId, githubProjectUrl });

    // TODO Validate githubProjectUrl, send message with example if invalid

    // TODO Store channelId and githubProjectUrl in a database

    message.channel.send(`Subscribed to \`${githubProjectUrl}\``);

    // TODO send message if errored
  },
};
