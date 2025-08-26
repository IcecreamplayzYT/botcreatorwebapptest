import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { botId } = await req.json();
    
    if (!botId) {
      return new Response(
        JSON.stringify({ error: 'Bot ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get bot data
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      console.error('Bot fetch error:', botError);
      return new Response(
        JSON.stringify({ error: 'Bot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get commands
    const { data: commands, error: commandsError } = await supabase
      .from('commands')
      .select('*')
      .eq('bot_id', botId);

    if (commandsError) {
      console.error('Commands fetch error:', commandsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch commands' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const { data: envVars, error: envError } = await supabase
      .from('env_vars')
      .select('*')
      .eq('bot_id', botId);

    if (envError) {
      console.error('Env vars fetch error:', envError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate file contents
    const files: { [key: string]: string } = {};

    // Generate package.json
    files['package.json'] = JSON.stringify({
      name: `serverspark-${bot.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
      version: '1.0.0',
      description: bot.description || 'Discord bot created with ServerSpark',
      main: 'index.js',
      type: 'commonjs',
      scripts: {
        start: 'node index.js',
        deploy: 'node deploy-commands.js'
      },
      dependencies: {
        'discord.js': '^14.16.3',
        'dotenv': '^16.4.5'
      },
      keywords: ['discord', 'bot', 'serverspark'],
      author: 'ServerSpark User'
    }, null, 2);

    // Generate index.js
    files['index.js'] = `require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Validate required environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ Missing DISCORD_TOKEN in .env file');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (command && command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(\`✅ Loaded command: \${command.data.name}\`);
    } else {
      console.warn(\`⚠️ Invalid command file: \${file}\`);
    }
  }
}

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(\`❌ Command not found: \${interaction.commandName}\`);
    return;
  }

  try {
    await command.execute(interaction);
    console.log(\`✅ Executed command: \${interaction.commandName} by \${interaction.user.tag}\`);
  } catch (error) {
    console.error(\`❌ Error executing \${interaction.commandName}:\`, error);
    
    const errorReply = { 
      content: 'There was an error while executing this command!', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
});

// Bot ready event
client.once('ready', () => {
  console.log(\`🚀 \${bot.name || 'ServerSpark Bot'} is online!\`);
  console.log(\`📊 Serving \${client.guilds.cache.size} guilds\`);
});

// Error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);`;

    // Generate deploy-commands.js
    files['deploy-commands.js'] = `require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (command && command.data) {
      commands.push(command.data.toJSON());
      console.log(\`✅ Prepared command: \${command.data.name}\`);
    }
  }
}

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env file');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(\`🚀 Deploying \${commands.length} application commands...\`);

    const route = process.env.GUILD_ID 
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    const data = await rest.put(route, { body: commands });

    console.log(\`✅ Successfully deployed \${data.length} commands \${process.env.GUILD_ID ? 'to guild' : 'globally'}\`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();`;

    // Generate commands
    if (commands && commands.length > 0) {
      for (const cmd of commands) {
        const fileName = `commands/${cmd.name.replace(/[^a-z0-9_-]/gi, '_')}.js`;
        const finalCode = cmd.user_code || cmd.generated_code || generateDefaultCommand(cmd);
        files[fileName] = finalCode;
      }
    } else {
      // Add a default ping command if no commands exist
      files['commands/ping.js'] = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
  }
};`;
    }

    // Generate .env.example
    const envExample = [
      '# Discord Bot Configuration',
      'DISCORD_TOKEN=your_bot_token_here',
      'CLIENT_ID=your_client_id_here',
      '# GUILD_ID=your_test_guild_id_here  # Optional: for faster testing',
      '',
      '# Additional Environment Variables'
    ];

    if (envVars && envVars.length > 0) {
      for (const envVar of envVars) {
        envExample.push(`${envVar.key}=# ${envVar.description || 'User defined variable'}`);
      }
    }

    files['.env.example'] = envExample.join('\n');

    // Generate README.md
    files['README.md'] = `# ${bot.name}

${bot.description || 'A Discord bot created with ServerSpark Test'}

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Discord bot token ([Get one here](https://discord.com/developers/applications))

### Local Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit \`.env\` and add your bot token and client ID.

3. **Deploy commands:**
   \`\`\`bash
   npm run deploy
   \`\`\`

4. **Start the bot:**
   \`\`\`bash
   npm start
   \`\`\`

### VPS Deployment

1. **Upload files to your server**
2. **Install Node.js and npm**
3. **Follow local setup steps**
4. **Use PM2 for production:**
   \`\`\`bash
   npm install -g pm2
   pm2 start index.js --name "${bot.name.toLowerCase()}"
   pm2 startup
   pm2 save
   \`\`\`

## 📝 Commands

${commands && commands.length > 0 ? 
  commands.map(cmd => `- **/${cmd.name}**: ${cmd.description || 'No description'}`).join('\n') :
  '- **/ping**: Test command'
}

## 🛠️ Built with ServerSpark Test

This bot was created using [ServerSpark Test](https://serverspark-test.com), a visual Discord bot builder.

## 📞 Support

If you need help with this bot, check the Discord.js documentation or join the Discord.js support server.
`;

    // Generate Dockerfile (optional)
    files['Dockerfile'] = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "start"]`;

    files['.gitignore'] = `# Dependencies
node_modules/

# Environment variables
.env

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# OS
.DS_Store
Thumbs.db`;

    return new Response(
      JSON.stringify({ files, botName: bot.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in export-bot-zip function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateDefaultCommand(cmd: any): string {
  return \`const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('\${cmd.name}')
    .setDescription('\${cmd.description || 'Generated command'}'),
  async execute(interaction) {
    // TODO: Implement command logic
    await interaction.reply({ 
      content: 'This command was generated by ServerSpark but needs implementation.', 
      ephemeral: true 
    });
  }
};\`;
}