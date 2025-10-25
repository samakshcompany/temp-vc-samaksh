const { Events, InteractionType } = require('discord.js');
const { handleButtonInteraction } = require('../utils/buttonHandler');
const { handleModalSubmit } = require('../utils/modalHandler');
const { handleSelectMenuInteraction } = require('../utils/selectMenuHandler');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`);
          return;
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(`Error executing ${interaction.commandName}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'Command Error', 
                  'There was an error while executing this command!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'Command Error', 
                  'There was an error while executing this command!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`Failed to send error response for command ${interaction.commandName}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle button interactions
      else if (interaction.isButton()) {
        try {
          await handleButtonInteraction(interaction);
        } catch (error) {
          console.error(`Error handling button interaction: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
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
            console.error(`Failed to send error response for button ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        try {
          // Check if this is a user selection menu
          if (interaction.customId.startsWith('user_select_')) {
            await handleSelectMenuInteraction(interaction);
          }
        } catch (error) {
          console.error(`Error handling select menu interaction: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'Selection Error', 
                  'There was an error while processing your selection!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'Selection Error', 
                  'There was an error while processing your selection!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`Failed to send error response for select menu ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle modal submissions
      else if (interaction.type === InteractionType.ModalSubmit) {
        try {
          await handleModalSubmit(interaction);
        } catch (error) {
          console.error(`Error handling modal submission: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'Submission Error', 
                  'There was an error while processing your submission!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'Submission Error', 
                  'There was an error while processing your submission!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`Failed to send error response for modal ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
    } catch (globalError) {
      // Global error handler for any unexpected errors
      console.error('Unhandled error in interaction handler:', globalError);
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            embeds: [createErrorEmbed(
              'Unexpected Error', 
              'An unexpected error occurred while processing your interaction. Please try again later.',
              globalError.message
            )],
            ephemeral: true 
          });
        }
      } catch (finalError) {
        console.error('Failed to send final error response:', finalError);
      }
    }
  }
}; 