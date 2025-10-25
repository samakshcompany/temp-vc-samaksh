const { PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TempVoiceSettings = require('../models/TempVoiceSettings');
const TempVoiceChannel = require('../models/TempVoiceChannel');
const { 
  createInterfaceEmbed, 
  createInterfaceButtons, 
  createVoiceControlEmbed, 
  createVoiceControlButtons,
  createErrorEmbed,
  createSuccessEmbed,
  createInfoEmbed,
  createWarningEmbed
} = require('./embeds');
const { verifySetup, cleanupInvalidSetup } = require('./setupHandler');
const { getInterfaceImage } = require('./imageHandler');
const { createUserSelectionModal } = require('./permissionHandler');
const { claimOwnership } = require('./permissionHandler');

async function handleButtonInteraction(interaction) {
  const { customId, guild, member } = interaction;

  try {
    switch (customId) {
      // Admin setup buttons
      case 'setup_tempvoice':
      case 'setup_tempvoice_original':
        await handleSetupTempVoice(interaction);
        break;
      case 'new_creator':
        await handleNewCreator(interaction);
        break;
      case 'new_interface':
        await handleNewInterface(interaction);
        break;
      
      // Voice channel management buttons
      case 'voice_name':
      case 'voice_rename':
        await handleVoiceRename(interaction);
        break;
      case 'voice_limit':
        await handleVoiceLimit(interaction);
        break;
      case 'voice_privacy':
      case 'voice_lock':
        await handleVoiceLock(interaction);
        break;
      case 'voice_waiting':
        await handleVoiceWaiting(interaction);
        break;
      case 'voice_thread':
        await handleVoiceThread(interaction);
        break;
      case 'voice_trust':
        await handleVoiceTrust(interaction);
        break;
      case 'voice_untrust':
        await handleVoiceUntrust(interaction);
        break;
      case 'voice_invite':
        await handleVoiceInvite(interaction);
        break;
      case 'voice_kick':
        await handleVoiceKick(interaction);
        break;
      case 'voice_region':
        await handleVoiceRegion(interaction);
        break;
      case 'voice_block':
        await handleVoiceBlock(interaction);
        break;
      case 'voice_unblock':
        await handleVoiceUnblock(interaction);
        break;
      case 'voice_claim':
        await handleVoiceClaim(interaction);
        break;
      case 'voice_transfer':
        await handleVoiceTransfer(interaction);
        break;
      case 'voice_permission':
        await handleVoicePermission(interaction);
        break;
      case 'voice_delete':
        await handleVoiceDelete(interaction);
        break;
      default:
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Unknown Button', 
            `The button with ID "${customId}" is not recognized or implemented.`
          )],
          ephemeral: true
        });
    }
  } catch (error) {
    console.error(`Error handling button interaction: ${customId}`, error);
    
    try {
      // Check if the interaction has already been replied to
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Button Error', 
            'There was an error while processing this interaction!',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Button Error', 
            'There was an error while processing this interaction!',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error(`Failed to send error response for button ${customId}:`, replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Setup TempVoice
async function handleSetupTempVoice(interaction) {
  const { guild, member } = interaction;
  const interfaceType = interaction.customId === 'setup_tempvoice_original' ? 'original' : 'standard';

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'Permission Denied', 
        'You need Administrator permissions to set up TempVoice.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
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
        await cleanupInvalidSetup(guild);
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

    // Create TempVoice category
    const category = await guild.channels.create({
      name: 'TempVoice',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Create Creator Channel
    const creatorChannel = await guild.channels.create({
      name: '➕ Create Channel',
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect],
          deny: [PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Create Interface Channel
    const interfaceChannel = await guild.channels.create({
      name: '🔊 Interface',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ]
    });

    // Get interface image
    const interfaceImage = getInterfaceImage();
    
    // Send interface message
    const interfaceEmbed = createInterfaceEmbed();
    const interfaceButtons = createInterfaceButtons();
    
    let interfaceMessage;
    if (interfaceImage) {
      // Set the image to the bottom of the embed
      interfaceEmbed.setImage('attachment://' + interfaceImage.name);
      
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons,
        files: [interfaceImage]
      });
    } else {
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons
      });
    }

    // Save settings to database
    const settings = new TempVoiceSettings({
      guildId: guild.id,
      categoryId: category.id,
      creatorChannelId: creatorChannel.id,
      interfaceChannelId: interfaceChannel.id,
      interfaceMessageId: interfaceMessage.id,
      interfaceType: interfaceType
    });

    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Setup Complete', 
        'TempVoice has been set up successfully!',
        [
          { 
            name: 'Setup Details', 
            value: `Category: ${category.name}\nCreator Channel: ${creatorChannel.name}\nInterface Channel: ${interfaceChannel.name}\nInterface Type: ${interfaceType === 'original' ? 'Original' : 'Standard'}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error setting up TempVoice:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'Setup Failed', 
        'An error occurred while setting up TempVoice. Please try again later.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Create a new creator channel
async function handleNewCreator(interaction) {
  const { guild, member } = interaction;

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'Permission Denied', 
        'You need Administrator permissions to create a new creator channel.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
    if (!setupStatus.valid) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Setup Required', 
          'TempVoice is not set up in this server. Please run the `/setup` command first.'
        )],
        ephemeral: true
      });
    }

    const { settings } = setupStatus;
    const category = guild.channels.cache.get(settings.categoryId);

    if (!category) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Category Not Found', 
          'The TempVoice category could not be found. Please run the `/setup` command again.'
        )],
        ephemeral: true
      });
    }

    // Create Creator Channel
    const creatorChannel = await guild.channels.create({
      name: '➕ Create Channel',
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect],
          deny: [PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Update settings
    settings.creatorChannelId = creatorChannel.id;
    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Creator Channel Added', 
        'A new creator channel has been added to the TempVoice category.',
        [
          { 
            name: 'Channel Details', 
            value: `Name: ${creatorChannel.name}\nCategory: ${category.name}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error creating new creator channel:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'Creation Failed', 
        'An error occurred while creating a new creator channel. Please try again later.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Create a new interface message
async function handleNewInterface(interaction) {
  const { guild, member } = interaction;

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'Permission Denied', 
        'You need Administrator permissions to create a new interface message.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
    if (!setupStatus.valid) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Setup Required', 
          'TempVoice is not set up in this server. Please run the `/setup` command first.'
        )],
        ephemeral: true
      });
    }

    const { settings } = setupStatus;
    const interfaceChannel = guild.channels.cache.get(settings.interfaceChannelId);

    if (!interfaceChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'The interface channel could not be found. Please run the `/setup` command again.'
        )],
        ephemeral: true
      });
    }

    // Get interface image
    const interfaceImage = getInterfaceImage();
    
    // Send new interface message
    const interfaceEmbed = createInterfaceEmbed();
    const interfaceButtons = createInterfaceButtons();
    
    let interfaceMessage;
    if (interfaceImage) {
      // Set the image to the bottom of the embed
      interfaceEmbed.setImage('attachment://' + interfaceImage.name);
      
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons,
        files: [interfaceImage]
      });
    } else {
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons
      });
    }

    // Update settings
    settings.interfaceMessageId = interfaceMessage.id;
    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Interface Created', 
        'A new interface message has been created.',
        [
          { 
            name: 'Channel Details', 
            value: `Interface Channel: ${interfaceChannel.name}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error creating new interface message:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'Creation Failed', 
        'An error occurred while creating a new interface message. Please try again later.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Lock/Unlock voice channel
async function handleVoiceLock(interaction) {
  const { guild, member } = interaction;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'No Channel Found', 
          'You do not have an active temporary voice channel.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Check if channel is locked
    const isLocked = !channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.Connect);

    // Toggle lock status
    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      Connect: isLocked
    });

    // Update database
    tempChannel.settings.isLocked = !isLocked;
    await tempChannel.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        isLocked ? 'Channel Unlocked' : 'Channel Locked', 
        `Your voice channel has been ${isLocked ? 'unlocked' : 'locked'}.`,
        [
          { 
            name: 'Channel Details', 
            value: `Name: ${channel.name}\nStatus: ${isLocked ? '🔓 Public' : '🔒 Private'}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error locking/unlocking voice channel:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'Action Failed', 
        'An error occurred while locking/unlocking your voice channel. Please try again later.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Rename voice channel
async function handleVoiceRename(interaction) {
  const { guild, member } = interaction;

  try {
    // IMPORTANT: Never use deferReply before showModal - they are incompatible
    // The reply has already been sent or deferred error will occur
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'No Channel Found', 
          'You do not have an active temporary voice channel.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Create modal
    const modal = new ModalBuilder()
      .setCustomId('rename_channel_modal')
      .setTitle('Rename Voice Channel');

    // Add components to modal
    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel('New Channel Name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter a new name for your channel')
      .setMaxLength(100)
      .setRequired(true)
      .setValue(channel.name);

    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
    modal.addComponents(firstActionRow);

    // Show the modal
    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error showing rename modal:', error);
    try {
      await interaction.reply({
        embeds: [createErrorEmbed(
          'Rename Failed', 
          'An error occurred while trying to rename your voice channel. Please try again later.',
          error.message
        )],
        ephemeral: true
      });
    } catch (replyError) {
      console.error('Error replying to rename interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Set user limit for voice channel
async function handleVoiceLimit(interaction) {
  const { guild, member } = interaction;

  try {
    // IMPORTANT: Never use deferReply before showModal - they are incompatible
    // The reply has already been sent or deferred error will occur
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'No Channel Found', 
          'You do not have an active temporary voice channel.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Create modal
    const modal = new ModalBuilder()
      .setCustomId('limit_channel_modal')
      .setTitle('Set User Limit');

    // Add components to modal
    const limitInput = new TextInputBuilder()
      .setCustomId('user_limit')
      .setLabel('User Limit (0 = unlimited)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter a number between 0 and 99')
      .setMaxLength(2)
      .setRequired(true)
      .setValue(channel.userLimit.toString());

    const firstActionRow = new ActionRowBuilder().addComponents(limitInput);
    modal.addComponents(firstActionRow);

    // Show the modal
    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error showing user limit modal:', error);
    try {
      await interaction.reply({
        embeds: [createErrorEmbed(
          'Limit Setting Failed', 
          'An error occurred while trying to set the user limit. Please try again later.',
          error.message
        )],
        ephemeral: true
      });
    } catch (replyError) {
      console.error('Error replying to limit interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Create a waiting room for the voice channel
async function handleVoiceWaiting(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'Feature Coming Soon', 
      'Waiting room functionality is not implemented in this version.',
      [
        { 
          name: 'Alternative', 
          value: 'You can use the Privacy button to control who can join your channel.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Create a thread for the voice channel
async function handleVoiceThread(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'Feature Coming Soon', 
      'Thread creation functionality is not implemented in this version.',
      [
        { 
          name: 'Alternative', 
          value: 'You can create a text channel in your server for voice channel discussions.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Trust a user in the voice channel
async function handleVoiceTrust(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'trust');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to trust:',
        components: result.components,
        ephemeral: true
      });
    } else {
      // Just show the error message without manual input option
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Trust Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling trust user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Trust Action Failed', 
            'An error occurred while trying to trust a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Trust Action Failed', 
            'An error occurred while trying to trust a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to trust interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Invite a user to the voice channel
async function handleVoiceInvite(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'invite');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to invite:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invite Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling invite user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Invite Action Failed', 
            'An error occurred while trying to invite a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Invite Action Failed', 
            'An error occurred while trying to invite a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to invite interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Kick a user from the voice channel
async function handleVoiceKick(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'kick');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to kick:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Kick Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling kick user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Kick Action Failed', 
            'An error occurred while trying to kick a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Kick Action Failed', 
            'An error occurred while trying to kick a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to kick interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Change the region of the voice channel
async function handleVoiceRegion(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'Feature Coming Soon', 
      'Region change functionality is not implemented in this version.',
      [
        { 
          name: 'Note', 
          value: 'Discord now automatically optimizes voice regions for all users in the channel.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Block a user from the voice channel
async function handleVoiceBlock(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'block');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to block:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Block Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling block user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Block Action Failed', 
            'An error occurred while trying to block a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Block Action Failed', 
            'An error occurred while trying to block a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to block interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Unblock a user from the voice channel
async function handleVoiceUnblock(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'unblock');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to unblock:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Unblock Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling unblock user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Unblock Action Failed', 
            'An error occurred while trying to unblock a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Unblock Action Failed', 
            'An error occurred while trying to unblock a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to unblock interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Claim ownership of an abandoned voice channel
async function handleVoiceClaim(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    const result = await claimOwnership(interaction);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Channel Claimed', 
          result.message,
          [
            { 
              name: 'Channel Details', 
              value: `Name: ${result.channel?.name || 'Unknown'}`, 
              inline: false 
            }
          ]
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Claim Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error claiming ownership:', error);
    if (interaction.deferred) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Claim Failed', 
          'An error occurred while claiming ownership. Please try again later.',
          error.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [createErrorEmbed(
          'Claim Failed', 
          'An error occurred while claiming ownership. Please try again later.',
          error.message
        )],
        ephemeral: true
      });
    }
  }
}

// Transfer ownership of the voice channel
async function handleVoiceTransfer(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'transfer');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to transfer ownership to:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Transfer Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling transfer ownership action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Transfer Action Failed', 
            'An error occurred while trying to transfer ownership. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Transfer Action Failed', 
            'An error occurred while trying to transfer ownership. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to transfer interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Manage voice channel permissions
async function handleVoicePermission(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'Feature Coming Soon', 
      'Voice channel permission management is not implemented in this version.',
      [
        { 
          name: 'Alternatives', 
          value: 'You can use the Trust, Untrust, Block, and Unblock buttons to manage user permissions.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Delete voice channel
async function handleVoiceDelete(interaction) {
  const { guild, member } = interaction;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'No Channel Found', 
          'You do not have an active temporary voice channel.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Store channel name for confirmation message
    const channelName = channel.name;

    // Delete the channel
    await channel.delete('Owner requested deletion');
    await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Channel Deleted', 
        'Your temporary voice channel has been deleted.',
        [
          { 
            name: 'Channel Details', 
            value: `Name: ${channelName}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error deleting voice channel:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'Deletion Failed', 
        'An error occurred while deleting your voice channel. Please try again later.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Untrust a user in the voice channel
async function handleVoiceUntrust(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'untrust');
    
    if (result.success) {
      await interaction.editReply({
        content: 'Select a user to untrust:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Untrust Action Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling untrust user action:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Untrust Action Failed', 
            'An error occurred while trying to untrust a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Untrust Action Failed', 
            'An error occurred while trying to untrust a user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to untrust interaction:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

module.exports = { handleButtonInteraction }; 