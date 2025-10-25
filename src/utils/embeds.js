const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

// Setup command embed
function createSetupEmbed(interfaceType = 'standard') {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🎮 TempVoice Setup')
    .setDescription('Welcome to TempVoice! This powerful system allows users to create and manage their own temporary voice channels.')
    .addFields(
      { 
        name: '🔧 Setup Complete', 
        value: 'The TempVoice system has been successfully configured in this server.', 
        inline: false 
      },
      { 
        name: '📋 Instructions', 
        value: 
          '1. Join the designated creation channel\n' +
          '2. A personal voice channel will be created for you\n' +
          '3. Use the control panel to customize your channel\n' +
          '4. The channel will be deleted when everyone leaves',
        inline: false 
      },
      {
        name: '✨ Features',
        value:
          '• Rename your channel\n' +
          '• Set user limits\n' +
          '• Control privacy settings\n' +
          '• Manage user permissions\n' +
          '• Create text threads\n' +
          '• And much more!',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'TempVoice • Setup Complete', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

  if (interfaceType === 'advanced') {
    embed.addFields({
      name: '⚙️ Advanced Mode',
      value: 'This server is using the advanced interface with additional features and customization options.',
      inline: false
    });
  }

  return embed;
}

// Setup buttons
function createSetupButtons() {
  const setupButton = new ButtonBuilder()
    .setCustomId('setup_tempvoice')
    .setLabel('Standard Setup')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🎮');

  const setupAdvancedButton = new ButtonBuilder()
    .setCustomId('setup_tempvoice_original')
    .setLabel('Advanced Setup')
    .setStyle(ButtonStyle.Success)
    .setEmoji('⚙️');

  return new ActionRowBuilder().addComponents(setupButton, setupAdvancedButton);
}

// Interface embed
function createInterfaceEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🎮 TempVoice Control Panel')
    .setDescription('Welcome to your voice channel control panel! Use the buttons below to customize your temporary voice channel experience.')
    .setTimestamp()
    .setFooter({ text: 'Click the buttons below to manage your voice channel', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
}

// Interface buttons
function createInterfaceButtons() {
  // Row 1 - Channel Management
  const nameButton = new ButtonBuilder()
    .setCustomId('voice_name')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✏️');

  const limitButton = new ButtonBuilder()
    .setCustomId('voice_limit')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('👥');

  const privacyButton = new ButtonBuilder()
    .setCustomId('voice_privacy')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🔐');

  const waitingRoomButton = new ButtonBuilder()
    .setCustomId('voice_waiting')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('⏳');

  const threadButton = new ButtonBuilder()
    .setCustomId('voice_thread')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('💬');

  // Row 2 - User Management
  const trustButton = new ButtonBuilder()
    .setCustomId('voice_trust')
    .setStyle(ButtonStyle.Success)
    .setEmoji('✅');

  const untrustButton = new ButtonBuilder()
    .setCustomId('voice_untrust')
    .setStyle(ButtonStyle.Success)
    .setEmoji('❌');

  const inviteButton = new ButtonBuilder()
    .setCustomId('voice_invite')
    .setStyle(ButtonStyle.Success)
    .setEmoji('📩');

  const kickButton = new ButtonBuilder()
    .setCustomId('voice_kick')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🚪');

  const regionButton = new ButtonBuilder()
    .setCustomId('voice_region')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🌍');

  // Row 3 - Advanced Controls
  const blockButton = new ButtonBuilder()
    .setCustomId('voice_block')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🚫');

  const unblockButton = new ButtonBuilder()
    .setCustomId('voice_unblock')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🔓');

  const claimButton = new ButtonBuilder()
    .setCustomId('voice_claim')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('👑');

  const transferButton = new ButtonBuilder()
    .setCustomId('voice_transfer')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🔄');

  const deleteButton = new ButtonBuilder()
    .setCustomId('voice_delete')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

  const row1 = new ActionRowBuilder().addComponents(nameButton, limitButton, privacyButton, waitingRoomButton, threadButton);
  const row2 = new ActionRowBuilder().addComponents(trustButton, untrustButton, inviteButton, kickButton, regionButton);
  const row3 = new ActionRowBuilder().addComponents(blockButton, unblockButton, claimButton, transferButton, deleteButton);

  return [row1, row2, row3];
}

// Voice channel control embed
function createVoiceControlEmbed(channel, owner) {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🎮 Voice Channel Controls')
    .setDescription(`Welcome to your voice channel control panel! This panel allows you to manage your temporary voice channel **${channel.name}**.`)
    .addFields(
      { 
        name: '👑 Channel Owner', 
        value: `<@${owner.id}>`, 
        inline: true 
      },
      { 
        name: '👥 Current Users', 
        value: `${channel.members.size} members`, 
        inline: true 
      },
      { 
        name: '🔒 Privacy Status', 
        value: channel.permissionsFor(channel.guild.roles.everyone).has(PermissionFlagsBits.Connect) ? '🔓 Public' : '🔐 Private', 
        inline: true 
      },
      {
        name: '💡 Available Actions',
        value: 'Use the buttons below to manage your voice channel. You can rename it, set user limits, manage privacy, and more!',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'TempVoice • Channel Controls', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
}

// Helper function to format time
function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let timeString = '';
  if (days > 0) timeString += `${days}d `;
  if (hours > 0) timeString += `${hours}h `;
  if (minutes > 0) timeString += `${minutes}m `;
  if (remainingSeconds > 0 || timeString === '') timeString += `${remainingSeconds}s`;
  
  return timeString.trim();
}

// Voice channel control buttons
function createVoiceControlButtons(isLocked) {
  // Lock/Unlock button with dynamic label and style
  const lockButton = new ButtonBuilder()
    .setCustomId('voice_lock')
    .setStyle(isLocked ? ButtonStyle.Success : ButtonStyle.Danger)
    .setEmoji(isLocked ? '🔓' : '🔐');

  // Channel management buttons
  const renameButton = new ButtonBuilder()
    .setCustomId('voice_rename')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✏️');

  const limitButton = new ButtonBuilder()
    .setCustomId('voice_limit')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('👥');

  // User management buttons
  const permissionButton = new ButtonBuilder()
    .setCustomId('voice_permission')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🛡️');

  const inviteButton = new ButtonBuilder()
    .setCustomId('voice_invite')
    .setStyle(ButtonStyle.Success)
    .setEmoji('📩');

  // Danger zone
  const deleteButton = new ButtonBuilder()
    .setCustomId('voice_delete')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

  // Create rows with logical grouping
  const row1 = new ActionRowBuilder().addComponents(lockButton, renameButton, limitButton);
  const row2 = new ActionRowBuilder().addComponents(permissionButton, inviteButton, deleteButton);

  return [row1, row2];
}

// Error embed
function createErrorEmbed(title, description, errorDetails = null) {
  const embed = new EmbedBuilder()
    .setColor('#F04747') // Discord red color
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (errorDetails) {
    embed.addFields({ name: 'Error Details', value: `\`\`\`${errorDetails}\`\`\``, inline: false });
  }

  return embed;
}

// Success embed
function createSuccessEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor('#43B581') // Discord green color
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(...fields);
  }

  return embed;
}

// Info embed
function createInfoEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(...fields);
  }

  return embed;
}

// Warning embed
function createWarningEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('#FAA61A') // Discord yellow/orange color
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Help embed
function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('📚 TempVoice Help Guide')
    .setDescription('Welcome to TempVoice! Here\'s how to use the voice channel control system:')
    .addFields(
      { 
        name: '🎮 Basic Controls', 
        value: 
          '✏️ **Name** - Customize your channel name\n' +
          '👥 **Limit** - Set user capacity (0 = unlimited)\n' +
          '🔐 **Privacy** - Toggle public/private access\n' +
          '⏳ **Waiting Room** - Create a waiting area for users\n' +
          '💬 **Thread** - Create a text thread for your voice channel',
        inline: false 
      },
      { 
        name: '👥 User Management', 
        value: 
          '✅ **Trust** - Give users special permissions in your channel\n' +
          '❌ **Untrust** - Remove special permissions\n' +
          '📩 **Invite** - Send invites to specific users\n' +
          '🚪 **Kick** - Remove users from your channel\n' +
          '🚫 **Block** - Prevent specific users from joining\n' +
          '🔓 **Unblock** - Remove user blocks',
        inline: false 
      },
      { 
        name: '⚙️ Advanced Settings', 
        value: 
          '🌍 **Region** - Change voice region for better connection\n' +
          '👑 **Claim** - Take ownership of inactive channels\n' +
          '🔄 **Transfer** - Give ownership to another user\n' +
          '🗑️ **Delete** - Remove your channel completely',
        inline: false 
      },
      {
        name: '💡 Tips',
        value: 
          '• You can only manage channels you own\n' +
          '• Trusted users can invite others but cannot change settings\n' +
          '• Channels are automatically deleted when empty\n' +
          '• Use dropdowns to select users for actions like trust/block',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'TempVoice • Help Guide', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
}

// Command help embed
function createCommandHelpEmbed(commandName, description, usage, examples = []) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle(`📚 Command: ${commandName}`)
    .setDescription(description)
    .addFields(
      { name: '📝 Usage', value: `\`\`\`${usage}\`\`\``, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'TempVoice • Command Help', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

  if (examples.length > 0) {
    embed.addFields({ 
      name: '💡 Examples', 
      value: examples.map(ex => `\`${ex}\``).join('\n'), 
      inline: false 
    });
  }

  return embed;
}

// Region selection embed
function createRegionSelectionEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🌍 Voice Region Selection')
    .setDescription('Select a voice region to optimize your connection quality. Choose the region closest to you or your members for the best experience.')
    .addFields(
      { 
        name: '🌎 Americas', 
        value: 
          '🇺🇸 **US West** - Western United States\n' +
          '🇺🇸 **US East** - Eastern United States\n' +
          '🇺🇸 **US Central** - Central United States\n' +
          '🇧🇷 **Brazil** - South America',
        inline: true 
      },
      { 
        name: '🌍 Europe & Africa', 
        value: 
          '🇬🇧 **London** - United Kingdom\n' +
          '🇪🇺 **Europe** - Central Europe\n' +
          '🇷🇺 **Russia** - Eastern Europe\n' +
          '🇿🇦 **South Africa** - Africa',
        inline: true 
      },
      { 
        name: '🌏 Asia & Oceania', 
        value: 
          '🇯🇵 **Japan** - Eastern Asia\n' +
          '🇰🇷 **South Korea** - Eastern Asia\n' +
          '🇮🇳 **India** - Southern Asia\n' +
          '🇦🇺 **Sydney** - Australia/Oceania\n' +
          '🇸🇬 **Singapore** - Southeast Asia',
        inline: true 
      },
      {
        name: '💡 Tips',
        value: 'If you experience connection issues, try selecting a region closer to the majority of your members. You can change this setting at any time.',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Select a region from the dropdown menu below', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
}

module.exports = {
  createSetupEmbed,
  createSetupButtons,
  createInterfaceEmbed,
  createInterfaceButtons,
  createVoiceControlEmbed,
  createVoiceControlButtons,
  createErrorEmbed,
  createSuccessEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createHelpEmbed,
  createCommandHelpEmbed,
  createRegionSelectionEmbed
};