app.post('/categorywiseInterests',jsonParser, function (req,res){
	var elements = req.body;
	db.collection('userTransactions').aggregate({
		{$match : {retailerId : elements.retailerId}},
		{$group : {_id: 'advertisementCategory', $count : {$sum:1}}}
		,function(err,doc){
			console.dir(doc);
			res.send(doc);
		}
	});
});