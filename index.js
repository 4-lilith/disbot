const { Client, GatewayIntentBits, Events, InteractionType, WebhookClient, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot is ready! Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);
  console.log('🎯 Ready to respond to slash commands!');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'ping') {
      await interaction.reply({
        content: `🏓 Pong! Latency: ${client.ws.ping}ms`,
        ephemeral: false
      });
    }
    
    else if (commandName === 'help') {
      const helpMessage = `
📋 **Available Commands**

**Basic Commands:**
\`/ping\` - Check bot latency
\`/help\` - Show this help message
\`/roll\` - Roll a dice (1-6)
\`/coinflip\` - Flip a coin
\`/random\` - Generate a random number (1-100)

**Webhook Commands:**
\`/webhook-send\` - Send a message via webhook
\`/webhook-embed\` - Send a rich embed via webhook
\`/webhook-info\` - Get webhook information

💡 **Active Developer Badge**
Use any command to contribute to your Active Developer Badge eligibility!
      `.trim();
      
      await interaction.reply({
        content: helpMessage,
        ephemeral: false
      });
    }
    
    else if (commandName === 'roll') {
      const roll = Math.floor(Math.random() * 6) + 1;
      await interaction.reply({
        content: `🎲 You rolled a **${roll}**!`,
        ephemeral: false
      });
    }
    
    else if (commandName === 'coinflip') {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const emoji = result === 'Heads' ? '🪙' : '💿';
      await interaction.reply({
        content: `${emoji} The coin landed on **${result}**!`,
        ephemeral: false
      });
    }
    
    else if (commandName === 'random') {
      const number = Math.floor(Math.random() * 100) + 1;
      await interaction.reply({
        content: `🎰 Random number: **${number}**`,
        ephemeral: false
      });
    }
    
    else if (commandName === 'webhook-send') {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      
      if (!webhookUrl) {
        await interaction.reply({
          content: '❌ Webhook URL is not configured! Please add DISCORD_WEBHOOK_URL to your secrets.',
          ephemeral: true
        });
        return;
      }
      
      const message = interaction.options.getString('message');
      const username = interaction.options.getString('username') || 'Webhook Bot';
      
      try {
        const webhook = new WebhookClient({ url: webhookUrl });
        await webhook.send({
          content: message,
          username: username,
        });
        
        await interaction.reply({
          content: '✅ Message sent via webhook successfully!',
          ephemeral: true
        });
      } catch (error) {
        console.error('Webhook send error:', error);
        await interaction.reply({
          content: '❌ Failed to send webhook message. Check your webhook URL.',
          ephemeral: true
        });
      }
    }
    
    else if (commandName === 'webhook-embed') {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      
      if (!webhookUrl) {
        await interaction.reply({
          content: '❌ Webhook URL is not configured! Please add DISCORD_WEBHOOK_URL to your secrets.',
          ephemeral: true
        });
        return;
      }
      
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color') || '#0099ff';
      const username = interaction.options.getString('username') || 'Webhook Bot';
      
      try {
        const webhook = new WebhookClient({ url: webhookUrl });
        
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(color)
          .setTimestamp();
        
        await webhook.send({
          username: username,
          embeds: [embed],
        });
        
        await interaction.reply({
          content: '✅ Embed sent via webhook successfully!',
          ephemeral: true
        });
      } catch (error) {
        console.error('Webhook embed error:', error);
        await interaction.reply({
          content: '❌ Failed to send webhook embed. Check your webhook URL and color format.',
          ephemeral: true
        });
      }
    }
    
    else if (commandName === 'webhook-info') {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      
      if (!webhookUrl) {
        await interaction.reply({
          content: '❌ Webhook URL is not configured! Please add DISCORD_WEBHOOK_URL to your secrets.',
          ephemeral: true
        });
        return;
      }
      
      try {
        const webhookParts = webhookUrl.match(/webhooks\/(\d+)\/([^/]+)/);
        if (!webhookParts) {
          throw new Error('Invalid webhook URL format');
        }
        
        const [, webhookId, webhookToken] = webhookParts;
        const webhook = await client.fetchWebhook(webhookId, webhookToken);
        
        const infoMessage = `
📡 **Webhook Information**

**Name:** ${webhook.name}
**Channel:** <#${webhook.channelId}>
**ID:** ${webhook.id}
**Avatar:** ${webhook.avatar ? 'Set' : 'Not set'}
**Created:** <t:${Math.floor(webhook.createdTimestamp / 1000)}:R>
        `.trim();
        
        await interaction.reply({
          content: infoMessage,
          ephemeral: true
        });
      } catch (error) {
        console.error('Webhook info error:', error);
        await interaction.reply({
          content: '❌ Failed to fetch webhook info. Check your webhook URL.',
          ephemeral: true
        });
      }
    }
  } catch (error) {
    console.error('Error handling command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while executing this command.',
        ephemeral: true
      });
    }
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('❌ ERROR: DISCORD_BOT_TOKEN is not set in environment variables!');
  console.error('Please set up your Discord bot token in the Replit Secrets.');
  process.exit(1);
}

client.login(token).catch((error) => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});
