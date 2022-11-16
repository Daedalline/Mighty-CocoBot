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
    
    var userID = interaction.options.getUser('user').id;
    await interaction.deferReply();
    
    if(interaction.options.getSubcommand() == "server_rules"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Server Rules")
        .setDescription(`Hello **<@${userID}>**. Here is a link to the server rules.
        <https://discord.com/channels/752022800562389015/840645351291486218/1012442929496858704>
        `);
        return await interaction.editReply({embeds: [embed]});
    }
    else if(interaction.options.getSubcommand() == "leaderboard_rules"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Leaderboard Rules")
        .setDescription(`Hello **<@${userID}>**. Here is a link to the leaderboard rules.
        <https://discord.com/channels/752022800562389015/966336175843446886/1019302410075783220>
        `);
        return await interaction.editReply({embeds: [embed]});        
    }
    else if(interaction.options.getSubcommand() == "daily_challenge_rules"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Daily Challenge Rules")
        .setDescription(`Hello **<@${userID}>**. Here is a link to the daily challenge rules.
        <https://discord.com/channels/752022800562389015/875720382844387328/875794061997539371>
        `);
        return await interaction.editReply({embeds: [embed]});        
    }
    else if(interaction.options.getSubcommand() == "tournament_rules"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Daily Challenge Rules")
        .setDescription(`Hello **<@${userID}>**. Here is a link to the tournament rules.
        <https://discord.com/channels/752022800562389015/763542150877020190/1016821272996491265>
        `);
        return await interaction.editReply({embeds: [embed]});        
    } 
}

module.exports.info = {
    "name": "rules",
    "description": "Print out a message with the rules, greeting the user given",
    "options": [
        {
            "name": "server_rules",
            "description": "Sends the user a message with a link to the server rules.",
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
            "description": "Sends the user a message with a link to the leaderboard rules.",
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
            "description": "Sends the user a message with a link to the daily challenge rules.",
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
            "name": "tournament_rules",
            "description": "Sends the user a message with a link to the tournament rules.",
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