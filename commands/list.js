module.exports = {
  name: 'list',
  aliases: ['ls'],
  description: 'List subscribed GitHub project boards',
  async execute(message) {
    const channelId = message.channel.id;

    console.log({ 'command': 'list', channelId });

    // TODO Fetch githubProjectUrl from the database by channelId, send message if none found
    const githubProjectUrls = [
      'https://github.com/[owner]/[repo]/projects/1',
      'https://github.com/[owner]/[repo]/projects/2',
      'https://github.com/[owner]/[repo]/projects/3',
    ];
    message.channel.send(`GitHub Project boards subscribed: ${
      githubProjectUrls.map(url => `\n * \`${url}\``)
    }`);

    // TODO send message if errored
  },
};
