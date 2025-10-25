const { PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const TempVoiceChannel = require('../models/TempVoiceChannel');

// Function to handle trusting a user
async function trustUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to trust
    const userToTrust = await guild.members.fetch(userId).catch(() => null);
    if (!userToTrust) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is already trusted
    if (tempChannel.settings.allowedUsers.includes(userId)) {
      return { success: false, message: `${userToTrust.displayName} is already trusted.` };
    }

    // Remove from blocked users if present
    if (tempChannel.settings.blockedUsers.includes(userId)) {
      tempChannel.settings.blockedUsers = tempChannel.settings.blockedUsers.filter(id => id !== userId);
    }

    // Add to allowed users
    tempChannel.settings.allowedUsers.push(userId);
    await tempChannel.save();

    // Update channel permissions
    await channel.permissionOverwrites.edit(userId, {
      Connect: true,
      Speak: true
    });

    return { success: true, message: `${userToTrust.displayName} has been trusted.` };
  } catch (error) {
    console.error('Error trusting user:', error);
    return { success: false, message: 'An error occurred while trusting the user.' };
  }
}

// Function to handle untrusting a user
async function untrustUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to untrust
    const userToUntrust = await guild.members.fetch(userId).catch(() => null);
    if (!userToUntrust) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is trusted
    if (!tempChannel.settings.allowedUsers.includes(userId)) {
      return { success: false, message: `${userToUntrust.displayName} is not trusted.` };
    }

    // Remove from allowed users
    tempChannel.settings.allowedUsers = tempChannel.settings.allowedUsers.filter(id => id !== userId);
    await tempChannel.save();

    // Reset channel permissions
    await channel.permissionOverwrites.delete(userId);

    return { success: true, message: `${userToUntrust.displayName} has been untrusted.` };
  } catch (error) {
    console.error('Error untrusting user:', error);
    return { success: false, message: 'An error occurred while untrusting the user.' };
  }
}

// Function to handle blocking a user
async function blockUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to block
    const userToBlock = await guild.members.fetch(userId).catch(() => null);
    if (!userToBlock) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is already blocked
    if (tempChannel.settings.blockedUsers.includes(userId)) {
      return { success: false, message: `${userToBlock.displayName} is already blocked.` };
    }

    // Remove from allowed users if present
    if (tempChannel.settings.allowedUsers.includes(userId)) {
      tempChannel.settings.allowedUsers = tempChannel.settings.allowedUsers.filter(id => id !== userId);
    }

    // Add to blocked users
    tempChannel.settings.blockedUsers.push(userId);
    await tempChannel.save();

    // Update channel permissions
    await channel.permissionOverwrites.edit(userId, {
      Connect: false,
      Speak: false
    });

    // Kick the user if they're in the channel
    const memberToKick = channel.members.get(userId);
    if (memberToKick) {
      await memberToKick.voice.disconnect('Blocked from channel');
    }

    return { success: true, message: `${userToBlock.displayName} has been blocked.` };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, message: 'An error occurred while blocking the user.' };
  }
}

// Function to handle unblocking a user
async function unblockUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to unblock
    const userToUnblock = await guild.members.fetch(userId).catch(() => null);
    if (!userToUnblock) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is blocked
    if (!tempChannel.settings.blockedUsers.includes(userId)) {
      return { success: false, message: `${userToUnblock.displayName} is not blocked.` };
    }

    // Remove from blocked users
    tempChannel.settings.blockedUsers = tempChannel.settings.blockedUsers.filter(id => id !== userId);
    await tempChannel.save();

    // Reset channel permissions
    await channel.permissionOverwrites.delete(userId);

    return { success: true, message: `${userToUnblock.displayName} has been unblocked.` };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { success: false, message: 'An error occurred while unblocking the user.' };
  }
}

// Function to handle kicking a user
async function kickUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to kick
    const userToKick = await guild.members.fetch(userId).catch(() => null);
    if (!userToKick) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is in the channel
    const memberToKick = channel.members.get(userId);
    if (!memberToKick) {
      return { success: false, message: `${userToKick.displayName} is not in your voice channel.` };
    }

    // Kick the user
    await memberToKick.voice.disconnect('Kicked from channel');

    return { success: true, message: `${userToKick.displayName} has been kicked from your voice channel.` };
  } catch (error) {
    console.error('Error kicking user:', error);
    return { success: false, message: 'An error occurred while kicking the user.' };
  }
}

// Function to handle inviting a user
async function inviteUser(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to invite
    const userToInvite = await guild.members.fetch(userId).catch(() => null);
    if (!userToInvite) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is blocked
    if (tempChannel.settings.blockedUsers.includes(userId)) {
      return { success: false, message: `${userToInvite.displayName} is blocked from your channel. Unblock them first.` };
    }

    // Send invite message
    await userToInvite.send({
      content: `${member.displayName} has invited you to join their voice channel: **${channel.name}**\n` +
               `Click here to join: <#${channel.id}>`
    }).catch(() => null);

    return { success: true, message: `Invitation sent to ${userToInvite.displayName}.` };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { success: false, message: 'An error occurred while inviting the user.' };
  }
}

// Function to handle transferring ownership
async function transferOwnership(interaction, userId) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { success: false, message: 'You do not have an active temporary voice channel.' };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { success: false, message: 'Your temporary voice channel no longer exists.' };
    }

    // Get the user to transfer to
    const newOwner = await guild.members.fetch(userId).catch(() => null);
    if (!newOwner) {
      return { success: false, message: 'User not found.' };
    }

    // Check if user is in the channel
    const memberToTransfer = channel.members.get(userId);
    if (!memberToTransfer) {
      return { success: false, message: `${newOwner.displayName} is not in your voice channel.` };
    }

    // Update permissions
    await channel.permissionOverwrites.edit(member.id, {
      Connect: true,
      Speak: true,
      MuteMembers: false,
      DeafenMembers: false,
      ManageChannels: false
    });

    await channel.permissionOverwrites.edit(newOwner.id, {
      Connect: true,
      Speak: true,
      MuteMembers: true,
      DeafenMembers: true,
      ManageChannels: true
    });

    // Update ownership
    tempChannel.ownerId = userId;
    await tempChannel.save();

    return { success: true, message: `Ownership transferred to ${newOwner.displayName}.` };
  } catch (error) {
    console.error('Error transferring ownership:', error);
    return { success: false, message: 'An error occurred while transferring ownership.' };
  }
}

// Function to handle claiming ownership
async function claimOwnership(interaction) {
  const { guild, member } = interaction;
  
  try {
    // Find the voice channel the user is in
    if (!member.voice.channelId) {
      return { success: false, message: 'You are not in a voice channel.' };
    }

    const channel = guild.channels.cache.get(member.voice.channelId);
    if (!channel) {
      return { success: false, message: 'Voice channel not found.' };
    }

    // Find the temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      channelId: channel.id
    });

    if (!tempChannel) {
      return { success: false, message: 'This is not a temporary voice channel.' };
    }

    // Check if user is already the owner
    if (tempChannel.ownerId === member.id) {
      return { success: false, message: 'You are already the owner of this channel.' };
    }

    // Get the current owner
    const currentOwner = await guild.members.fetch(tempChannel.ownerId).catch(() => null);
    
    // Check if current owner is in the channel
    if (currentOwner && channel.members.has(currentOwner.id)) {
      return { success: false, message: 'The current owner is still in the channel.' };
    }

    // Update permissions
    if (currentOwner) {
      await channel.permissionOverwrites.edit(currentOwner.id, {
        Connect: true,
        Speak: true,
        MuteMembers: false,
        DeafenMembers: false,
        ManageChannels: false
      });
    }

    await channel.permissionOverwrites.edit(member.id, {
      Connect: true,
      Speak: true,
      MuteMembers: true,
      DeafenMembers: true,
      ManageChannels: true
    });

    // Update ownership
    tempChannel.ownerId = member.id;
    await tempChannel.save();

    return { success: true, message: 'You are now the owner of this channel.' };
  } catch (error) {
    console.error('Error claiming ownership:', error);
    return { success: false, message: 'An error occurred while claiming ownership.' };
  }
}

// Create a user selection modal
function createUserSelectionModal(customId, title) {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  const userIdInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel('User ID or @mention')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter a user ID or @mention')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(userIdInput);
  modal.addComponents(firstActionRow);

  return modal;
}

// Create a user selection dropdown
async function createUserSelectionDropdown(interaction, actionType) {
  const { guild, member } = interaction;
  
  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return { 
        success: false, 
        message: 'You do not have an active temporary voice channel.' 
      };
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return { 
        success: false, 
        message: 'Your temporary voice channel no longer exists.' 
      };
    }

    // Determine which users to show based on action type
    let users = [];
    let placeholder = '';
    
    switch (actionType) {
      case 'trust':
        // Show server members who aren't already trusted
        placeholder = 'Select a user to trust...';
        try {
          // Use cache first, then fetch only if needed
          let guildMembers = guild.members.cache;
          
          // If cache is too small, try to fetch some members
          if (guildMembers.size < 10) {
            try {
              // Set a shorter timeout for fetching members
              const fetchedMembers = await guild.members.fetch({ 
                limit: 25,
                time: 5000 // 5 second timeout
              }).catch(() => null);
              
              if (fetchedMembers) {
                guildMembers = fetchedMembers;
              }
            } catch (fetchError) {
              console.log('Using cached members due to fetch error:', fetchError);
            }
          }
          
          users = guildMembers
            .filter(guildMember => 
              !tempChannel.settings.allowedUsers.includes(guildMember.id) && 
              guildMember.id !== member.id &&
              !guildMember.user.bot
            )
            .map(guildMember => ({
              id: guildMember.id,
              displayName: guildMember.displayName,
              username: guildMember.user.username
            }))
            .slice(0, 25); // Discord limits to 25 options
        } catch (memberError) {
          console.error('Error fetching members for trust dropdown:', memberError);
          // Fallback to channel members if guild members fetch fails
          users = channel.members
            .filter(channelMember => 
              !tempChannel.settings.allowedUsers.includes(channelMember.id) && 
              channelMember.id !== member.id &&
              !channelMember.user.bot
            )
            .map(channelMember => ({
              id: channelMember.id,
              displayName: channelMember.displayName,
              username: channelMember.user.username
            }));
        }
        
        // If no users are available for trust, return a helpful message
        if (users.length === 0) {
          return {
            success: false,
            message: 'No users are available to trust. Users must be online and not already trusted. Try again when more users are online.'
          };
        }
        break;
        
      case 'untrust':
        // Show only trusted users
        placeholder = 'Select a user to untrust...';
        const trustedUsers = await Promise.all(
          tempChannel.settings.allowedUsers.map(async userId => {
            try {
              // Try to get from cache first
              let user = guild.members.cache.get(userId);
              if (!user) {
                user = await guild.members.fetch(userId).catch(() => null);
              }
              return user ? {
                id: user.id,
                displayName: user.displayName,
                username: user.user.username
              } : null;
            } catch (error) {
              return null;
            }
          })
        );
        users = trustedUsers.filter(user => user !== null);
        
        // If no users are available for untrust, return a helpful message
        if (users.length === 0) {
          return {
            success: false,
            message: 'No trusted users found. You need to trust users first before you can untrust them.'
          };
        }
        break;
        
      case 'block':
        // Show server members who aren't already blocked
        placeholder = 'Select a user to block...';
        try {
          // Use cache first, then fetch only if needed
          let blockableMembers = guild.members.cache;
          
          // If cache is too small, try to fetch some members
          if (blockableMembers.size < 10) {
            try {
              // Set a shorter timeout for fetching members
              const fetchedMembers = await guild.members.fetch({ 
                limit: 25,
                time: 5000 // 5 second timeout
              }).catch(() => null);
              
              if (fetchedMembers) {
                blockableMembers = fetchedMembers;
              }
            } catch (fetchError) {
              console.log('Using cached members due to fetch error:', fetchError);
            }
          }
          
          users = blockableMembers
            .filter(guildMember => 
              !tempChannel.settings.blockedUsers.includes(guildMember.id) && 
              guildMember.id !== member.id &&
              !guildMember.user.bot
            )
            .map(guildMember => ({
              id: guildMember.id,
              displayName: guildMember.displayName,
              username: guildMember.user.username
            }))
            .slice(0, 25);
          
          // If no users are available for block, return a helpful message
          if (users.length === 0) {
            return {
              success: false,
              message: 'No users are available to block. Users must be online and not already blocked. Try again when more users are online.'
            };
          }
        } catch (memberError) {
          console.error('Error fetching members for block dropdown:', memberError);
          return {
            success: false,
            message: 'Failed to fetch server members. Please try again later.'
          };
        }
        break;
        
      case 'unblock':
        // Show only blocked users
        placeholder = 'Select a user to unblock...';
        const blockedUsers = await Promise.all(
          tempChannel.settings.blockedUsers.map(async userId => {
            try {
              // Try to get from cache first
              let user = guild.members.cache.get(userId);
              if (!user) {
                user = await guild.members.fetch(userId).catch(() => null);
              }
              return user ? {
                id: user.id,
                displayName: user.displayName,
                username: user.user.username
              } : null;
            } catch (error) {
              return null;
            }
          })
        );
        users = blockedUsers.filter(user => user !== null);
        
        // If no users are available for unblock, return a helpful message
        if (users.length === 0) {
          return {
            success: false,
            message: 'No blocked users found. You need to block users first before you can unblock them.'
          };
        }
        break;
        
      case 'kick':
        // Show members in the channel except the owner
        placeholder = 'Select a user to kick...';
        users = channel.members
          .filter(channelMember => 
            channelMember.id !== member.id &&
            !channelMember.user.bot
          )
          .map(channelMember => ({
            id: channelMember.id,
            displayName: channelMember.displayName,
            username: channelMember.user.username
          }));
        
        // If no users are available for kick, return a helpful message
        if (users.length === 0) {
          return {
            success: false,
            message: 'No users are currently in your channel to kick. Wait until someone joins your channel.'
          };
        }
        break;
        
      case 'invite':
        // Show server members who aren't in the channel
        placeholder = 'Select a user to invite...';
        try {
          // Use cache first, then fetch only if needed
          let invitableMembers = guild.members.cache;
          
          // If cache is too small, try to fetch some members
          if (invitableMembers.size < 10) {
            try {
              // Set a shorter timeout for fetching members
              const fetchedMembers = await guild.members.fetch({ 
                limit: 25,
                time: 5000 // 5 second timeout
              }).catch(() => null);
              
              if (fetchedMembers) {
                invitableMembers = fetchedMembers;
              }
            } catch (fetchError) {
              console.log('Using cached members due to fetch error:', fetchError);
            }
          }
          
          users = invitableMembers
            .filter(guildMember => 
              !channel.members.has(guildMember.id) && 
              !tempChannel.settings.blockedUsers.includes(guildMember.id) &&
              !guildMember.user.bot
            )
            .map(guildMember => ({
              id: guildMember.id,
              displayName: guildMember.displayName,
              username: guildMember.user.username
            }))
            .slice(0, 25);
          
          // If no users are available for invite, return a helpful message
          if (users.length === 0) {
            return {
              success: false,
              message: 'No users are available to invite. Users must be online, not already in the channel, and not blocked. Try again when more users are online.'
            };
          }
        } catch (memberError) {
          console.error('Error fetching members for invite dropdown:', memberError);
          return {
            success: false,
            message: 'Failed to fetch server members. Please try again later.'
          };
        }
        break;
        
      case 'transfer':
        // Show members in the channel except the owner
        placeholder = 'Select a user to transfer ownership to...';
        users = channel.members
          .filter(channelMember => 
            channelMember.id !== member.id &&
            !channelMember.user.bot
          )
          .map(channelMember => ({
            id: channelMember.id,
            displayName: channelMember.displayName,
            username: channelMember.user.username
          }));
        
        // If no users are available for transfer, return a helpful message
        if (users.length === 0) {
          return {
            success: false,
            message: 'No users are currently in your channel to transfer ownership to. Wait until someone joins your channel.'
          };
        }
        break;
    }

    // If no users are available, return an error
    if (users.length === 0) {
      return {
        success: false,
        message: `No users available for this action. ${actionType === 'trust' || actionType === 'block' || actionType === 'invite' ? 'Try again later when more users are online.' : ''}`
      };
    }

    // Create the dropdown menu
    const select = new StringSelectMenuBuilder()
      .setCustomId(`user_select_${actionType}`)
      .setPlaceholder(placeholder);

    // Add options to the dropdown
    users.forEach(user => {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${user.displayName}`)
          .setDescription(`@${user.username}`)
          .setValue(user.id)
      );
    });

    // Create the action row with the dropdown
    const row = new ActionRowBuilder().addComponents(select);

    return {
      success: true,
      components: [row]
    };
  } catch (error) {
    console.error(`Error creating ${actionType} dropdown:`, error);
    return {
      success: false,
      message: `An error occurred while creating the user selection dropdown. Please try again later.`
    };
  }
}

module.exports = {
  trustUser,
  untrustUser,
  blockUser,
  unblockUser,
  kickUser,
  inviteUser,
  transferOwnership,
  claimOwnership,
  createUserSelectionModal,
  createUserSelectionDropdown
}; 