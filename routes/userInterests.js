app.post('/userInterests', jsonParser, function(req, res) {
    console.log("Starting route /userInterests");
    var elements = req.body;
    console.dir(req.body);
    db.collection('userTransactions').aggregate(
    	{ $match: { userId: elements.userId } },
    	{ $group: { _id: "$advertisementCategory", count: { $sum: 1 } } }
    	,function(err, doc) {
        console.dir(doc);
        res.send(doc);
    });
});
