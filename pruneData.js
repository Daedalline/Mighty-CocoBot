const fs = require("fs");

//Load the data file
let Data = null;
try {
    let rawdata = fs.readFileSync('old_data.json');
    Data = JSON.parse(rawdata); 
    }
catch (e) {
    console.log(e);
}

for(var map in Data){
	var players = Data[map];
    
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
    
    var sortedData = {}
    sortable.forEach(function(item){
        sortedData[item[0]]=item[1][0];
    })
    
    var index = 0
    for(player in sortedData){
        if(index >= 10){
            delete simpleData[player];
        }
        index ++
    }
    
    
    try {
        var writedata = JSON.stringify(simpleData, null, "\t");
        fs.writeFileSync('./data_new.json', writedata);
    }
    catch (e) {
        console.log(e);
    }
}
