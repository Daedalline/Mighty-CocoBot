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
   
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    if(interaction.options.getSubcommand() == "add"){
        var userID = interaction.options.getUser('user').id
        var stat = interaction.options.getString('stat')
        var lifetimeOnly = interaction.options.getBoolean('lifetime_only');
        
        await interaction.deferReply();
        
        if(!challenge_data[userID]){
            challenge_data[userID] = { 
            "Current Season": {
                "Coolest Shot From the Tee": 0,
                "Coolest Shot From Another Tee": 0,
                "Completion Awards": 0,
                "Participation Awards": 0
            },
            "Lifetime": {
                "Coolest Shot From the Tee": 0,
                "Coolest Shot From Another Tee": 0,
                "Completion Awards": 0,
                "Participation Awards": 0
            },
            "Total Season Wins": {
                "First Place Finishes": 0,
                "Second Place Finishes": 0,
                "Third Place Finishes": 0
            },
            "Current Season 9-Hole": {
                "Top Score": 0,
                "Target Score and Time Achieved": 0,
                "Target Score Achieved": 0
            },
            "Lifetime 9-Hole": {
                "Top Score": 0,
                "Target Score and Time Achieved": 0,
                "Target Score Achieved": 0
            }
            }
        }
        
        switch(stat){
            case("Coolest Shot From the Tee"):
            case("Coolest Shot From Another Tee"):
            case("Completion Awards"):
            case("Participation Awards"):
                if (!lifetimeOnly) {
                    challenge_data[userID]["Current Season"][stat]++;
                }
                challenge_data[userID]["Lifetime"][stat]++;
                break;
            case("(Two Medals) Participation And Completion"):
                if (!lifetimeOnly) {
                    challenge_data[userID]["Current Season"]["Completion Awards"]++;
                    challenge_data[userID]["Current Season"]["Participation Awards"]++;
                }
                challenge_data[userID]["Lifetime"]["Completion Awards"]++;
                challenge_data[userID]["Lifetime"]["Participation Awards"]++;
                break;               
            case("Top Score"):
            case("Target Score and Time Achieved"):
            case("Target Score Achieved"):    
                if (!lifetimeOnly) {
                    challenge_data[userID]["Current Season 9-Hole"][stat]++;
                }
                challenge_data[userID]["Lifetime 9-Hole"][stat]++;
                break;
            case("(Two Medals) Target Score and Time Achieved"):
                if (!lifetimeOnly) {
                    challenge_data[userID]["Current Season 9-Hole"]["Target Score and Time Achieved"]++;
                    challenge_data[userID]["Current Season 9-Hole"]["Target Score Achieved"]++;
                }
                challenge_data[userID]["Lifetime 9-Hole"]["Target Score and Time Achieved"]++;
                challenge_data[userID]["Lifetime 9-Hole"]["Target Score Achieved"]++;
                break;     
            case("First Place Finishes"):
            case("Second Place Finishes"):
            case("Third Place Finishes"):
                challenge_data[userID]["Total Season Wins"][stat]++;
                break;
            default:
                console.log("Error in stat switch " + stat + ". This should never happen");
        }
        
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
            
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Incremented **${stat}** for <@${userID}>` + (lifetimeOnly ? " (Lifetime Only)" : ""));
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "remove"){
        var userID = interaction.options.getUser('user').id
        var stat = interaction.options.getString('stat')
        var lifetimeOnly = interaction.options.getBoolean('lifetime_only');
        
        await interaction.deferReply();
        
        if(!challenge_data[userID]){
            var embed = new Discord.MessageEmbed()
            .setTitle("Data Not Found")
            .setDescription(`<@${userID}> does not apear have a score for **${stat}**`);
            return await interaction.editReply({embeds: [embed]})
        }
        
        switch(stat){
            case("Coolest Shot From the Tee"):
            case("Coolest Shot From Another Tee"):
            case("Completion Awards"):
            case("Participation Awards"):
                if (lifetimeOnly) {
                    if (challenge_data[userID]["Lifetime"][stat] == 0){ 
                        var embed = new Discord.MessageEmbed()
                        .setTitle("Invalid Command")
                        .setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
                        return await interaction.editReply({embeds: [embed]})
                    }
                    else {
                        challenge_data[userID]["Lifetime"][stat]--;
                        break;
                    }
                }
                else {
                    if (challenge_data[userID]["Current Season"][stat] == 0 || challenge_data[userID]["Lifetime"][stat] == 0){ 
                        var embed = new Discord.MessageEmbed()
                        .setTitle("Invalid Command")
                        .setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
                        return await interaction.editReply({embeds: [embed]})
                    }
                    else {
                        challenge_data[userID]["Current Season"][stat]--;
                        challenge_data[userID]["Lifetime"][stat]--;
                        break;
                    }
                }
            case("Top Score"):
            case("Target Score and Time Achieved"):
            case("Target Score Achieved"):  
                if (lifetimeOnly) {
                    if (challenge_data[userID]["Lifetime 9-Hole"][stat] == 0){ 
                        var embed = new Discord.MessageEmbed()
                        .setTitle("Invalid Command")
                        .setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
                        return await interaction.editReply({embeds: [embed]})
                    }
                    else {
                        challenge_data[userID]["Lifetime 9-Hole"][stat]--;
                        break;
                    }
                }
                else {
                    if (challenge_data[userID]["Current Season 9-Hole"][stat] == 0 || challenge_data[userID]["Lifetime 9-Hole"][stat] == 0){ 
                        var embed = new Discord.MessageEmbed()
                        .setTitle("Invalid Command")
                        .setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
                        return await interaction.editReply({embeds: [embed]})
                    }
                    else {
                        challenge_data[userID]["Current Season 9-Hole"][stat]--;
                        challenge_data[userID]["Lifetime 9-Hole"][stat]--;
                        break;
                    }
                }            
            case("First Place Finishes"):
            case("Second Place Finishes"):
            case("Third Place Finishes"):
                if (challenge_data[userID]["Total Season Wins"][stat] == 0) {
                    var embed = new Discord.MessageEmbed()
                    .setTitle("Invalid Command")
                    .setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
                    return await interaction.editReply({embeds: [embed]})
                }
                else {
                    challenge_data[userID]["Total Season Wins"][stat]--;
                    break;
                }
            default:
                console.log("Error in stat switch " + stat + ". This should never happen");
        }
        
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
                
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Decremented **${stat}** for <@${userID}>` + (lifetimeOnly ? " (Lifetime Only)" : ""));
        return await interaction.editReply({embeds: [embed]})
    }
    else if (interaction.options.getSubcommand() == "clear_seasonal") {
        await interaction.deferReply();
        
        for (var userID in challenge_data) {
            challenge_data[userID]["Current Season"]["Coolest Shot From the Tee"] = 0;
            challenge_data[userID]["Current Season"]["Coolest Shot From Another Tee"] = 0;
            challenge_data[userID]["Current Season"]["Completion Awards"] = 0;
            challenge_data[userID]["Current Season"]["Participation Awards"] = 0;
            challenge_data[userID]["Current Season 9-Hole"]["Top Score"] = 0;
            challenge_data[userID]["Current Season 9-Hole"]["Target Score and Time Achieved"] = 0;
            challenge_data[userID]["Current Season 9-Hole"]["Target Score Achieved"] = 0;
        }
        
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
            
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Cleared all seasonal daily challenge stats`);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "daily",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "add",
            "description": "Increments a user's daily challenge stats by one (both seasonal and lifetime).",
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
                    "choices": [
                        {
                            "name": "Coolest Shot From the Tee",
                            "value": "Coolest Shot From the Tee"
                        },
                        {
                            "name": "Coolest Shot From Another Tee",
                            "value": "Coolest Shot From Another Tee"
                        },
                        {
                            "name": "(Two Medals) Participation And Completion",
                            "value": "(Two Medals) Participation And Completion"
                        },  
                        {
                            "name": "Completion Awards",
                            "value": "Completion Awards"
                        },
                        {
                            "name": "Participation Awards",
                            "value": "Participation Awards"
                        },
                        {
                            "name": "Top Score",
                            "value": "Top Score"
                        },
                        {
                            "name": "(Two Medals) Target Score and Time Achieved",
                            "value": "(Two Medals) Target Score and Time Achieved"
                        },  
                        {
                            "name": "Target Score Achieved",
                            "value": "Target Score Achieved"
                        },
                        {
                            "name": "Target Score and Time Achieved",
                            "value": "Target Score and Time Achieved"
                        },
                        {
                            "name": "First Place Finishes",
                            "value": "First Place Finishes"
                        },
                        {
                            "name": "Second Place Finishes",
                            "value": "Second Place Finishes"
                        },
                        {
                            "name": "Third Place Finishes",
                            "value": "Third Place Finishes"
                        }
                    ]
                },
                {
                    "name": "lifetime_only",
                    "description": "Only adjust the Lifetime totals",
                    "type": 5,
                    "required": true
                }
            ]
        },
        {
            "name": "remove",
            "description": "Decrements a user's daily challenge stats by one (both seasonal and lifetime).",
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
                    "choices": [
                        {
                            "name": "Coolest Shot From the Tee",
                            "value": "Coolest Shot From the Tee"
                        },
                        {
                            "name": "Coolest Shot From Another Tee",
                            "value": "Coolest Shot From Another Tee"
                        },
                        {
                            "name": "Completion Awards",
                            "value": "Completion Awards"
                        },
                        {
                            "name": "Participation Awards",
                            "value": "Participation Awards"
                        },
                        {
                            "name": "Target Score Achieved",
                            "value": "Target Score Achieved"
                        },
                        {
                            "name": "Target Score and Time Achieved",
                            "value": "Target Score and Time Achieved"
                        },
                        {
                            "name": "Top Score",
                            "value": "Top Score"
                        },
                        {
                            "name": "First Place Finishes",
                            "value": "First Place Finishes"
                        },
                        {
                            "name": "Second Place Finishes",
                            "value": "Second Place Finishes"
                        },
                        {
                            "name": "Third Place Finishes",
                            "value": "Third Place Finishes"
                        }
                    ]
                },
                {
                    "name": "lifetime_only",
                    "description": "Only adjust the Lifetime totals",
                    "type": 5,
                    "required": true
                }
            ]
        },
        {
            "name": "clear_seasonal",
            "description": "Removes all seasonal daily challenge statistics for every user",
            "type": 1
        }
    ]
};