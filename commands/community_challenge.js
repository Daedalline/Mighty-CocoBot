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
    
    if(interaction.options.getSubcommand() == "list"){
        var tbl = ""; 
        
        for (var challenge in challenge_data)
        {
            tbl += `${challenge_data[challenge]["emoji"]}   **${challenge}:**   ${challenge_data[challenge]["dates"]},   ${challenge_data[challenge]["state"]}\n`; 
            
            console.log(challenge_data["challenges"]);
        }
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenges")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'group': {
            let rawdata = await fs.readFileSync('community_challenge_data.json');
            let group_data = await JSON.parse(rawdata);
		    for (var group in group_data) {
                 res.push({
                        name: group,
                        value: group
                    })
            }
            break;
        }
        case 'name': {
            let rawdata = await fs.readFileSync('community_challenge_data.json');
            let group_data = await JSON.parse(rawdata);
		    for (var group in group_data) {
                for (var challenge_id in group_data[group]["challenges"])
                {
                    var challenge = group_data[group]["challenges"][challenge_id];
                    res.push({
                        name: challenge["name"],
                        value: challenge["name"]
                    })
                }
            }
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "community_challenge",
    "description": "Get details about community challenges",
    "options": [
        {
            "name": "list",
            "description": "Lists all community challenge",
            "type": 1,
            "options": []
        }
    ]
}
