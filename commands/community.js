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
            .setTitle("Invalid Command")
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
            .setTitle("Community Challenge Group Created")
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
            .setTitle("Invalid Command")
            .setDescription(`**${name}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            challenge_data[name]["state"] = state;
            
            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Group State Updated")
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
            .setTitle("Invalid Command")
            .setDescription(`**${name}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            delete challenge_data[name];

            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Group Deleted")
            .setDescription(`**${name}** has been deleted.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "create_challenge"){
    
        // Creates a new community challenge
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var detail = interaction.options.getString('detail');
        var num_required = interaction.options.getInteger('num_required');
        var state = interaction.options.getString('state');
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name){
                // Challenge already exists. Output error message.
                var embed = new Discord.MessageEmbed()
                .setTitle("Invalid Command")
                .setDescription(`**${challenge_name}** already exists for ${group}.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }

        challenge_data[group]["challenges"].push({
            "name": challenge_name,
            "detail": detail,
            "state": state,
            "num_required": num_required,
            "progress": 0,
            "participants": []            
        });
            
        // Save the data and output message
        var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('community_challenge_data.json', writedata);

        var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Created")
            .setDescription(`**${challenge_name}** created in group ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "update_challenge_state")
    {
        // Updates community challenge State
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var state = interaction.options.getString('state');
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name){
                
                challenge_data[group]["challenges"][challenge_id]["state"] = state;
                // Save the data and output message
                var writedata = JSON.stringify(challenge_data, null, "\t");
                await fs.writeFileSync('community_challenge_data.json', writedata);
                
                var embed = new Discord.MessageEmbed()
                .setTitle("Community Challenge Updated")
                .setDescription(`**${challenge_name}** updated to ${state}.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "increment_challenge_progress")
    {
        // Updates community challenge progress
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var progress = interaction.options.getInteger('progress');
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name){
                
                challenge_data[group]["challenges"][challenge_id]["progress"] += progress;
                // Save the data and output message
                var writedata = JSON.stringify(challenge_data, null, "\t");
                await fs.writeFileSync('community_challenge_data.json', writedata);
                
                var embed = new Discord.MessageEmbed()
                .setTitle("Community Challenge Updated")
                .setDescription(`**${challenge_name}** progress updated by ${progress}.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "delete_challenge")
    {
        // Updates community challenge progress
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name)
            {
                challenge_data[group]["challenges"].splice(challenge_id, 1);
                // Save the data and output message
                var writedata = JSON.stringify(challenge_data, null, "\t");
                await fs.writeFileSync('community_challenge_data.json', writedata);
                
                var embed = new Discord.MessageEmbed()
                .setTitle("Community Challenge Deleted")
                .setDescription(`**${challenge_name}** removed.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "add_participant")
    {
        // Updates community challenge progress
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var userID = interaction.options.getUser('user').id
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name)
            {
                var participantList = challenge_data[group]["challenges"][challenge_id]["participants"];
                if (participantList.includes(userID))
                {
                    var embed = new Discord.MessageEmbed()
                    .setTitle("Invalid Command")
                    .setDescription(`**<@${userID}>** is already participating in ${challenge_name}.`);
                    return await interaction.editReply({embeds: [embed]})
                }
                else
                {
                    participantList.push(userID);
                
                    // Save the data and output message
                    var writedata = JSON.stringify(challenge_data, null, "\t");
                    await fs.writeFileSync('community_challenge_data.json', writedata);
                
                    var embed = new Discord.MessageEmbed()
                    .setTitle("Community Challenge Updated")
                    .setDescription(`**<@${userID}>** added to **${challenge_name}**.`);
                    return await interaction.editReply({embeds: [embed]})
                }
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "remove_participant")
    {
        // Updates community challenge progress
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
        var userID = interaction.options.getUser('user').id
        
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name)
            {
                var participantList = challenge_data[group]["challenges"][challenge_id]["participants"];
                if (!participantList.includes(userID))
                {
                    var embed = new Discord.MessageEmbed()
                    .setTitle("Invalid Command")
                    .setDescription(`**<@${userID}>** is not participating in **${challenge_name}**.`);
                    return await interaction.editReply({embeds: [embed]})
                }
                else
                {
                    challenge_data[group]["challenges"][challenge_id]["participants"].splice(participantList.indexOf(userID), 1);
                
                    // Save the data and output message
                    var writedata = JSON.stringify(challenge_data, null, "\t");
                    await fs.writeFileSync('community_challenge_data.json', writedata);
                
                    var embed = new Discord.MessageEmbed()
                    .setTitle("Community Challenge Updated")
                    .setDescription(`**<@${userID}>** removed from **${challenge_name}**.`);
                    return await interaction.editReply({embeds: [embed]})
                }
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "clear_participants")
    {
        // Updates community challenge progress
        var challenge_name = interaction.options.getString('name');
        var group = interaction.options.getString('group');
   
        if(!challenge_data[group]){
            // Group does not exist. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${group}** does not exist.`);
            return await interaction.editReply({embeds: [embed]})
        }
        for (var challenge_id in challenge_data[group]["challenges"])
        {
            var challenge = challenge_data[group]["challenges"][challenge_id];
            if(challenge["name"] == challenge_name)
            {
                challenge_data[group]["challenges"][challenge_id]["participants"] = [];
                
                // Save the data and output message
                var writedata = JSON.stringify(challenge_data, null, "\t");
                await fs.writeFileSync('community_challenge_data.json', writedata);
             
                var embed = new Discord.MessageEmbed()
                .setTitle("Community Challenge Cleared")
                .setDescription(`Participants cleared from from **${challenge_name}**.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }
        // Challenge does not exist in this group. Output error message.
        var embed = new Discord.MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(`**${challenge_name}** does not exist for ${group}.`);
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
				if((group.toLowerCase().includes(value.value.toLowerCase()) || value == "")){
                 res.push({
                        name: group,
                        value: group
                    })
				}
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
	res.reverse();
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
        },
        {
            "name": "update_challenge_state",
            "description": "Updates the state of a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "state",
                    "description": "Is this challenge active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        },
        {
            "name": "increment_challenge_progress",
            "description": "Updates the state of a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "progress",
                    "description": "Increment the progress",
                    "type": 4,
                    "required": true
                }
            ]
        },
        {
            "name": "delete_challenge",
            "description": "Removes a community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
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
            "name": "add_participant",
            "description": "Adds a community challenge participant",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                }
            ]
        },
        {
            "name": "remove_participant",
            "description": "Removes a community challenge participant",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                }
            ]
        },
        {
            "name": "clear_participants",
            "description": "Removes all community challenge participants",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the challenge",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                },
                {
                    "name": "group",
                    "description": "Name of the challenge group",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        }
    ]
}