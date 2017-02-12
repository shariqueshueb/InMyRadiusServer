
app.post('/dataGender', jsonParser, function(req, res) {
    console.log("Starting route");
    var elements = req.body;
    console.dir(req.body);
    var maleGenderCount;
    var femaleGenderCount;
    var totalGenderCount;
    db.collection('userTransactions').aggregate(
        { $match: {retailerId:elements.retailerId, userGender: elements.userGender }},
        { $group: { _id: "$userId"}},
        { $group: { _id: null ,count : {$sum: 1}}}
        ,function(err,doc){
            res.send(doc);
        }
    );
});
