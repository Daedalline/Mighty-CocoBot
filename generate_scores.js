const fs = require("fs");

//Load the maps file
let Maps = null;
try {
    let mapContents = fs.readFileSync('./maps.json');
    Maps = JSON.parse(mapContents)
}
catch (e) {
    console.log(e);
}

let data = JSON.parse("{}");

Maps.Leaderboards.forEach(map => {
    data[map] = {};
});

var writedata = JSON.stringify(data, null, "\t");
fs.writeFileSync('./data.json', writedata);

