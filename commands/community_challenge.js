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
    
    if(interaction.options.getSubcommand() == "challenge_list"){
        var tbl = ""; 
        for (var challenge in challenge_data) {
           tbl += `${challenge_data[challenge]["emoji"]}   **${challenge}:**   ${challenge_data[challenge]["dates"]},   ${challenge_data[challenge]["state"]}\n`;
        }
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenges")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "challenge_details"){
        var name = interaction.options.getString('name');
        
        var challenge_details = challenge_data[name];
        console.log(challenge_details);
        
        var tbl = `${challenge_details["emoji"]} **${name}** ${challenge_details["emoji"]}\n`; 
        tbl += `Challenge Dates: ${{challenge_details["dates"]}\n\n`;
        tbl += `Challenge Status: ${{challenge_details["state"]}\n`;
        tbl += `Participants:\n`;
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenge Details")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "challenge_progress"){
        var name = interaction.options.getString('name');
        
        var challenge_details = challenge_data[name];
        
        var tbl = `${challenge_details["emoji"]} **${name}** ${challenge_details["emoji"]}\n`; 
        tbl += `Current progress: ` + challenge_details["participants"].length + `\\` + challenge_details["num_required"];

        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenge Progress")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})        
    }
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'name': {
            let rawdata = await fs.readFileSync('community_challenge_data.json');
            let challenge_data = await JSON.parse(rawdata);
		    for (var challenge in challenge_data) {
                 res.push({
                        name: challenge,
                        value: challenge
                    })
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
            "name": "challenge_list",
            "description": "Lists all community challenge",
            "type": 1,
            "options": []
        },
        {
            "name": "challenge_details",
            "description": "Lists the details of a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
        {
            "name": "challenge_progress",
            "description": "Lists the progress of a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        }
    ]
}