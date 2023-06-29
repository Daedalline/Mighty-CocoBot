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

    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }

    let rawdata = await fs.readFileSync('speedrun_data.json');
    let data = await JSON.parse(rawdata); 

    if(interaction.options.getSubcommand() == "submit_range"){

        var userID = interaction.options.getUser('user').id;
        var map = interaction.options.getString('map');
        var startTimeString = interaction.options.getString('start_time');
        var endTimeString = interaction.options.getString('end_time');
        
        let timePattern = /\d{1,2}-\d{1,2}-\d{1,2}/;
        if (!timePattern.test(startTimeString) || !timePattern.test(endTimeString)){
            await interaction.reply({ephemeral: true, content: "Invalid time format. Time must be input in 24 hr format HH-mm-ss."})
            return;
        }
    
        var startTime = interaction.options.getString('start_time').split("-");
        var endTime = interaction.options.getString('end_time').split("-");

        await interaction.deferReply()
        
        if(!data[map]){
            data[map] = {}
        }
        
        var startTimeInSeconds = (Number(startTime[0]) * 3600) + (Number(startTime[1]) * 60) + (Number(startTime[2]));
        var endTimeInSeconds = (Number(endTime[0]) * 3600) + (Number(endTime[1]) * 60) + (Number(endTime[2]));
        var totalSeconds = endTimeInSeconds - startTimeInSeconds;
        
        if (totalSeconds < 0) 
        {
            totalSeconds = 86400 + totalSeconds;
        }
        
        if(data[map][userID] != undefined)
        {
            if(data[map][userID][0] <= totalSeconds)
            {
                var embed = new Discord.MessageEmbed()
                .setTitle("No Time Recorded")
                .setDescription(`This time is greater than the existing time of ` + data[map][userID][0] + " seconds.");
                return await interaction.editReply({embeds: [embed]})
            }
        }
        
        data[map][userID] = [totalSeconds, new Date().toJSON()]
        var writedata = JSON.stringify(data, null, "\t");
        await fs.writeFileSync('./speedrun_data.json', writedata);
        
        var date = new Date(null);
        date.setSeconds(totalSeconds);
        var timeString = date.toISOString().slice(11, 19);
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Time Recorded")
        .setDescription(`Recorded a time of **${timeString}** (${totalSeconds} seconds) for <@${userID}> on **${map}**`);
        return await interaction.editReply({embeds: [embed]})
    }
    
    if(interaction.options.getSubcommand() == "submit_time"){

        var userID = interaction.options.getUser('user').id;
        var map = interaction.options.getString('map');
        var time = interaction.options.getString('total_time');
        
        let timePattern = /\d{1,2}-\d{1,2}-\d{1,2}/;
        if (!timePattern.test(time)){
            await interaction.reply({ephemeral: true, content: "Invalid time format. Time must be input in 24 hr format HH-mm-ss."})
            return;
        }
    
        var totalTime = interaction.options.getString('time').split("-");

        await interaction.deferReply()
        
        if(!data[map]){
            data[map] = {}
        }
        
        var totalSeconds = (Number(totalTime[0]) * 3600) + (Number(totalTime[1]) * 60) + (Number(totalTime[2]));
        
        if (totalSeconds < 0) 
        {
            totalSeconds = 86400 + totalSeconds;
        }
        
        if(data[map][userID] != undefined)
        {
            if(data[map][userID][0] <= totalSeconds)
            {
                var embed = new Discord.MessageEmbed()
                .setTitle("No Time Recorded")
                .setDescription(`This time is greater than the existing time of ` + data[map][userID][0] + " seconds.");
                return await interaction.editReply({embeds: [embed]})
            }
        }
        
        data[map][userID] = [totalSeconds, new Date().toJSON()]
        var writedata = JSON.stringify(data, null, "\t");
        await fs.writeFileSync('./speedrun_data.json', writedata);
        
        var date = new Date(null);
        date.setSeconds(totalSeconds);
        var timeString = date.toISOString().slice(11, 19);
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Time Recorded")
        .setDescription(`Recorded a time of **${timeString}** (${totalSeconds} seconds) for <@${userID}> on **${map}**`);
        return await interaction.editReply({embeds: [embed]})
    }

    if(interaction.options.getSubcommand() == "remove"){

        var userID = interaction.options.getUser('user').id
        var map = interaction.options.getString('map')

        await interaction.deferReply()

        if(!data[map]){
            data[map] = {}
        }

        if(data[map][userID]){
            delete data[map][userID]
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./speedrun_data.json', writedata);
        
            var embed = new Discord.MessageEmbed()
            .setTitle("Score Removed")
            .setDescription(`Removed a score for <@${userID}> from **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }else{
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`<@${userID}> does not apear have a score on **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
};

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Leaderboards.forEach(map => {
                if((map.toLowerCase().includes(value.value.toLowerCase()) || value == "") && !map.startsWith("Weekly")){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "speedrun_scores",
    "description": "Allows moderators to manage scores on the boards",
    "options": [
        {
            "name": "submit_range",
            "description": "Submit a users speedrun score to a map by providing the Start and Current times.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "map",
                    "description": "The map they got it on",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                },
                {
                    "name": "start_time",
                    "description": "Time start (in 24 hr format HH-mm-ss)",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                },
                {
                    "name": "end_time",
                    "description": "Time finish (in 24 hr format HH-mm-ss)",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                },
            ]
        },
        {
            "name": "submit_time",
            "description": "Submit a users speedrun score to a map by providing the total time.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "map",
                    "description": "The map they got it on",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                },
                {
                    "name": "total_time",
                    "description": "Total Time (in 24 hr format HH-mm-ss)",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                },
            ]
        },
        {
            "name": "remove",
            "description": "Remove a users speedrun score from a map",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "map",
                    "description": "The map to remove it from",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        }
    ]
};
