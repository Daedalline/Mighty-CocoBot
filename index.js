const Discord = require("discord.js");
const yaml = require('js-yaml');
const fs = require("fs");
const initCommands = require("./init_commands")
const utils = require("./utils")

const bot = new Discord.Client({ disableEveryone: true });

let Config = null;
let usedRooms = [];
let calls = [];

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

//Create calls for slash commands
fs.readdir("./commands/", (err, file) => {

    if (err) console.log(err);

    let jsfile = file.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Cant Find Commands");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        let data = props.info
        calls.push(data)
    });
});

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


// D.JS Client listeners
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));
bot.on('reconnecting', () => console.log('Reconnecting WS...'));
bot.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

// NodeJS process listeners
process.on('unhandledRejection', console.error);
process.on('warning', console.warn);

// On ready statment
bot.on("ready", async() => {
    console.log("Online!")
    console.log("^ The above message is for Pterodactyl to pickup and mark the server as online. ^\n")
    console.log("------------------------------------------------------------------------------------------------------")
    console.log("The bot is now online")
    console.log(`Logged in as ${bot.user.username} || ${bot.user.id}`)
    console.log("------------------------------------------------------------------------------------------------------")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=125952&scope=bot`);
    console.log("------------------------------------------------------------------------------------------------------")
    if(Config.Commands.SetupCommands){
        initCommands.sendCalls(bot, calls)
    }
    main(true)
});

bot.ws.on("INTERACTION_CREATE", async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    let data = await utils.loadData()

    //Load all the commands
    const ping = require("./commands/ping")
    const scores = require("./commands/scores")
    const course = require("./commands/course")

    switch(command){
        case "ping":
            ping.run(bot, interaction, args)
            break;
        case "scores":
            scores.run(bot, interaction, args)
            break;
        case "course":
            course.run(bot, interaction, args)
            break;
    }
})

bot.login(Config.Token);

function main(){
    let ms = msToNextHour()
    setTimeout(send, (ms+100) - 900000)
}

function send(){

    let guild = bot.guilds.cache.find(i => i.id == Config.GuildID)
    let channel = guild.channels.cache.find(i => i.id == Config.ChannelID)

    let room = getNotRecentlyUsedRoom()

    let course = Config.Maps[Math.floor(Math.random() * Config.Maps.length)]

    usedRooms.push(room)
    if(usedRooms.length > 2){
        usedRooms.shift()
    }

    let emebd = new Discord.MessageEmbed()
    .setTitle("Game starting soon!")
    .setDescription(`
    The next scheduled game will start in 15 minutes (at the top of the hour) in room **${room}**. If this is full, try **${room}1** or **${room}2**, etc.
    
    The course will be **${course}**. If you want to join, drop a :thumbsup: reaction on this message so people know there are enough players.
    `)
    .setTimestamp();
    channel.send(emebd).then(function (message) {message.react("👍")})
    //console.log("-----------------------------------------")
    //console.log(`              Message Sent`)
    //console.log(`Room: ${room}`)
    //console.log(`Map: ${course}`)
    //console.log(`Used Rooms ${usedRooms}`)
    //console.log(new Date().toUTCString())
    //console.log("-----------------------------------------")

    setTimeout(main, 1800000)
}

function msToNextHour() {
    return (3600000 - new Date().getTime() % 3600000);
}

function getNotRecentlyUsedRoom(){
    let room = Config.RoomIDs[Math.floor(Math.random() * Config.RoomIDs.length)]
    while (room in usedRooms){
        room = Config.RoomIDs[Math.floor(Math.random() * Config.RoomIDs.length)]
    }
    return room
}
