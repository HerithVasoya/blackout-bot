const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available bot commands'),

  async execute(interaction) {
    const commands = interaction.client.commands
      .map(cmd => ({
        name: cmd.data.name,
        description: cmd.data.description
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const embed = new EmbedBuilder()
      .setTitle('📜 Blackout Command List')
      .setDescription(`Here are all ${commands.length} available commands:`)
      .setColor(0x676767)
      .addFields(
        commands.map(cmd => ({
          name: `/${cmd.name}`,
          value: cmd.description || 'No description provided',
          inline: false
        }))
      )
      .setFooter({ text: 'Blackout Bot • Command list synced from backend clarity' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
