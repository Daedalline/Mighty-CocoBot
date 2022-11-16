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
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {
    
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)
    
    var userID = interaction.options.getUser('user').id
    
    if(interaction.options.getSubcommand() == "server_rules"){
        let embed = new MessageEmbed()
        .setTitle("Server Rules")
        .setDescription(`Hello **<@${userID}>**. Here is a reminder of the server rules.
        
        1.) Be kind, friendly, and respectful towards others. We will not tolerate any racism or derogatory attitudes.

        2.) Please do not spam the channels. Please do not spam/over message staff. Please do not abuse text formatting.

        3.) Post in the appropriate sections. Each channel has a description on top of the chat window.

        4.) Advertisement is not allowed unless it is content that is created for the game, such as fan page, videos, screenshots, etc.

        5.) All content posted has to be work-friendly. No pornographic, NSFW, religious or political discussions are allowed. Swearing is okay, but let's try and keep it PG-13.

        6.) You may only have one account on the Discord server. If your main profile is banned, you cannot join with another. If found you will be removed.

        7.) Please use English on all channels so we can all have a common language and can be moderated.

        8.) Report any issues directly to moderators as soon as possible. Do not try to address issues on your own. Please let the Moderators handle it.

        9.) No gambling of any form is allowed on this server.

        10.) Respect and follow the instructions from the staff. If they ask you to stop doing something, stop, even if the rules do not explicitly ban it. If a moderation action you do not agree with is made, try to resolve it with the moderator, but if no solution is given, feel free to contact Kaminsky with details.
        `)
        .setTimestamp();
        channel.send({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "leaderboard_rules"){
    }
    else if(interaction.options.getSubcommand() == "daily_challenge_rules"){
    }    
}

module.exports.info = {
    "name": "user",
    "description": "Print out a message with the rules, greeting the user given",
    "options": [
        {
            "name": "server_rules",
            "description": "Sends the user a message with the server rules.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to greet",
                    "type": 6,
                    "required": true
                }
            ]
        },
        {
            "name": "leaderboard_rules",
            "description": "Sends the user a message with the leaderboard rules.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to greet",
                    "type": 6,
                    "required": true
                }
            ]
        },
        {
            "name": "daily_challenge_rules",
            "description": "Sends the user a message with the daily challenge rules.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to greet",
                    "type": 6,
                    "required": true
                }
            ]
        }        
    ]
};