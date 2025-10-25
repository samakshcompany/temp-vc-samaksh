# TempVoice Discord Bot

A Discord bot for creating and managing temporary voice channels, created by Coders Planet.

## Features

- Create temporary voice channels that delete when empty
- Manage channels with an easy-to-use interface
- Control privacy, user limits, and channel settings
- Manage users (invite, kick, trust, block)
- Transfer or claim channel ownership
- All settings automatically saved
- Simple website showing developer information

## Quick Setup

1. Clone repository and run `npm install`
2. Create `.env` file with:
   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_server_id
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```
3. Deploy commands and start bot: `npm start`

## Website

The bot includes a simple website that displays developer information. When you start the bot with `npm start`, the website will be available at `http://localhost:3000` (or the port you specified in the .env file).

## How to Use

1. Run `/setup` command and choose interface type
2. Join the Creator Channel to make your own voice channel
3. Use the Interface Channel to manage your voice channel

## Channel Management Options

- **NAME** - Rename channel
- **LIMIT** - Set user limit
- **PRIVACY** - Lock/unlock channel
- **WAITING ROOM** - Create waiting room
- **THREAD** - Create thread
- **TRUST/UNTRUST** - Manage trusted users
- **INVITE/KICK** - Manage channel members
- **REGION** - Change voice region
- **BLOCK/UNBLOCK** - Manage blocked users
- **CLAIM/TRANSFER** - Manage ownership
- **DELETE** - Remove channel

## License

MIT License with Attribution Requirement and No Commercial Sale

- This software is created by Coders Planet
- You must credit Coders Planet as the original author in any project using this code
- You must provide attribution in any media featuring this code
- Commercial sale of this software or derivative works is prohibited without explicit permission

## Creator

This project is developed and maintained by Coders Planet.