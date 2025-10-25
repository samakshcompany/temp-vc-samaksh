const TempVoiceSettings = require('../models/TempVoiceSettings');

// Function to verify if the setup is still valid
async function verifySetup(guild) {
  try {
    // Get settings
    const settings = await TempVoiceSettings.findOne({ guildId: guild.id });
    if (!settings) return { valid: false, reason: 'No settings found' };

    // Check if category exists
    const category = guild.channels.cache.get(settings.categoryId);
    if (!category) return { valid: false, reason: 'Category not found' };

    // Check if creator channel exists
    const creatorChannel = guild.channels.cache.get(settings.creatorChannelId);
    if (!creatorChannel) return { valid: false, reason: 'Creator channel not found' };

    // Check if interface channel exists
    const interfaceChannel = guild.channels.cache.get(settings.interfaceChannelId);
    if (!interfaceChannel) return { valid: false, reason: 'Interface channel not found' };

    // All checks passed
    return { valid: true, settings };
  } catch (error) {
    console.error('Error verifying setup:', error);
    return { valid: false, reason: 'Error verifying setup' };
  }
}

// Function to clean up invalid setup
async function cleanupInvalidSetup(guild) {
  try {
    // Delete settings
    await TempVoiceSettings.deleteOne({ guildId: guild.id });
    return true;
  } catch (error) {
    console.error('Error cleaning up invalid setup:', error);
    return false;
  }
}

module.exports = { verifySetup, cleanupInvalidSetup }; 