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
        }
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Community Challenges")
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "info"){
        var group = interaction.options.getString('challenge_name');
        var emoji = challenge_data[group]["emoji"]
        var tbl = `Active: ${challenge_data[group]["dates"]}\n`;
        tbl += `Status: ${challenge_data[group]["state"]}\n\n`;
        tbl += `### Subchallenges:\n`;

        for (var i in challenge_data[group]["challenges"])
        {
            var challenge_info = challenge_data[group]["challenges"][i];
            tbl += `***${challenge_info["name"]}***\n`;
            tbl += `**State: ${challenge_info["state"]}**\n`;
            tbl += `**Progress: ${challenge_info["progress"]}/${challenge_info["num_required"]}**\n`;
            tbl += `${challenge_info["detail"]}\n\n`;
        }
        
        var embed = new Discord.MessageEmbed()
        .setTitle(`${emoji}${emoji}${emoji} __**${group}**__${emoji}${emoji}${emoji}\n`)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "details"){
        var group = interaction.options.getString('challenge_name');
        var challenge = interaction.options.getString('subchallenge_name');
        var emoji = challenge_data[group]["emoji"]
        
        for (var i in challenge_data[group]["challenges"])
        {
            var challenge_info = challenge_data[group]["challenges"][i];
            if(challenge_info["name"] == challenge)
            {
                var tbl = `Active: ${challenge_data[group]["dates"]}\n`;
                tbl += `Status: ${challenge_data[group]["state"]}\n\n`;
                tbl += `### ${challenge_info["name"]}:\n`;
                tbl += `**State: ${challenge_info["state"]}**\n`;
                tbl += `**Progress: ${challenge_info["progress"]}/${challenge_info["num_required"]}**\n`;
                tbl += `${challenge_info["detail"]}\n\n`;
                tbl += `**Participants:**\n`;
                for (var user in challenge_info["participants"]) {
                    tbl += `* <@${challenge_info["participants"][user]}>\n`;
                }
                var embed = new Discord.MessageEmbed()
                .setTitle(`${emoji}${emoji}${emoji} __**${group}**__${emoji}${emoji}${emoji}\n`)
                .setDescription(tbl);
                return await interaction.editReply({embeds: [embed]})
            }
        }

        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`${challenge} is not a part of ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.autocomplete = async (interaction, Maps) => {
    var focusedOption = interaction.options.getFocused(true);
    var choices = []
    switch(focusedOption.name){
        case 'challenge_name': {
            let rawdata = await fs.readFileSync('community_challenge_data.json');
            let group_data = await JSON.parse(rawdata);
		    for (var group in group_data) {
                 choices.push(group);
            }
            break;
        }
        case 'subchallenge_name': {
            let rawdata = await fs.readFileSync('community_challenge_data.json');
            let group_data = await JSON.parse(rawdata);
		    for (var group in group_data) {
                for (var challenge_id in group_data[group]["challenges"])
                {
                    var challenge = group_data[group]["challenges"][challenge_id];
                    if (!choices.includes(challenge["name"])) {
                        choices.push(challenge["name"])
                    }
                }
            }
            break;
        }
    }
    const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
    interaction.respond(filtered.map(choice => ({ name: choice, value: choice })),);
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
        },
        {
            "name": "info",
            "description": "Provides more info about a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "challenge_name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
        {
            "name": "details",
            "description": "Provides more info about a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "challenge_name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "subchallenge_name",
                    "description": "Name of the subchallenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        }
    ]
}
