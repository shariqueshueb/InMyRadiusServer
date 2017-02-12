app.post('getTotalAdvertisements',jsonParser, function(req,res){
	console.log("Starting route");
	var elements = req.body;
	console.log(req.body);

	db.collection('userTransactions').aggregate(
		{$match: {retailerId: elements.retailerId}},
		{$group: {_id: "advertisementId", count : {$sum : 1}}}
		,function(err,doc){
			res.send(doc[0].count);
		}
	);
});