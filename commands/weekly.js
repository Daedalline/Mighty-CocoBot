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
   
    let rawdata = await fs.readFileSync('weekly_leaderboards_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    if(interaction.options.getSubcommand() == "add"){
        var userID = interaction.options.getUser('user').id
        var points = interaction.options.getInteger('points')
        
        await interaction.deferReply();
        
        if(!challenge_data[userID]){
            challenge_data[userID] = { 
              "Current Season": {
                "Points": points
              }
            }
        }
        else {
            challenge_data[userID]["Current Season"]["Points"] = challenge_data[userID]["Current Season"]["Points"] + points;
        }
        
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./weekly_leaderboards_data.json', writedata);
            
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Added **${points}** points for <@${userID}>`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if (interaction.options.getSubcommand() == "clear_seasonal") {
        await interaction.deferReply();
        
        for (var userID in challenge_data) {
            challenge_data[userID]["Current Season"]["Points"] = 0;
        }
        
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./weekly_leaderboards_data.json', writedata);
            
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Cleared all seasonal daily leaderboard stats`);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "weekly",
    "description": "Allows moderators to manage weekly leaderboard stats on the boards",
    "options": [
        {
            "name": "add",
            "description": "Increments a user's weekly leaderboard stats by the given number of points.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "points",
                    "description": "Number of points to add",
                    "type": 4,
                    "required": true
                }
            ]
        },
        {
            "name": "clear_seasonal",
            "description": "Removes all seasonal daily leaderboard statistics for every user",
            "type": 1
        }
    ]
};