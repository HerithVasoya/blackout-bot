const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config'); // ← Now importing from config.js

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // 🔥 This is the key
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Optional, only if reading messages
  ],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Blackout bot online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Received command: /${interaction.commandName}`);

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log('Command not found.');
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});


client.login(token); // ← Using token from config.js
