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
    
    if(!(interaction.channel.id == config.CourseDailyChannelID || interaction.channel.id == config.CourseCommunityChannelID) && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var tbl = '';
    for (var player in challenge_data) {
        if (challenge_data[player]['Total Season Wins']['First Place Finishes'] > 0){
            tbl += `<@${player}>\n`;
        }
    }
    
    var embed = new Discord.MessageEmbed()
      .setTitle(`:trophy: First Place Champions :trophy:`)
      .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}
module.exports.info = {
    "name": "champion-stats",
    "description": "List all users with First Place medals"
};