const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { 
  createSetupEmbed, 
  createSetupButtons, 
  createErrorEmbed, 
  createInfoEmbed, 
  createWarningEmbed 
} = require('../utils/embeds');
const { verifySetup, cleanupInvalidSetup } = require('../utils/setupHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the temporary voice channels system')
    .addStringOption(option =>
      option.setName('interface')
        .setDescription('The interface type to use')
        .setRequired(false)
        .addChoices(
          { name: 'Original', value: 'original' },
          { name: 'Standard', value: 'standard' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    // Check if user has administrator permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        embeds: [createErrorEmbed(
          'Permission Denied', 
          'You need Administrator permissions to use this command.'
        )],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Verify if setup is still valid
    const setupStatus = await verifySetup(interaction.guild);
    
    if (setupStatus.valid) {
      return interaction.editReply({
        embeds: [createInfoEmbed(
          'Already Set Up', 
          'TempVoice is already set up in this server.',
          [
            { 
              name: 'Current Setup', 
              value: `Category: <#${setupStatus.settings.categoryId}>\nCreator Channel: <#${setupStatus.settings.creatorChannelId}>\nInterface Channel: <#${setupStatus.settings.interfaceChannelId}>`, 
              inline: false 
            }
          ]
        )],
        ephemeral: true
      });
    } else {
      // If setup is invalid, clean it up
      if (setupStatus.reason !== 'No settings found') {
        await cleanupInvalidSetup(interaction.guild);
        await interaction.editReply({
          embeds: [createWarningEmbed(
            'Invalid Setup Cleaned', 
            `Previous setup was invalid (${setupStatus.reason}). It has been cleaned up. Please run the command again to set up TempVoice.`
          )],
          ephemeral: true
        });
        return;
      }
    }

    const interfaceType = interaction.options.getString('interface') || 'standard';
    const setupEmbed = createSetupEmbed(interfaceType);
    const setupButtons = createSetupButtons();

    await interaction.editReply({
      embeds: [setupEmbed],
      components: [setupButtons],
      ephemeral: false
    });
  }
}; 