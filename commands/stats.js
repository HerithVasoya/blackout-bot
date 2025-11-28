const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show Discord server stats'),

  async execute(interaction) {
    try {
      const guild = interaction.guild;
        await guild.members.fetch(); // Ensure full cache
            
        const boostCount = guild.premiumSubscriptionCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const memberCount = guild.memberCount - botCount;


      console.log(`Responding to /stats: ${memberCount} members, ${botCount} bots, ${boostCount} boosts`);

      const embed = new EmbedBuilder()
        .setTitle('📊 Blackout Server Stats')
        .setDescription(`Here's a snapshot of your server's current status:`)
        .addFields(
          { name: '👥 Members', value: `${memberCount}`, inline: false },
          { name: '🤖 Bots', value: `${botCount}`, inline: false },
          { name: '🚀 Boosts', value: `${boostCount}`, inline: false }
        )
        .setColor(0x676767)
        .setFooter({ text: 'Blackout Bot • Synced from Discord core' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /stats command:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Error executing /stats.', ephemeral: true });
      }
    }
  },
};
