const fs = require("fs");

let mapContents = fs.readFileSync('./maps.json');
let Maps = JSON.parse(mapContents)

let rawdata = fs.readFileSync('./data.json');
let data = JSON.parse(rawdata); 

let newData = {};

Maps.Leaderboards.forEach(map => {
    
    console.log(map);
    
    var players = data[map];
    
    var simpleData = {};
    for(var player in players){
        simpleData[player] = players[player];
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
    
    //console.log(sortable);

    var topTwenty = {};
    for (let i = 0; i < 20; i++) {
       console.log(sortable[0]);
    }
    
    newData[map] = topTwenty;
  
});

console.log(newData);

