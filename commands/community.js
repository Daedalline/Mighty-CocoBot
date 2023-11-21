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
    
    let rawdata = await fs.readFileSync('community_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    await interaction.deferReply();
    
    if(interaction.options.getSubcommand() == "create_group"){
    
        // Creates a new community challenge
        var name = interaction.options.getString('name');
        var emoji = interaction.options.getString('emoji');
        var dates = interaction.options.getString('dates');
        var state = interaction.options.getString('state');
        
        if(challenge_data[name]){
            // Challenge already exists. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`**${name}** already exists.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            challenge_data[name] = { 
            "emoji": emoji,
            "dates": dates,
            "state": state,
            "challenges": []
            }
            
            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Created")
            .setDescription(`**${name}** created.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "update_group_state") {
        // Update challenge state
        var name = interaction.options.getString('group');
        var state = interaction.options.getString('state');
        
        if(!challenge_data[name]){
            // Challenge does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`**${name}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            challenge_data[name]["state"] = state;
            
            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge State Updated")
            .setDescription(`**${name}** set to ${state}.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "delete_group") {
        // Delete the challenge
        var name = interaction.options.getString('group');
        
        if(!challenge_data[name]){
            // Challenge does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`**${name}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            delete challenge_data[name];

            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Deleted")
            .setDescription(`**${name}** has been deleted.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "create_challenge"){
    
        // Creates a new community challenge
        var name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var detail = interaction.options.getString('detail');
        var num_required = interaction.options.getInteger('num_required');
        var state = interaction.options.getString('state');
        
        if(!challenge_data[group]){
            // Challenge already exists. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge in challenge_data[group]["challenges"])
        {
            console.log(challenge);
            //if(challenge_data[group]["challenges"][challenge] == name){
                // Challenge already exists. Output error message.
                var embed = new Discord.MessageEmbed()
                .setTitle("Invalid Command")
                .setDescription(`**${name}** already exists for ${group}.`);
                return await interaction.editReply({embeds: [embed]})
            //}
        }
        challenge_data[group]["challenges"].push(
        { name: {
        "detail": detail,
        "state": state,
        "num_required": num_required,
        "progress": 0,
        "participants": []}});
            
        // Save the data and output message
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('community_challenge_data.json', writedata);

        var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Created")
            .setDescription(`**${name}** created.`);
        return await interaction.editReply({embeds: [embed]})
    }
    
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'state': {
		    res = [{name: 'Active', value: 'Active'}, {name: 'Pending', value: 'Pending'}, {name: 'Complete', value: 'Complete'}, {name: 'Not Completed', value: 'Not Completed'}];
            break;
        }
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
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "community",
    "description": "Allows moderators to maintain community challenges",
    "options": [
        {
            "name": "create_group",
            "description": "Adds a new community challenge group",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge group",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "dates",
                    "description": "When this challenge was active",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "state",
                    "description": "Is this challenge active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                                {
                    "name": "emoji",
                    "description": "emoji to represent this challenge",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "update_group_state",
            "description": "Change the community challenge group state",
            "type": 1,
            "options": [
                {
                    "name": "group",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "state",
                    "description": "Is this challenge group active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
        {
            "name": "delete_group",
            "description": "Deletes the community challenge",
            "type": 1,
            "options": [
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
        {
            "name": "create_challenge",
            "description": "Adds a new community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "detail",
                    "description": "Challenge details",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "num_required",
                    "description": "Number of completions required",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "state",
                    "description": "Is this challenge active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        }
    ]
}