const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const yaml = require('js-yaml');
const fs = require("fs");
const schedule = require('node-schedule');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let usedRooms = [];
let usedCourses = [];
let usedMPCourses = [];
let usedPocketCourses = [];

//Load the config file
let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

//Load the maps file
let Maps = null;
try {
    let mapContents = fs.readFileSync('./maps.json');
    Maps = JSON.parse(mapContents)
}
catch (e) {
    console.log(e);
}

//Create a collection of commands and commandData
const commands = new Collection();
//Command data is a list of JSON objects that need to be sent to register the slash commands
const commandsData = [];

//We load all the command files and save the command and the commandData
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //Load the file
    const command = require(`./commands/${file}`);
    //Add to command collection
    commands.set(command.info.name, command);

    //Load the commandData
    const commandData = require(`./commands/${file}`);
    var json = commandData.info
    commandsData.push(json);
}

//Load the rest API for registering slash commands, auto deals with rate limits
const rest = new REST({ version: '9' }).setToken(Config.Token);

//Send all the slash commandData to the discord API to register the commands for the guild only
(async () => {
    if(Config.Commands.SetupCommands){
        try {
            console.log('Started refreshing application (/) commands.');
    
            await rest.put(
                Routes.applicationGuildCommands(Config.ClientID, Config.GuildID),
                { body: commandsData },
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
    
})();

//creates data files if they dont exist
const data = new Uint8Array(Buffer.from('{}'));

fs.access("data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("data.json", data, (err) => {
                if (err) throw err;
                console.log("Created data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("data.json already exists")
    }
})
fs.access("daily_challenge_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("daily_challenge_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created daily_challenge_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("daily_challenge_data.json already exists")
    }
})
fs.access("weekly_leaderboards_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("weekly_leaderboards_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created weekly_leaderboards_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("weekly_leaderboards_data.json already exists")
    }
})
fs.access("racemode_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("racemode_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created racemode_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("racemode_data.json already exists")
    }
})
fs.access("community_challenge_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("community_challenge_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created community_challenge_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("community_challenge_data.json already exists")
    }
})

// D.JS Client listeners
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));
client.on('reconnecting', () => console.log('Reconnecting WS...'));
client.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

// NodeJS process listeners
process.on('unhandledRejection', console.error);
process.on('warning', console.warn);

// On ready statment
client.on("ready", async() => {
    console.log("Online!")
    console.log("^ The above message is for Pterodactyl to pickup and mark the server as online. ^\n")
    console.log("------------------------------------------------------------------------------------------------------")
    console.log("The bot is now online")
    console.log(`Logged in as ${client.user.username} || ${client.user.id}`)
    console.log("------------------------------------------------------------------------------------------------------")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=125952&scope=bot`);
    console.log("------------------------------------------------------------------------------------------------------")
    main(true)
});

//Listen for commands coming from chat and context menus
client.on('interactionCreate', async interaction => {
    if (!(interaction.isCommand() || interaction.isContextMenu())) return;
    if(!interaction.inGuild()){
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        return;
    }

    //Find the commands we want to run
    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        //Run the command
        await command.run(interaction, Config, Maps, client);
    } catch (error) {
        console.error(error);
    }
});

//Listen for autocomplete
client.on('interactionCreate', async interaction => {
    if (!interaction.isAutocomplete()) return;

    //Find the commands we want to auto complete for
    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        //Run the autocomplete resolver
        await command.autocomplete(interaction, Maps, client);
    } catch (error) {
        console.error(error);
    }
});

// Log in
client.login(Config.Token);

// Main function - schedule cron jobs
async function main(){
      let jobEasy = schedule.scheduleJob('00 45 * * * *', printRandomEasyGameMessage); // fires every day, at xx:45:00
      let jobHard = schedule.scheduleJob('00 15 * * * *', printRandomHardGameMessage); // fires every day, at xx:15:00
      let jobLanguage = schedule.scheduleJob('00 45 12,16,20 * * 6,7', printLanguageGameMessage); // fires on Saturdays and Sundays at 15 minutes before 9 am, 1 pm , and 5 pm EST.
      //let jobLanguageIt = schedule.scheduleJob('00 45 6,14 * * 1,3,5', printItLanguageGameMessage); // fires daily at 15 minutes before 3 am and 11 am EST (9 am and 5 pm CEST) on Monday/Wednesday/Friday
      let weeklyReminder = schedule.scheduleJob('00 00 18 * * 2-7', printWeeklyReminderMessage); // fires every day, at 2:00:00 PM EST, except Monday
      //let jobRMEasy = schedule.scheduleJob('00 00 * * * *', printRandomRMEasyGameMessage); // fires every day, at xx:00:00
      //let jobRMHard = schedule.scheduleJob('00 30 * * * *', printRandomRMHardGameMessage); // fires every day, at xx:30:00
      let jobMPEasy = schedule.scheduleJob('00 00 * * * *', printRandomMPEasyGameMessage); // fires every day, at xx:00:01
      let jobMPHard = schedule.scheduleJob('00 30 * * * *', printRandomMPHardGameMessage); // fires every day, at xx:30:01
      let jobPocket = schedule.scheduleJob('00 45 22 * * 1,3,5', printPocketGameMessage); // fires every day at 15 minutes before 7 pm EST on Monday/Wednesday/Friday.
}

// Print the random easy game message in #find-a-game
async function printRandomEasyGameMessage(){
    let course = getNotRecentlyUsedEasyCourse();
    usedCourses.push(course);
    if(usedCourses.length > 14){
        usedCourses.shift();
    }
    printRandomGameMessage(course);
}

// Print the random hard game message in #find-a-game
async function printRandomHardGameMessage(){
    let course = getNotRecentlyUsedHardCourse();
    usedCourses.push(course);
    if(usedCourses.length > 14){
        usedCourses.shift();
    }
    printRandomGameMessage(course);
}

// Print the random race mode easy game message in #find-a-game - not currently used
async function printRandomRMEasyGameMessage(){
    let course = getNotRecentlyUsedEasyCourse();
    printRandomRMGameMessage(course);
}

// Print the random race mode hard game message in #find-a-game - not currently used
async function printRandomRMHardGameMessage(){
    let course = getNotRecentlyUsedHardCourse();
    printRandomRMGameMessage(course);
}


// Print the random race mode easy game message in #find-a-game
async function printRandomMPEasyGameMessage(){
    let course = getNotRecentlyUsedMPEasyCourse();
    usedMPCourses.push(course);
    if(usedMPCourses.length > 14){
        usedMPCourses.shift();
    }
    printRandomMPGameMessage(course);
}

// Print the random race mode hard game message in #find-a-game
async function printRandomMPHardGameMessage(){
    let course = getNotRecentlyUsedMPHardCourse();
    usedMPCourses.push(course);
    if(usedMPCourses.length > 14){
        usedMPCourses.shift();
    }
    printRandomMPGameMessage(course);
}

// Print the random easy game message in #find-a-game
async function printPocketGameMessage(){
    let course = getNotRecentlyUsedEasyPocketCourse();
    usedPocketCourses.push(course);
    if(usedPocketCourses.length > 14){
        usedPocketCourses.shift();
    }
    printRandomPocketGameMessage(course);
}


// Print the random game message in #find-a-game
async function printRandomGameMessage(course){

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);

    let room = getNotRecentlyUsedRoom();

    usedRooms.push(room);
    if(usedRooms.length > 10){
        usedRooms.shift();
    }
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":golf: :golf: :golf: Standard Game starting soon! :golf: :golf: :golf:")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}1**. If this is full, try **${room}2** or **${room}3**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.
    
    These are **VR-ONLY** games.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be __**${course}**__.
    
    This game will use the **STANDARD** game mode. 
    
    Turn order will be **HONORS** unless everyone in the room agrees to change it.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})
}

// Add logic to not repeat recently used room names
function getNotRecentlyUsedRoom(){
    let room = Maps.RoomIDs[Math.floor(Math.random() * Maps.RoomIDs.length)]
    while (usedRooms.includes(room)){
        room = Maps.RoomIDs[Math.floor(Math.random() * Maps.RoomIDs.length)]
    }
    return room
}

// Add logic to not repeat recently played Easy courses
function getNotRecentlyUsedEasyCourse(){
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Hard')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedCourses.includes(featureMap + ' - Easy') && !usedCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Easy';
        }
        if (usedCourses.includes(featureMap + ' - Easy')) {
            usedCourses.splice(usedCourses.indexOf(featureMap + ' - Easy'), 1);
        }
    }
    return course
}

// Add logic to not repeat recently played Hard courses
function getNotRecentlyUsedHardCourse(){
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Easy')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedCourses.includes(featureMap + ' - Easy') && !usedCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Hard';
        }
        if (usedCourses.includes(featureMap + ' - Hard')) {
            usedCourses.splice(usedCourses.indexOf(featureMap + ' - Hard'), 1);
        }
    }
    return course
}

// Add logic to not repeat recently played Easy courses
function getNotRecentlyUsedMPEasyCourse(){
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedMPCourses.includes(course) || course.endsWith('Hard')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedMPCourses.includes(featureMap + ' - Easy') && !usedMPCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Easy';
        }
        if (usedMPCourses.includes(featureMap + ' - Easy')) {
            usedMPCourses.splice(usedMPCourses.indexOf(featureMap + ' - Easy'), 1);
        }
    }
    return course
}

// Add logic to not repeat recently played Hard courses
function getNotRecentlyUsedMPHardCourse(){
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedMPCourses.includes(course) || course.endsWith('Easy')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedMPCourses.includes(featureMap + ' - Easy') && !usedMPCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Hard';
        }
        if (usedMPCourses.includes(featureMap + ' - Hard')) {
            usedMPCourses.splice(usedMPCourses.indexOf(featureMap + ' - Hard'), 1);
        }
    }
    return course
}

// Add logic to not repeat recently played Easy courses with extra logic for Pocket
function getNotRecentlyUsedEasyPocketCourse(){
    let pocketNoSupportMaps = Maps.PocketNoSupportMaps;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Hard') || pocketNoSupportMaps.includes(course)){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    return course
}

// Print the non-English game message in #find-a-game
async function printLanguageGameMessage() {
    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":flag_fr: :flag_de: :flag_it: :flag_es: :flag_pt: Non-English games starting soon! :flag_pt: :flag_es: :flag_it: :flag_de: :flag_fr:")
    .setDescription(`
    The next scheduled non-English games will start in **15 minutes** (at <t:${currentDateSubstring}:t>).
    
    Room **JOUEURS** (French)
    Room **SPIELER** (German)
    Room **GIOCATORI** (Italian)
    Room **JUGADORES** (Spanish)
    Room **JOGADORES** (Portugese)

    If these rooms are full, try adding a 1 or a 2 to the end of the room name, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.
    
    These are **VR-ONLY** games.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be __**Tourist Trap - Easy**__, or you can choose a different one amongst yourselves.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})  
}

// Print the non-English game message in #find-a-game - not currently used
async function printItLanguageGameMessage() {
    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":flag_it: Italian games starting soon! :flag_it:")
    .setDescription(`
    In order to celebrate the launch of Passport: Venice, we are highlighting games in Italian.
    
    The next scheduled Italian games will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **GIOCATORI**. If this is full, try GIOCATORI1 or GIOCATORI2, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.
    
    These are **VR-ONLY** games.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be **Venice - Easy**.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})  
}

// Print the weekly leaderboard reminder message
async function printWeeklyReminderMessage() {
    var easyCourse = "";
    var hardCourse = "";
    var rmEasyCourse = "";
    var rmHardCourse = "";
    for (var map in Maps.Leaderboards) {
        if (Maps.Leaderboards[map].startsWith("Weekly")) {
            if (Maps.Leaderboards[map].includes("- Easy")) {
                if (Maps.Leaderboards[map].endsWith("(Race Mode)")) {
                    rmEasyCourse += Maps.Leaderboards[map] + "\n";
                }
                else {
                    easyCourse += Maps.Leaderboards[map] + "\n";
                }
            }
            else if (Maps.Leaderboards[map].includes("- Hard")) {
                if (Maps.Leaderboards[map].endsWith("(Race Mode)")) {
                    rmHardCourse += Maps.Leaderboards[map] + "\n";
                }
                else {
                    hardCourse += Maps.Leaderboards[map] + "\n";
                }
            }
        }
    }

    let rawdata = await fs.readFileSync('weekly_leaderboards_data.json');
    let challenge_data = await JSON.parse(rawdata);

    var sortable = [];
    for (var player in challenge_data) {
        var totalScore = challenge_data[player]["Current Season"]["Points"];
        if (totalScore > 0) {
            sortable.push([player, totalScore]);
        }
    }

    sortable.sort(function(a,b){
        return b[1] - a[1];
    });

    var tbl = ":trophy: **__Current Season Points:__** :trophy:\n"; 
    if (sortable.length==0)
    {
        tbl += "No points awarded yet.";
    }
    
    var rank = 0;
    var previous_score = 1000;
    for (var i=0;i<sortable.length;i++) {
        if (sortable[i][1] < previous_score)
        {
            rank++;
        }
        previous_score = sortable[i][1];
        tbl += `#${rank}: <@${sortable[i][0]}> - ${sortable[i][1]}\n`;
    }

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.CoursesLeageChannelID);

    let embed = new MessageEmbed()
    .setTitle(":star: Weekly Leaderboards! :star:")
    .setDescription(`Just a reminder to all of the Leaderboard enthusiasts! The Weekly Leaderboard competition is happening right now!\n\n`
        + `:golf: **__Standard Courses:__** :golf:\n`
        + easyCourse
        + hardCourse + `\n`
        + `:checkered_flag: **__Race Mode Courses:__** :checkered_flag:\n`
        + rmEasyCourse
        + rmHardCourse + `\n\n`
        + tbl + `\n\n`
        + "Check out the **https://discord.com/channels/752022800562389015/966336175843446886** channel for the rules and how to compete!")
    .setTimestamp();
    channel.send({embeds: [embed]})
}

// Print the random game message in #find-a-game - not currently used
async function printRandomRMGameMessage(course){

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);

    let room = getNotRecentlyUsedRoom();

    usedRooms.push(room);
    if(usedRooms.length > 10){
        usedRooms.shift();
    }
    
    usedCourses.push(course);
    if(usedCourses.length > 14){
        usedCourses.shift();
    }
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":checkered_flag: :checkered_flag: :checkered_flag: Race Mode Game starting soon! :checkered_flag: :checkered_flag: :checkered_flag:")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}1**. If this is full, try **${room}2** or **${room}3**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.
    
    These are **VR-ONLY** games.

    The course will be __**${course}**__.
    
    This game will use the **RACE MODE** game mode.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})
}

// Print the random match play game message in #find-a-game
async function printRandomMPGameMessage(course){

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);

    let room = getNotRecentlyUsedRoom();

    usedRooms.push(room);
    if(usedRooms.length > 10){
        usedRooms.shift();
    }
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":boxing_glove: :boxing_glove: :boxing_glove: Match Play Game starting soon! :boxing_glove: :boxing_glove: :boxing_glove:")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}**. If this is full, try **${room}1** or **${room}2**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.
    
    These are **VR-ONLY** games.

    The course will be __**${course}**__.
    
    This game will use the **MATCH PLAY** game mode. 
    
    Turn order will be **HONORS** unless everyone in the room agrees to change it.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})
}

// Print the random game message in #find-a-game
async function printRandomPocketGameMessage(course){

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.PocketChannelID);

    let room = getNotRecentlyUsedRoom();

    usedRooms.push(room);
    if(usedRooms.length > 10){
        usedRooms.shift();
    }
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":mobile_phone: :mobile_phone: :mobile_phone: Pocket Edition Game starting soon! :mobile_phone: :mobile_phone: :mobile_phone:")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}1**. If this is full, try **${room}2** or **${room}3**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.
    
    These are **POCKET EDITION ONLY** games. 
    
    Be sure to have the course downloaded in advance.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be __**${course}**__. 
    
    This game will use the **STANDARD** game mode. 
    
    Turn order will be **HONORS** unless everyone in the room agrees to change it.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})
}