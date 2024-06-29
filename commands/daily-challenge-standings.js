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
    
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var type = interaction.options.getString('type');
    var finalStandings = {
        "Current Season": {}
    };
    
    var sortable = [];
    for (var player in challenge_data) {
        var totalScore = challenge_data[player]["Current Season"]["Coolest Shot From the Tee"] + challenge_data[player]["Current Season"]["Coolest Shot From Another Tee"] + challenge_data[player]["Current Season"]["Completion Awards"] + challenge_data[player]["Current Season"]["Participation Awards"] + challenge_data[player]["Current Season 9-Hole"]["Target Score Achieved"] + challenge_data[player]["Current Season 9-Hole"]["Target Score and Time Achieved"] + challenge_data[player]["Current Season 9-Hole"]["Top Score"];
        if (type == "Champion" && totalScore > 0 && challenge_data[player]["Total Season Wins"]["First Place Finishes"] > 0) {
            sortable.push([player, totalScore]);
        }
        else if (type == "Standard" && totalScore > 0 && challenge_data[player]["Total Season Wins"]["First Place Finishes"] == 0) {
            sortable.push([player, totalScore]);
        }
    }
    
    sortable.sort(function(a,b){
        return b[1] - a[1];
    });
    
    var tbl = "__Current Season Medals:__\n"; 
    var rank = 0;
    var previous_score = 1000;
    for (var i=0;i<sortable.length;i++) {
        if (sortable[i][1] < previous_score)
        {
            rank++;
        }
        previous_score = sortable[i][1];
        tbl += `#${rank}: <@${sortable[i][0]}>   ${sortable[i][1]}\n`;
    }
   
    var embed = new Discord.MessageEmbed()
    .setTitle("Daily Challenge Season Standings (" + type + ")")
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'type': {
            res = [{name: 'Champion', value: 'Champion'}, {name: 'Standard', value: 'Standard'}];
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}
    
module.exports.info = {
    "name": "daily-challenge-standings",
    "description": "List the Seasonal Daily Challenge standings",
    "options": [
      {
        "name": "type",
        "description": "The map you want the leaderboard for",
        "type": 3,
        "autocomplete": true,
        "required": true
      }
    ]
};
    