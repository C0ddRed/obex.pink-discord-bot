// Security
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const API_KEY = process.env.API_KEY;

// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Require the necessary of http requests
const request = require('request');

// logger
client.once('ready', () => {
	console.log('Ready!');
});

const { SlashCommandBuilder, Routes, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [
	new SlashCommandBuilder()
	.setName('generate')
	.setDescription('This function allows you to generate license keys for your script user/beta/debug.'),
	
	new SlashCommandBuilder()
	.setName('lockup')
	.setDescription('This function allows you to look up users of your script by providing a username.')
	.addStringOption(option =>
        option.setName("lockup")
            .setDescription("username")
    ),
	
	new SlashCommandBuilder()
	.setName('remove')
	.setDescription('This function allows you to remove or delete users from your script.')
	.addStringOption(option =>
        option.setName("remove")
            .setDescription("username")
    ),
	
	new SlashCommandBuilder()
	.setName('blacklist')
	.setDescription('This function allows you to basically ban users from your script.')
	.addStringOption(option =>
        option.setName("blacklist")
            .setDescription("username")
    )
	.addStringOption(option =>
        option.setName("reason")
           .setDescription("reason")
    ),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'generate') {
		const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(
						{
							label: 'User',
							description: 'Generate User build',
							value: 'live',
						},
						{
							label: 'Beta',
							description: 'Generate Beta build',
							value: 'beta',
						},
						{
							label: 'Debug',
							description: 'Generate Debug build',
							value: 'debug',
						},
					),
			);

		await interaction.reply({ content: 'Chose build', components: [row] });

		client.on('interactionCreate', async interaction => {
		if (!interaction.isSelectMenu()) return;
           if (interaction.values[0] == "live") {
				request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'generate', key_type: 'user' } }, async (error, response, body) => {
					if (error) {
						await interaction.reply(`${error}`);
						return;
					}
					
					if (body.includes('Invalid request')) {
						await interaction.reply(`${body}`);
						return;
					}

					await interaction.reply(`Key: ${body} l Build: User`);	
				})
            }
			if (interaction.values[0] == "beta") {
				request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'generate', key_type: 'beta' } }, async (error, response, body) => {
					if (error) {
						await interaction.reply(`${error}`);
						return;
					}
					
					if (body.includes('Invalid request')) {
						await interaction.reply(`${body}`);
						return;
					}
					
					await interaction.reply(`Key: ${body} l Build: Beta`);
				})
            }
			if (interaction.values[0] == "debug") {
				request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'generate', key_type: 'debug' } }, async (error, response, body) => {
					if (error) {
						await interaction.reply(`${error}`);
						return;
					}
					
					if (body.includes('Invalid request')) {
						await interaction.reply(`${body}`);
						return;
					}
					
					await interaction.reply(`Key: ${body} l Build: Debug`);
				})
            }							
		});
	} else if (commandName === 'lockup') {
		const user = interaction.options.getString("lockup");
		request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'lookup', username: user } }, async (error, response, body) => {
			if (error) {
				await interaction.reply(`${error}`);
				return;
			}
			
			if (body.includes('Invalid request')) {
				await interaction.reply(`${body}`);
				return;
			}
			
			const data = JSON.parse(body)			
			await interaction.reply(`Username: ${data.Username} l ID: ${data.Id} l Script: ${data.Script} l Build: ${data.Build} l Serials: ${data.Serials} l Blacklist: ${data.Blacklist} `);
		})
	} else if (commandName === 'remove') {
		const user = interaction.options.getString("remove");
		request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'remove', username: user } }, async (error, response, body) => {
			if (error) {
				await interaction.reply(`${error}`);
				return;
			}
			
			if (body.includes('Invalid request')) {
				await interaction.reply(`${body}`);
				return;
			}
			
			await interaction.reply(`${body}`);
		})
	} else if (commandName === 'blacklist') {
		const user = interaction.options.getString("blacklist");
		const reason_b = interaction.options.getString("reason");
		request.post('https://obex.pink/api/interact.php', { form: { api_key: API_KEY, req_type: 'blacklist', username: user, reason: reason_b } }, async (error, response, body) => {
			if (error) {
				await interaction.reply(`${error}`);
				return;
			}
			
			if (body.includes('Invalid request')) {
				await interaction.reply(`${body}`);
				return;
			}
			
			await interaction.reply(`${body}`);
		})		
	}
});

// Login to Discord with your client's token
client.login(TOKEN);