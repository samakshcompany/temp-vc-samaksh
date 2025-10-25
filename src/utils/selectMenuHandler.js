const { 
  trustUser, 
  untrustUser, 
  blockUser, 
  unblockUser, 
  kickUser, 
  inviteUser, 
  transferOwnership 
} = require('./permissionHandler');
const { createSuccessEmbed, createErrorEmbed } = require('./embeds');

async function handleSelectMenuInteraction(interaction) {
  const { customId, values } = interaction;
  
  // Extract the action type from the customId (format: user_select_actionType)
  const actionType = customId.split('_')[2];
  
  // Get the selected user ID
  const userId = values[0];
  
  if (!userId) {
    try {
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'Selection Error', 
          'No user was selected. Please try again.'
        )],
        ephemeral: true
      });
    } catch (replyError) {
      console.error('Error replying to empty selection:', replyError);
      return;
    }
  }
  
  try {
    await interaction.deferReply({ ephemeral: true });
    
    let result;
    
    // Call the appropriate function based on the action type
    switch (actionType) {
      case 'trust':
        result = await trustUser(interaction, userId);
        break;
      case 'untrust':
        result = await untrustUser(interaction, userId);
        break;
      case 'block':
        result = await blockUser(interaction, userId);
        break;
      case 'unblock':
        result = await unblockUser(interaction, userId);
        break;
      case 'kick':
        result = await kickUser(interaction, userId);
        break;
      case 'invite':
        result = await inviteUser(interaction, userId);
        break;
      case 'transfer':
        result = await transferOwnership(interaction, userId);
        break;
      default:
        result = { success: false, message: 'Unknown action type.' };
    }
    
    // Reply with the result
    try {
      if (result.success) {
        await interaction.editReply({
          embeds: [createSuccessEmbed(
            `${capitalizeFirstLetter(actionType)} Successful`, 
            result.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            `${capitalizeFirstLetter(actionType)} Failed`, 
            result.message
          )],
          ephemeral: true
        });
      }
    } catch (responseError) {
      console.error(`Error sending response for ${actionType} selection:`, responseError);
      // At this point, we can't do anything more with this interaction
    }
  } catch (error) {
    console.error(`Error handling ${actionType} selection:`, error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            `${capitalizeFirstLetter(actionType)} Failed`, 
            `An error occurred while processing your selection. Please try again later.`,
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            `${capitalizeFirstLetter(actionType)} Failed`, 
            `An error occurred while processing your selection. Please try again later.`,
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (finalError) {
      console.error(`Failed to send error response for ${actionType} selection:`, finalError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { handleSelectMenuInteraction }; 