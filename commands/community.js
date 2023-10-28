/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com/Daedalline
 * ============================================
 */

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");

module.exports.run = async(interaction, config, maps, client) => {
    
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)
    
    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }
   
    let rawdata = await fs.readFileSync('community_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    
}

module.exports.autocomplete = async (interaction) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'status': {
            const choices = ['Active', 'Complete', 'Not Completed'];
        }
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    }
}

module.exports.info = {
    "name": "community",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "create_challenge",
            "description": "Adds a new community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "emojii",
                    "description": "Emojii to represent this challenge",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "dates",
                    "description": "When this challenge was active",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "num_required",
                    "description": "Number of completions required",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "status",
                    "description": "Is this challenge active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
    ]
};