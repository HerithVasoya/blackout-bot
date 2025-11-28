require('./server'); // add this at the top
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config');

// Create client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Load commands into a collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Ready event
client.once('ready', () => {
  console.log(`✅ Blackout bot online as ${client.user.tag}`);
});

// Handle all interactions (slash commands + buttons)
client.on('interactionCreate', async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log(`⚠️ Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction, client); // pass client for ticket logic
    } catch (error) {
      console.error('❌ Error executing command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Error executing command.', ephemeral: true });
      }
    }
  }

  // Buttons and select menus (delegated to ticket.js)
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    const command = client.commands.get('ticketpanel');
    if (command && typeof command.handleInteraction === 'function') {
      try {
        await command.handleInteraction(interaction, client);
      } catch (error) {
        console.error('❌ Error handling interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'Failed to handle interaction.', ephemeral: true });
        }
      }
    }
  }

});

// Login
client.login(token);
