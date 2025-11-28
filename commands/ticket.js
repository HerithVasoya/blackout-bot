const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// 🔹 Define all ticket options once
const ticketOptions = [
  {
    label: 'Staff',
    value: 'staff',
    description: 'Contact Team Blackout staff for support',
    emoji: '🛡️',
  },
  {
    label: 'CCH',
    value: 'cch',
    description: 'Apply as a Comp Clip Hitter',
    emoji: '🚗',
  },
  {
    label: 'Freestyler',
    value: 'freestyler',
    description: 'Apply as a Freestyler',
    emoji: '🌀',
  },
  {
    label: 'VFX',
    value: 'vfx',
    description: 'Apply as a VFX Designer',
    emoji: '✨',
  },
  {
    label: 'GFX',
    value: 'gfx',
    description: 'Apply as a GFX Designer',
    emoji: '🎨',
  },
  {
    label: 'Partner',
    value: 'partner',
    description: 'Become a Team Blackout Partner',
    emoji: '🤝',
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Send a ticket creation panel with dropdown'),

  async execute(interaction) {
    // Ticket panel embed
    const embed = new EmbedBuilder()
      .setTitle('🎟 Ticket System')
      .setDescription('Select your ticket type below.')
      .setColor(0x676767)
      .setFooter({ text: 'Team Blackout Ticket System' })
      .setTimestamp();

    // Dropdown menu using reusable options
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticketSelect')
      .setPlaceholder('Choose a ticket type...')
      .addOptions(ticketOptions);

    const row = new ActionRowBuilder().addComponents(menu);

    // Send the panel
    await interaction.reply({ embeds: [embed], components: [row] });
  },

  async handleInteraction(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.member;

    const supportRoleId = '1411450797757042709';
    const categoryId = '1441916314988843089';
    const logChannelId = '1413445510391398450'; // Replace with your log channel ID

    // Handle dropdown selection (ticket creation)
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticketSelect') {
      const purpose = interaction.values[0];
      const username = member.user.username.toLowerCase().replace(/\s+/g, '-');
      const channelName = `${purpose}-${username}`;

      try {
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: ['ViewChannel'] },
            { id: member.id, allow: ['ViewChannel', 'SendMessages'] },
            { id: client.user.id, allow: ['ViewChannel', 'SendMessages'] },
          ],
        });

        // Close button
        const closeButton = new ButtonBuilder()
          .setCustomId('closeTicket')
          .setLabel('❌ Close Ticket')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeButton);

        // Ticket embed
        const embed = new EmbedBuilder()
          .setTitle(`🎟 ${purpose.toUpperCase()} Ticket`)
          .setDescription(
            `Welcome <@${member.id}>! A staff member will be with you shortly.\n\nClick below when this ticket is resolved.`
          )
          .setColor(0x00ffcc)
          .setFooter({ text: 'Team Blackout Ticket System' })
          .setTimestamp();

        await ticketChannel.send(`<@&${supportRoleId}>`);
        await ticketChannel.send({ embeds: [embed], components: [row] });

        // Ephemeral confirmation
        await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

        // Reset dropdown back to placeholder
        const resetMenu = new StringSelectMenuBuilder()
          .setCustomId('ticketSelect')
          .setPlaceholder('Choose a ticket type...')
          .addOptions(ticketOptions);

        const resetRow = new ActionRowBuilder().addComponents(resetMenu);

        await interaction.message.edit({
          components: [resetRow],
        });

        // Log ticket creation
        const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('📝 Ticket Created')
            .addFields(
              { name: 'User', value: `<@${member.id}>`, inline: true },
              { name: 'Type', value: purpose.toUpperCase(), inline: true },
              { name: 'Channel', value: `<#${ticketChannel.id}>`, inline: true }
            )
            .setColor(0x00ffcc)
            .setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error('❌ Error creating ticket channel:', error);
        await interaction.reply({ content: 'Failed to create ticket.', ephemeral: true });
      }
    }

    // Handle close button (ticket deletion)
    if (interaction.isButton() && interaction.customId === 'closeTicket') {
      try {
        const logChannel = guild.channels.cache.get(logChannelId);

        // Log ticket deletion
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('🗑️ Ticket Closed')
            .addFields(
              { name: 'Closed By', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Channel', value: `${interaction.channel.name}`, inline: true }
            )
            .setColor(0xff0000)
            .setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }

        await interaction.channel.delete();
      } catch (error) {
        console.error('❌ Error closing ticket channel:', error);
        await interaction.reply({ content: 'Failed to close ticket.', ephemeral: true });
      }
    }
  },
};
