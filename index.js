require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix } = require('./config');
const webhookHandler = require('./webhook');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log('Discord bot ready');
});

client.on('message', message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix} ${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(token);

const fastify = require('fastify')({
  logger: process.env.NODE_ENV !== 'production',
});

fastify.post('/webhook', webhookHandler(client));

fastify.listen(process.env.PORT || 3000, (err, address) => {
  if (err) throw err;
  console.log(`Webhook server ready at ${address}`);
});
