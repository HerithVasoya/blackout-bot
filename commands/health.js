const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check bot status and uptime'),

  async execute(interaction) {
    try {
      const uptime = process.uptime();
      const formatUptime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs}h ${mins}m ${secs}s`;
      };

      const memory = process.memoryUsage().heapUsed / 1024 / 1024;

      console.log(`Responding to /health with uptime: ${formatUptime(uptime)} and memory: ${memory.toFixed(2)} MB`);

      const embed = new EmbedBuilder()
        .setTitle('💫 Health')
        .setDescription(`Bot is online and glowing.\n**Uptime:** ${formatUptime(uptime)}`)
        .addFields({ name: 'Memory Usage', value: `${memory.toFixed(2)} MB`, inline: true })
        .setColor(0x676767)
        .setFooter({ text: 'Blackout Bot • Status synced from backend clarity' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /health command:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Error executing /health.', ephemeral: true });
      }
    }
  },
};
