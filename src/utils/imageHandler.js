const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('discord.js');

// Function to get the interface image
function getInterfaceImage() {
  const imagePath = path.join(__dirname, '../assets/Interface.webp');
  
  // Check if the image exists
  if (fs.existsSync(imagePath)) {
    const attachment = new AttachmentBuilder(imagePath, { name: 'Interface.webp' });
    attachment.name = 'Interface.webp';
    return attachment;
  }
  
  // Try alternative image formats if webp doesn't exist
  const pngPath = path.join(__dirname, '../assets/interface.png');
  if (fs.existsSync(pngPath)) {
    const attachment = new AttachmentBuilder(pngPath, { name: 'interface.png' });
    attachment.name = 'interface.png';
    return attachment;
  }
  
  const jpgPath = path.join(__dirname, '../assets/interface.jpg');
  if (fs.existsSync(jpgPath)) {
    const attachment = new AttachmentBuilder(jpgPath, { name: 'interface.jpg' });
    attachment.name = 'interface.jpg';
    return attachment;
  }
  
  return null;
}

module.exports = { getInterfaceImage }; 