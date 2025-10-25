const { connectToDatabase } = require('../utils/database');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // Connect to MongoDB
    await connectToDatabase();
    
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Set bot status
    client.user.setPresence({
      activities: [{ name: 'Temporary Voice Channels', type: 2 }],
      status: 'online'
    });
  }
}; 