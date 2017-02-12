app.post('/ageBasedInterests', jsonParser, function(req,res){
	console.log("Starting route ageBasedInterests");
	var elements = req.body;
	db.collection('userTransactions').aggregate(
		{$match: retailerId :elements.retailerId},
		{$group: _id : "$userMinAge", count : {$sum: 1}}
		,function(err, doc){
			res.send(doc);
		});	
	}
});