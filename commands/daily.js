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
    
    var userID = interaction.options.getUser('user').id
	
    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }
	
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('challenge.json');
    let data = await JSON.parse(rawdata);
	
	// TODO
}

module.exports.info = {
    "name": "daily",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "add",
            "description": "Increments a user's daily challenge stats by one.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "stat",
                    "description": "Which statistic to increment",
                    "type": 3,
                    "required": true,
					"choices": ["Test1", "Test2"]
                }
            ]
        },
		{
            "name": "clear_monthly",
            "description": "Removes all 'monthly' statistics for every user",
            "type": 1
		}
    ]
};