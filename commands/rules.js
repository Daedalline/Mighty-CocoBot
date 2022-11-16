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
    
   
    if(interaction.options.getSubcommand() == "server_rules"){
        var content = `Here is a link to the server rules.
        <https://discord.com/channels/752022800562389015/840645351291486218/1012442929496858704>
        `;
        await interaction.reply({ content, ephemeral: true }); 
    }
    else if(interaction.options.getSubcommand() == "leaderboard_rules"){
        var content = `Here is a link to the leaderboard rules.
        <https://discord.com/channels/752022800562389015/966336175843446886/1019302410075783220>
        `;
        await interaction.reply({ content, ephemeral: true }); 
    }
    else if(interaction.options.getSubcommand() == "daily_challenge_rules"){
        var content = `Here is a link to the daily challenge rules.
        <https://discord.com/channels/752022800562389015/875720382844387328/875794061997539371>
        `;
        await interaction.reply({ content, ephemeral: true });     
    }
    else if(interaction.options.getSubcommand() == "tournament_rules"){
        var content = `Here is a link to the tournament rules.
        <https://discord.com/channels/752022800562389015/763542150877020190/1016821272996491265>
        `;
        await interaction.reply({ content, ephemeral: true }); 
    } 
}

module.exports.info = {
    "name": "rules",
    "description": "Print out a message with the rules, greeting the user given",
    "options": [
        {
            "name": "server_rules",
            "description": "Sends the user a message with a link to the server rules.",
            "type": 1
        },
        {
            "name": "leaderboard_rules",
            "description": "Sends the user a message with a link to the leaderboard rules.",
            "type": 1
        },
        {
            "name": "daily_challenge_rules",
            "description": "Sends the user a message with a link to the daily challenge rules.",
            "type": 1
        },
        {
            "name": "tournament_rules",
            "description": "Sends the user a message with a link to the tournament rules.",
            "type": 1
        }         
    ]
};