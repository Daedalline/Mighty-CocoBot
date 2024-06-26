/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com/Daedalline
 * ============================================
 */

const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {
    
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)

    if(interaction.channel.id != config.CoursesLeageChannelID && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();

    let rawdata = await fs.readFileSync('racemode_data.json');
    let data = await JSON.parse(rawdata); 

    var map = interaction.options.getString('map');
    var players = data[map];
    
    //Le Sorte'
    var simpleData = {};
    for(var player in players){
        simpleData[player] = players[player];
    }
    
    // If empty no need to sort anything
    if(Object.keys(simpleData).length <= 0){
        var embed = new Discord.MessageEmbed()
            .setTitle("Data Not Found")
            .setDescription(`There does not apear to be any times for **${map}**`);
        return await interaction.editReply({embeds: [embed]})
    }
    
    var sortable = [];
    for (var item in simpleData){
        sortable.push([item, simpleData[item]]);
    }

    sortable.sort(function(a,b){
        if (a[1][0] == b[1][0]) {
            var dateA = new Date(a[1][1]);
            var dateB = new Date(b[1][1]);
            if (dateA < dateB){
                return -1;
            }
            else if (dateA > dateB){
                return 1;
            }
            else {
                return 0;            
            }
        }
        else {    
            return a[1][0] - b[1][0];
        }
    })

    var sortedData = {}
    sortable.forEach(function(item){
        var date = new Date(null);
        date.setMilliseconds(item[1][0]);
        var timeString = date.toISOString().slice(14, 22);
        
        sortedData[item[0]] = timeString;
    })
    
    var tbl = "";
    var player_rank = "";
    var index = 0;
    var rank = 0;
    var previous_score = "00:00.00";
    for(player in sortedData){
        // Calculate rank
        if (sortedData[player] > previous_score)
        {
            rank++;
        }
        previous_score = sortedData[player];
        // Print the top 20
        if(index < 20){
            tbl += `#${rank}: <@${player}> ${sortedData[player]}\n`
        }
        // Store the caller data
        if (player == member.user.id)
        {
            player_rank = `\n**Your Ranking:**\n#${rank}: <@${player}> ${sortedData[player]}\n`;
        }
        index ++
    }
    if (player_rank == "")
    {
        player_rank = `\n**Your Ranking:**\n<@${member.user.id}> does not have a score for ${map}.\n`;
    }
    var embed = new Discord.MessageEmbed()
    .setTitle(`Race Mode Leaderboard for ${map}`)
    .setDescription(tbl + player_rank);
    return await interaction.editReply({embeds: [embed]})
};

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Leaderboards.forEach(map => {
                if((map.toLowerCase().includes(value.value.toLowerCase()) || value == "") && !(map.startsWith("Weekly") && !map.endsWith("(Race Mode)"))){
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
    "name": "racemode_course",
    "description": "See the Race Mode leaderboard for each map",
    "options": [
        {
            "name": "map",
            "description": "The map you want the leaderboard for",
            "type": 3,
            "autocomplete": true,
            "required": true
        }
    ]
};
