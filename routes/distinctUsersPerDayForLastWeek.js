app.post('/weeklyDistinctUsers', jsonParser, function(req, res) {
    console.log("Starting route distinctUsersLastMonth");
    var elements = req.body;
    console.dir(req.body);
    var time = Math.floor(Date.now() / 1000);
    var   newTime = 0;
    newTime = time/86400;
    newTime *= 86400;
    newTime -= 604800;
    var daysCount = new Array(7);
    var daysArray = new Array(8);
    for (var i = 0 ; i < 8; i++){
        daysArray[i] = newTime;
        newTime += 86400;
    }
    console.dir(daysArray);
    for (var i = 0 ; i < 7 ; i++){
        db.collection('userTransactions').aggregate(
        { $project: {retailerId:1, userId:1, timeStamp: {$gt:["$timeStamp",daysArray[i]], $lte:["$timeStamp",daysArray[i+1]]}}},
        { $match: { retailerId: elements.retailerId } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
        , function(err,doc) {
        console.log(doc[0].count);
        res.write("Day "+i+": "+doc[0].count.toString());
        if(i==6){
            res.end();
        }
    });
    }
});