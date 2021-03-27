const Discord = require("discord.js");
const yaml = require('js-yaml');
const fs = require("fs");

const bot = new Discord.Client({ disableEveryone: true });

let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}


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
    console.log("\nThe bot is now online")
    console.log("Keep this window open for the bot to run\n")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=125952&scope=bot\n`);
    console.log("Press CTRL+C to exit\n")
    main()
});

bot.login(Config.Token);

function main(){
    let ms = msToNextHour()
    console.log(ms)
    setTimeout(send, (ms+100))
}

function send(){

    let guild = bot.guilds.cache.find(i => i.id == Config.GuildID)
    let channel = guild.channels.cache.find(i => i.id == Config.ChannelID)

    let taken = []
    let room1 = getUniqueRoomID(taken)
    taken.push(room1)
    let room2 = getUniqueRoomID(taken)
    taken.push(room2)
    let room3 = getUniqueRoomID(taken)
    taken.push(room3)

    let course = Config.Maps[Math.floor(Math.random() * Config.Maps.length)]

    let emebd = new Discord.MessageEmbed()
    .setTitle("Game starting soon!")
    .setDescription(`
    The next scheduled game will start in 15 minutes in room **${room1}**. If this is full try **${room2}** or **${room3}**.
    
    The course will be **${course}**. If you want to join drop a :thumbsup: reaction on this message so people know there's enough players.
    `)
    .setTimestamp();
    channel.send(emebd).then(function (message) {message.react("👍")})
    main()
}

function getUniqueRoomID(taken){
    let room = Config.RoomIDs[Math.floor(Math.random() * Config.RoomIDs.length)]

    while(taken.includes(room)){
        room = Config.RoomIDs[Math.floor(Math.random() * Config.RoomIDs.length)]
    }
    return room
}

function msToNextHour() {
    return (3600000 - new Date().getTime() % 3600000) - 900000;
}
