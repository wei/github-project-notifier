module.exports = {
  name: 'debug',
  description: 'Debug',
  async execute(message) {
    const channelId = message.channel.id;

    console.log({ 'command': 'debug', channelId });

    message.channel.send(`Your channel id is \`${channelId}\``);
  },
};
