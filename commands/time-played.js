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

    if((interaction.channel.id != config.CoursesLeageChannelID || interaction.channel.id != config.CourseDailyChannelID) && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    
    var startTime = interaction.options.getString('start_time').split(":");
    var endTime = interaction.options.getString('end_time').split(":");
    
    if (startTime.length != 3) {
        await interaction.reply({ephemeral: true, content: "Invalid start time format."})
        return;
    }
    else if (endTime.length != 3) {
        await interaction.reply({ephemeral: true, content: "Invalid end time format."})
        return;
    }
    
    if (interaction.options.getString('start_time_mod').equals("PM"))
    {
        startTime[0] += 12;
    }
    if (interaction.options.getString('end_time_mod').equals("PM"))
    {
        endTime[0] += 12;
    }
    
    await interaction.deferReply();
    
    var startTimeInSeconds = (Number(startTime[0]) * 3600) + (Number(startTime[1]) * 60) + (Number(startTime[2]));
    var endTimeInSeconds = (Number(endTime[0]) * 3600) + (Number(endTime[1]) * 60) + (Number(endTime[2]));
    var totalSeconds = endTimeInSeconds - startTimeInSeconds;
    
    var date = new Date(null);
    date.setSeconds(totalSeconds);
    var timeString = date.toISOString().slice(11, 19);
    
    var embed = new Discord.MessageEmbed()
    .setTitle("Start Time: " + interaction.options.getString('start_time') + ", End Time: " + interaction.options.getString('end_time'))
    .setDescription("Time Played: " + timeString);
    return await interaction.editReply({embeds: [embed]})
}
module.exports.info = {
    "name": "time_played",
    "description": "Calculates the game from from the start and end times.",
    "options": [
        {
            "name": "start_time",
            "description": "Time start (in 12 hr format hh:mm:ss)",
            "type": 3,
            "required": true
        },
        {
            "name": "start_time_mod",
            "description": "AM/PM",
            "type": 3,
            "required": true,
            "choices": [
                {
                    "name": "AM",
                    "value": "AM"
                },
                {
                    "name": "PM",
                    "value": "PM"
                }
        },
        {
            "name": "end_time",
            "description": "Time finish (in 12 hr format hh:mm:ss)",
            "type": 3,
            "required": true
        },
        {
            "name": "end_time_mod",
            "description": "AM/PM",
            "type": 3,
            "required": true,
            "choices": [
                {
                    "name": "AM",
                    "value": "AM"
                },
                {
                    "name": "PM",
                    "value": "PM"
                }
        },
    ]
};