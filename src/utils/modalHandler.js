const TempVoiceChannel = require('../models/TempVoiceChannel');
const { trustUser, untrustUser, blockUser, unblockUser, kickUser, inviteUser, transferOwnership } = require('./permissionHandler');
const { createSuccessEmbed, createErrorEmbed } = require('./embeds');

async function handleModalSubmit(interaction) {
  const { customId, guild, member } = interaction;

  try {
    switch (customId) {
      case 'rename_channel_modal':
        await handleRenameChannel(interaction);
        break;
      case 'limit_channel_modal':
        await handleLimitChannel(interaction);
        break;
      case 'trust_user_modal':
        await handleTrustUserModal(interaction);
        break;
      case 'untrust_user_modal':
        await handleUntrustUserModal(interaction);
        break;
      case 'block_user_modal':
        await handleBlockUserModal(interaction);
        break;
      case 'unblock_user_modal':
        await handleUnblockUserModal(interaction);
        break;
      case 'kick_user_modal':
        await handleKickUserModal(interaction);
        break;
      case 'invite_user_modal':
        await handleInviteUserModal(interaction);
        break;
      case 'transfer_user_modal':
        await handleTransferUserModal(interaction);
        break;
      default:
        try {
          await interaction.reply({
            embeds: [createErrorEmbed(
              'Unknown Modal', 
              'This modal submission is not recognized.'
            )],
            ephemeral: true
          });
        } catch (replyError) {
          console.error('Error replying to unknown modal submission:', replyError);
        }
    }
  } catch (error) {
    console.error(`Error handling modal submission: ${customId}`, error);
    
    try {
      // Check if the interaction has already been replied to
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [createErrorEmbed(
            'Modal Error', 
            'There was an error while processing your submission!',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Modal Error', 
            'There was an error while processing your submission!',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (finalError) {
      console.error(`Failed to send error response for modal ${customId}:`, finalError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Handle rename channel modal
async function handleRenameChannel(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const { guild, member } = interaction;
    const newName = interaction.fields.getTextInputValue('channel_name');
    
    if (!newName || newName.trim().length === 0) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid Name', 
          'Please provide a valid channel name.'
        )],
        ephemeral: true
      });
    }
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.editReply({
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
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Update channel name
    await channel.setName(newName);

    // Update database
    tempChannel.settings.name = newName;
    await tempChannel.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Channel Renamed', 
        `Your voice channel has been renamed to **${newName}**.`
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error renaming channel:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Rename Failed', 
            'An error occurred while renaming your channel. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Rename Failed', 
            'An error occurred while renaming your channel. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to rename channel interaction:', replyError);
    }
  }
}

// Handle limit channel modal
async function handleLimitChannel(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const { guild, member } = interaction;
    const userLimitInput = interaction.fields.getTextInputValue('user_limit');
    
    // Validate user limit
    const userLimit = parseInt(userLimitInput);
    if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid Limit', 
          'Please provide a valid user limit between 0 and 99.'
        )],
        ephemeral: true
      });
    }
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.editReply({
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
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Channel Not Found', 
          'Your temporary voice channel no longer exists.'
        )],
        ephemeral: true
      });
    }

    // Update user limit
    await channel.setUserLimit(userLimit);

    // Update database
    tempChannel.settings.userLimit = userLimit;
    await tempChannel.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'User Limit Updated', 
        `Your voice channel user limit has been set to **${userLimit === 0 ? 'unlimited' : userLimit}**.`
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error setting user limit:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Limit Update Failed', 
            'An error occurred while updating the user limit. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Limit Update Failed', 
            'An error occurred while updating the user limit. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to limit channel interaction:', replyError);
    }
  }
}

// Handle trust user modal
async function handleTrustUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await trustUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Trust Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Trust Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error trusting user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Trust Failed', 
            'An error occurred while trusting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Trust Failed', 
            'An error occurred while trusting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to trust user interaction:', replyError);
    }
  }
}

// Handle untrust user modal
async function handleUntrustUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await untrustUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Untrust Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Untrust Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error untrusting user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Untrust Failed', 
            'An error occurred while untrusting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Untrust Failed', 
            'An error occurred while untrusting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to untrust user interaction:', replyError);
    }
  }
}

// Handle block user modal
async function handleBlockUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await blockUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Block Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Block Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Block Failed', 
            'An error occurred while blocking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Block Failed', 
            'An error occurred while blocking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to block user interaction:', replyError);
    }
  }
}

// Handle unblock user modal
async function handleUnblockUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await unblockUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Unblock Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Unblock Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Unblock Failed', 
            'An error occurred while unblocking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Unblock Failed', 
            'An error occurred while unblocking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to unblock user interaction:', replyError);
    }
  }
}

// Handle kick user modal
async function handleKickUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await kickUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Kick Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Kick Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error kicking user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Kick Failed', 
            'An error occurred while kicking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Kick Failed', 
            'An error occurred while kicking the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to kick user interaction:', replyError);
    }
  }
}

// Handle invite user modal
async function handleInviteUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await inviteUser(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Invite Sent', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invite Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Invite Failed', 
            'An error occurred while inviting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Invite Failed', 
            'An error occurred while inviting the user. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to invite user interaction:', replyError);
    }
  }
}

// Handle transfer ownership modal
async function handleTransferUserModal(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const userId = extractUserId(interaction.fields.getTextInputValue('user_id'));
    
    if (!userId) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Invalid User', 
          'Please provide a valid user ID or mention.'
        )],
        ephemeral: true
      });
    }
    
    const result = await transferOwnership(interaction, userId);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'Transfer Successful', 
          result.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Transfer Failed', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error transferring ownership:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Transfer Failed', 
            'An error occurred while transferring ownership. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'Transfer Failed', 
            'An error occurred while transferring ownership. Please try again later.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error replying to transfer ownership interaction:', replyError);
    }
  }
}

// Helper function to extract user ID from input
function extractUserId(input) {
  if (!input || input.trim() === '') return null;
  
  // Remove mention formatting if present (<@!123456789>)
  const userId = input.replace(/[<@!>]/g, '');
  
  // Check if the result is a valid Discord ID (numeric, 17-19 digits)
  if (/^\d{17,19}$/.test(userId)) {
    return userId;
  }
  
  return null;
}

module.exports = { handleModalSubmit }; 