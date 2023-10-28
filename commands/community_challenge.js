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

    if(interaction.channel.id != config.CourseDailyChannelID && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('community_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var tbl = ""; 

    if(interaction.options.getSubcommand() == "challenge_list"){
        for (var challenge in challenge_data) {
            tbl += `${challenge}:\n`;
            console.log(${challenge_data[challenge]["Dates"]});
            console.log(${challenge_data[challenge]["State"]});
        }
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenges")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "community_challenge",
    "description": "Get details about community challenges",
    "options": [
        {
            "name": "challenge_list",
            "description": "Lists all community challenge",
            "type": 1,
            "options": []
        }
    ]
}