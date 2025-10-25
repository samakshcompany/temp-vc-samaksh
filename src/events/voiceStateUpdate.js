const { Events } = require('discord.js');
const TempVoiceSettings = require('../models/TempVoiceSettings');
const TempVoiceChannel = require('../models/TempVoiceChannel');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    // Get the guild from either state
    const guild = oldState.guild || newState.guild;
    
    try {
      // Check if user joined a voice channel
      if (!oldState.channelId && newState.channelId) {
        // Find settings for this guild
        const settings = await TempVoiceSettings.findOne({ guildId: guild.id });
        if (!settings) return;
        
        // Check if user joined the creator channel
        if (newState.channelId === settings.creatorChannelId) {
          // Create a new temporary voice channel
          await createTemporaryVoiceChannel(newState, settings);
        }
      }
      
      // Check if a user left a voice channel
      if (oldState.channelId && !newState.channelId) {
        // Check if the channel was a temporary voice channel
        const tempChannel = await TempVoiceChannel.findOne({ channelId: oldState.channelId });
        if (!tempChannel) return;
        
        // Get the channel
        const channel = guild.channels.cache.get(oldState.channelId);
        if (!channel) return;
        
        // If the channel is empty, delete it
        if (channel.members.size === 0) {
          await channel.delete('Temporary voice channel is empty');
          await TempVoiceChannel.deleteOne({ channelId: oldState.channelId });
        }
      }
    } catch (error) {
      console.error('Error in voice state update handler:', error);
    }
  }
};

async function createTemporaryVoiceChannel(state, settings) {
  const { member, guild, client } = state;
  
  try {
    // Get the category
    const category = guild.channels.cache.get(settings.categoryId);
    if (!category) return;
    
    // Create a new voice channel
    const channelName = `${member.displayName}'s Channel`;
    const channel = await guild.channels.create({
      name: channelName,
      type: 2, // Voice channel
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: ['Connect', 'Speak']
        },
        {
          id: member.id,
          allow: ['Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'ManageChannels']
        },
        {
          id: client.user.id,
          allow: ['Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'ManageChannels']
        }
      ]
    });
    
    // Move the user to the new channel
    await member.voice.setChannel(channel);
    
    // Save the channel to the database
    const tempChannel = new TempVoiceChannel({
      guildId: guild.id,
      channelId: channel.id,
      ownerId: member.id,
      name: channelName
    });
    
    await tempChannel.save();
    
    // Send a message to the user
    await member.send({
      content: `I've created a temporary voice channel for you: **${channelName}**\n` +
               `You can manage your channel in the interface channel.`
    }).catch(() => {}); // Ignore if DMs are closed
    
  } catch (error) {
    console.error('Error creating temporary voice channel:', error);
  }
} 