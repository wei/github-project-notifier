module.exports = {
  name: 'unsub',
  aliases: ['unsubscribe'],
  description: 'Unsubscribe to a GitHub project board',
  usage: 'https://github.com/[owner]/[repo]/projects/1',
  args: true,
  async execute(message, args) {
    const channelId = message.channel.id;
    const githubProjectUrl = args[0];

    console.log({ 'command': 'unsub', channelId, githubProjectUrl });
    // TODO Remove channel id and githubProjectUrl from the database, send message if not found

    message.channel.send(`Unsubscribed to \`${githubProjectUrl}\``);

    // TODO send message if errored
  },
};
