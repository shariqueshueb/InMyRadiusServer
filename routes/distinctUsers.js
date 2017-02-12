app.post('/distinctUsersAllTime', jsonParser, function(req, res) {
    console.log("starting route");
    var elements = req.body;
    console.dir(req.body);
    var distinctCriteria = "userId";
    db.collection('userTransactions').aggregate([
        { $match: { retailerId: elements.retailerId } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
    ], function(doc) {
        console.log(doc.count);
        res.send(doc.count);
    });
});
