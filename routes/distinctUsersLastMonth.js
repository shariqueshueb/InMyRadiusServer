app.post('/distinctUsersLastMonth', jsonParser, function(req, res) {
    console.log("Starting route distinctUsersLastMonth");
    var elements = req.body;
    console.dir(req.body);
    var time = Math.floor(Date.now() / 1000);
    time -= 2592000;
    var distinctCriteria = "userId";
    db.collection('userTransactions').aggregate(
        { $project: {retailerId:1, userId:1, timeStamp: {$gt:["$timeStamp",time]}}},
        { $match: { retailerId: elements.retailerId } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
    , function(err,doc) {
        console.dir(doc);
        console.log(doc[0].count);
        res.send(doc[0].count.toString());
    });
});