var express = require('express');
var app = express();
var moment = require('moment');

var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));


var jsonParser = bodyParser.json();

//var url = 'mongodb://proxisysmongodbserver.cloudapp.net:27017/proxisys';
var url = 'mongodb://user_admin:imr_2017@ds011880.mlab.com:11880/inmyradius';

// Initialize connection once
MongoClient.connect(url, function(err, database) {
    console.log(err);
    if (err) {
        console.log("cannot connect to database");
        throw err;
    } else {
        db = database;
        console.log("successfull connection to database");
    }

    //var collection = db.collection('userInfo');

    // Start the application after the database connection is ready
    // app.listen(process.env.PORT);
    // console.log("Listening ");

});


app.get('/', function(req, res) {

    console.log("Check LOG ");
    res.send('top');

});
app.get('/hello', function(req, res) {
    res.send('Testing!');
});




//____________________________________________________________________________________
//routes for data analytics
//___________________________________________________________________________________

// app.post('/dataGender', jsonParser, function(req, res) {

//     console.log("starting route");

//     var elements = req.body;

//     console.dir(req.body);
//     var maleGenderCount;
//     var femaleGenderCount;
//     var totalGenderCount;

//     var filterMale = { "retailerId": elements.retailerId, "userGender": "male" };
//     var filterFemale = { "retailerId": elements.retailerId, "userGender": "female" };
//     var filterTotal = { "retailerId": elements.retailerId };


//     db.collection('userTransactions').find(filterMale).count(function(err, maleCount) {

//         maleGenderCount = maleCount;
//         console.log("male gender count is" + maleGenderCount);
//         complete();

//     });



//     db.collection('userTransactions').find(filterFemale).count(function(err, femaleCount) {

//         femaleGenderCount = femaleCount;
//         console.log("female gender count is" + femaleGenderCount);
//         complete();
//     });


//     db.collection('userTransactions').find(filterTotal).count(function(err, totalCount) {

//         totalGenderCount = totalCount;
//         console.log("Total gender count is" + totalGenderCount);
//         complete();

//     });


//     function complete() {

//         console.log("calling complete function");

//         if (maleGenderCount != null && femaleGenderCount != null && totalGenderCount != null) {



//             var genderArray = {
//                 "maleGenderCount": maleGenderCount,
//                 "femaleGenderCount": femaleGenderCount,
//                 "totalGenderCount": totalGenderCount

//             };


//             var totalGender = JSON.stringify(genderArray);
//             //console.dir(genderArray);
//             console.dir(totalGender);

//             res.send(totalGender);

//         } else {
//             console.log("didnt finish");
//         }

//     }


// });

app.post('/dataGender', jsonParser, function(req, res) {
    console.log("Starting route");
    var elements = req.body;
    console.dir(req.body);
    db.collection('userTransactions').aggregate(
        { $match: {retailerId:elements.retailerId, userGender: elements.userGender }},
        { $group: { _id: "$userId"}},
        { $group: { _id: null ,count : {$sum: 1}}}
        ,function(err,doc){
            console.dir(doc);
            console.log(doc.length);
            //console.log(doc[0].count);

            if(doc.length == 0)
            {
                var str = 0;
                res.send(str.toString());
                
            }
            else{
                res.send(doc[0].count.toString());
            }
            
        }
    );
});
app.post('/getTotalAdvertisements',jsonParser, function(req,res){
    console.log("Starting route");
    var elements = req.body;
    console.log(req.body);

    db.collection('userTransactions').aggregate(
        {$match: {retailerId: elements.retailerId}},
        {$group: {_id: "$advertisementId"}},
        {$group: {_id: null, count: {"$sum" : 1}}}
        ,function(err,doc){
            console.dir(doc);
            res.send(doc[0].count.toString());
        }
    );
});


app.post('/categorywiseInterests',jsonParser, function (req,res){
    console.log("Starting route categorywiseInterests");
    var elements = req.body;
    if(elements.userGender){
        db.collection('userTransactions').aggregate(
            {$match : {retailerId : elements.retailerId, userGender: elements.userGender}},
            {$group : {_id: '$advertisementCategory', count : {$sum:1}}}
            ,function(err,doc){
                console.dir(doc);
                res.send(doc);
            });
    }
    else{
        db.collection('userTransactions').aggregate(
            {$match : {retailerId : elements.retailerId}},
            {$group : {_id: '$advertisementCategory', count : {$sum:1}}}
            ,function(err,doc){
                console.dir(doc);
                res.send(doc);
            });
    }
});
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
app.post('/ageBasedInterests', jsonParser, function(req,res){
    console.log("Starting route ageBasedInterests");
    var elements = req.body;
    db.collection('userTransactions').aggregate(
        {$match: {retailerId :elements.retailerId}},
        {$group: {_id : "$userMinAge", count : {$sum: 1} }}
        ,function(err, doc){
            res.send(doc);
        }); 
});

app.post('/productwiseInterests',jsonParser, function(req,res){
    console.log("Starting route productwiseInterests");
    var elements = req.body;
    if(elements.userGender){
        db.collection('userTransactions').aggregate(
            {$match : {retailerId : elements.retailerId, userGender: elements.userGender}},
            {$group : {_id: '$productManufacturer', count : {$sum:1}}}
            ,function(err,doc){
                console.dir(doc);
                res.send(doc);
            });
    }
    else{
        db.collection('userTransactions').aggregate(
            {$match : {retailerId : elements.retailerId}},
            {$group : {_id: '$productManufacturer', count : {$sum:1}}}
            ,function(err,doc){
                console.dir(doc);
                res.send(doc);
            });
    }
});


app.post('/distinctUsersAllTime', jsonParser, function(req, res) {
    console.log("Starting route distinctUsersAllTime");
    var elements = req.body;
    console.dir(req.body);
    var distinctCriteria = "userId";
    db.collection('userTransactions').aggregate(
        { $match: { retailerId: elements.retailerId } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
    , function(err,doc) {
        console.dir(doc);
        console.log(doc[0].count);
        res.send(doc[0].count.toString());
    });
});
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
app.post('/weeklyDistinctUsers', jsonParser, function(req, res) {
    console.log("Starting route distinctUsersLastMonth");
    var elements = req.body;
    console.dir(req.body);
    var time = Math.floor(Date.now() / 1000);
    var   newTime = 0;
    newTime = Math.floor(time/86400);
    newTime *= 86400;
    newTime -= 604800;
    var daysCount = [];
    var daysArray = new Array(8);
    for (var i = 0 ; i < 8; i++){
        daysArray[i] = newTime;
        newTime += 86400;
    } 
    console.dir(daysArray);
    for (var i = 0 ; i < 7 ; i++){
        db.collection('userTransactions').aggregate(
        { $project: {retailerId:1, userId:1, timeStamp: {$and:[{$gt:["$timeStamp",daysArray[i]]}, {$lte:["$timeStamp",daysArray[i+1]]}]}}},
        { $match: { retailerId: elements.retailerId } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
        , function(err,doc) {
            console.dir(doc);
                if(doc.length == 0){
                    daysCount.push(0);
                }
                else{
                    console.dir(doc);
                    console.log(doc[0].count);
                    daysCount.push(doc[0].count);
                }
                if(i==7){
                    res.send(daysCount);
                }
    });
    }
});





//____________________________________________________________________________________
//User Stats, Featured Ads and getLoyaltyPoints
//___________________________________________________________________________________




app.post('/userStats', jsonParser, function(req, res) {

    console.log("starting route");
    var obj = JSON.stringify(req.body);
    var elements = req.body;
    console.dir(req.body);
    var timeStamp = Math.floor(Date.now() / 1000);
    var loyaltyPoints;
    var tempTimeStamp;
    var d = new Date(timeStamp * 1000);

    var currDay = ('0' + d.getDate()).slice(-2);

    console.log("the timeStamp day is : " + currDay);
    // var tempTimeStamp= convertTimestamp(timeStamp);




    //first to check if entry exists for the same day or not


    //the structure of the JSON is subject to change:
    //userId
    //userMinAge
    //userGender
    //retailerId
    //advertisementId
    //advertisementCategory
    //advertisementRetailer
    //productManufacturer
    //productName
    //productDiscount
    //productPrice
    //timestamp


    db.collection('userTransactions').find( //checking if entry exists or not
        {
            "userId": elements.userId,
            "retailerId": elements.retailerId,
            "advertisementId": elements.advertisementId
        }).count(function(err, count) {

        if (count > 0) //implies entry exists
        {
            console.log("previous entry exists");


            db.collection('userTransactions').find({
                "userId": elements.userId,
                "retailerId": elements.retailerId,
                "advertisementId": elements.advertisementId
            }).sort({ _id: -1 }).limit(1).forEach(function(doc) {


                console.dir(doc);

                console.log("the timestamp is: " + doc.timeStamp);
                tempTimeStamp = doc.timeStamp;
                var dd = new Date(tempTimeStamp * 1000);

                var tempDay = ('0' + dd.getDate()).slice(-2);
                console.log(tempDay);

                if (tempDay != currDay && tempTimeStamp < timeStamp) //implies that the new entry is for another day so add new entry

                {
                    console.log("adding entry for new day");

                    db.collection('userTransactions').insert({
                        "userId": elements.userId,
                        "userMinAge": elements.userMinAge,
                        "userGender": elements.userGender,
                        "retailerId": elements.retailerId,
                        "advertisementId": elements.advertisementId,
                        "advertisementCategory": elements.advertisementCategory,
                        "advertisementRetailer": elements.advertisementRetailer,
                        "productManufacturer": elements.productManufacturer,
                        "productName": elements.productName,
                        "productDiscount": elements.productDiscount,
                        "productPrice": elements.productPrice,
                        "timeStamp": timeStamp
                    }, function(err) {
                        console.log("added in user Transactions");

                    });


                    //now adding loyalty points

                    db.collection('loyaltyPoints').find({
                        "userId": elements.userId,
                        "retailerId": elements.retailerId

                    }).count(function(err, count) {

                        console.log(count);

                        if (count == 1) //implies entry exists
                        {


                            db.collection('loyaltyPoints').update({
                                "userId": elements.userId,
                                "retailerId": elements.retailerId
                            }, {
                                $set: { "timeStamp": timeStamp },
                                $inc: { "loyaltyPoints": 5 }

                            });
                            console.log("updated loyalty points");
                        } else { //implies we must add new entry


                            //userId
                            //retailerId
                            //advertisementRetailer
                            //timeStamp
                            //loyaltyPoints

                            db.collection('loyaltyPoints').insert({
                                "userId": elements.userId,
                                "retailerId": elements.retailerId,
                                "advertisementRetailer": elements.advertisementRetailer,
                                "timeStamp": timeStamp,
                                "loyaltyPoints": 5
                            }, function(err) {

                                console.log("added new loyalty points");
                            });

                        }


                    });






                } else {
                    console.log("day is the same so we wont add new entries");

                }



            });



        } else {
            console.log("no entries exist at all so we will add new");

            db.collection('userTransactions').insert({
                "userId": elements.userId,
                "userMinAge": elements.userMinAge,
                "userGender": elements.userGender,
                "retailerId": elements.retailerId,
                "advertisementId": elements.advertisementId,
                "advertisementCategory": elements.advertisementCategory,
                "advertisementRetailer": elements.advertisementRetailer,
                "productManufacturer": elements.productManufacturer,
                "productName": elements.productName,
                "productDiscount": elements.productDiscount,
                "productPrice": elements.productPrice,
                "timeStamp": timeStamp
            }, function(err) {
                console.log("added in user Transactions");

            });

            db.collection('loyaltyPoints').find({
                        "userId": elements.userId,
                        "retailerId": elements.retailerId

                    }).count(function(err, count) {

                        console.log(count);

                        if (count == 1) //implies entry exists
                        {


                            db.collection('loyaltyPoints').update({
                                "userId": elements.userId,
                                "retailerId": elements.retailerId
                            }, {
                                $set: { "timeStamp": timeStamp },
                                $inc: { "loyaltyPoints": 5 }

                            });
                            console.log("updated loyalty points");
                        } else { //implies we must add new entry


                            //userId
                            //retailerId
                            //advertisementRetailer
                            //timeStamp
                            //loyaltyPoints

                            db.collection('loyaltyPoints').insert({
                                "userId": elements.userId,
                                "retailerId": elements.retailerId,
                                "advertisementRetailer": elements.advertisementRetailer,
                                "timeStamp": timeStamp,
                                "loyaltyPoints": 5
                            }, function(err) {

                                console.log("added new loyalty points");
                            });

                        }


                    });


        }









    });





    //Hussain's Stuff


    // {
    //           db.collection('loyaltyPoints').find({
    //           "userId" : elements.userId, 
    //           "retailerId": elements.retailerId,

    //       }).toArray(function(err,loyaltyPointsCur){

    //           //console.log(loyaltyPointsCur);


    //           var cursor = db.collection('loyaltyPoints').find({
    //           "userId" : elements.userId, 
    //           "retailerId": elements.retailerId});

    //           cursor.each(function(err,doc){
    //               console.log("using cursor method");
    //              // console.log(doc);

    //               var obj = JSON.stringify(doc);
    //               console.log(obj);

    //           });




    //           loyaltyPoints = loyaltyPointsCur.loyaltyPoints;
    //           console.log(loyaltyPoints);

    //           var a = "2222222";
    //           var b = +a;
    //           console.log(b);

    //           var updatedLoyaltyPoints = +loyaltyPoints
    //           console.log(loyaltyPoints);
    //           loyaltyPoints = loyaltyPoints + 5;
    //           console.log(loyaltyPoints);



    //       });


    //       db.collection('loyaltyPoints').update({ 
    //           "userId" : elements.userId }
    //           , {
    //               $set: {
    //           "userId" : elements.userId,
    //           "retailerId": elements.retailerId,
    //           "advertisementCategory": elements.advertisementCategory,
    //           "advertisementRetailer": elements.advertisementRetailer,
    //           "timeStamp": timeStamp,
    //           "loyaltyPoints" : loyaltyPoints
    //                       }
    //       }, function(err){

    //           console.log("updated loyalty points");
    //       });
    // }  


    //db.collection()






    console.log("Transaction inserted");
    res.send("Success");

});







app.post('/getLoyaltyPoints', jsonParser, function(req, res) {

    console.log("starting of hussain's code");
    console.log("starting route");

    var obj = JSON.stringify(req.body);

    var elements = req.body;

    console.dir(req.body);

    var filterQuery = { "userId": elements.userId };


    db.collection('loyaltyPoints').find(filterQuery).toArray(function(err, loyaltyPointsCur) {

        console.log("returning loyalty Points");
        console.log(loyaltyPointsCur);
        console.log(JSON.stringify(loyaltyPointsCur));
        res.json(loyaltyPointsCur);
        res.end();

    });


});



app.post('/redeemLoyaltyPoints', jsonParser, function(req, res) {

    console.log("starting redeem loyalty points route");

    var elements = req.body;
    var timeStamp = Math.floor(Date.now() / 1000);
    console.log("this is timeStamp" + timeStamp);
    console.log("this is redeemLoyaltyPoints " + elements.redeemLoyaltyPoints);

    console.dir(req.body);

    var filterQuery = { "userId": elements.userId, "retailerId": elements.retailerId };


    db.collection('loyaltyPoints').update({
                                "userId": elements.userId,
                                "retailerId": elements.retailerId
                            }, {
                                $set: { "timeStamp": timeStamp },
                                $inc: { "loyaltyPoints": elements.redeemLoyaltyPoints }

                            });

    console.log("redeemed " + elements.redeemLoyaltyPoints +"loyalty points");
    console.log("now generating coupon code");


    var userCoupon = randomstring(5);
   

    db.collection('redemptionCoupons').insert({
        "userId" : elements.userId,
        "retailerId" : elements.retailerId,
        "advertisementRetailer" : elements.advertisementRetailer,
        "coupon" : userCoupon
    }, function(err){
        if(err){
            ("could not insert in redemption coupons");
        }



    });
    

    
    console.log("successfully generated coupon code: " + userCoupon);


    res.send("success");



});




app.post('/returnLastTenTransactions', jsonParser, function(req, res) {

    console.log("returning last 10 transactions");
    var elements = req.body;
    console.dir(req.body);
    var latestArray;


    db.collection('userTransactions').find({
        "userId": elements.userId
    }).sort({ _id: -1 }).limit(10).toArray(function(err, doc) {

        if (err) {
            res.sendStatus(404);
        } else {
            console.dir(doc);
            res.json(doc);
            res.end();

        }



    });


});




app.post('/returnRetailerRedeemOffers', jsonParser, function(req, res) {

    console.log("returning retailer redeem offers");
    var elements = req.body;
    console.dir(req.body);

    db.collection('retailerRedeemOffers').find({
        "retailerId": elements.retailerId
    }).toArray(function(err, doc) {

        if (err) {
            res.sendStatus(404);
        } else {
            console.dir(doc);
            res.json(doc);
            res.end();

        }



    });

});






app.post('/featuredAds', jsonParser, function(req, res) {


    console.log("starting of hussain's code");
    db.collection('featuredAds').find({}).count(function(err, count) {

        if (err) {
            res.sendStatus(404);
        } else {

            console.log("doc count is " + count);
            console.log("now displaying images");

            db.collection('featuredAds').find().toArray(function(err, ads) {


                if (err) {
                    res.sendStatus(404);
                } else {
                    console.log("returning ads");
                    console.log(ads);
                    console.log(JSON.stringify(ads));
                    res.json(ads);
                    res.end();

                }

            });


        }


    });


});





//____________________________________________________________________________________
//Login Routes and retailer routes
//___________________________________________________________________________________



//____________________________________________________________________________________
//user login
//___________________________________________________________________________________

app.post('/userLogin', jsonParser, function(req, res) {
    // console.log(JSON.stringify(req.body));
    //hussain's code

    console.log("starting of hussain's code");

    var str = '';

    //console.log(req.body);
    var obj = JSON.stringify(req.body);

    var elements = req.body;
    console.log("the user ID is: " + elements.userId);
    console.log("the email id is: " + elements.email);
    console.log("hello");



    db.collection('userInfo').find({
        "userId": elements.userId
    }).count(function(err, count) {

        console.log("doc count is " + count);


        if (count == 1) //implies that entry already exists. now checking if fields have changed
        {
            console.log("entry already exists!");
            console.log("now checking if entires have changed");


            //  console.dir(req.body);
            //console.log(req.body.uid);



            db.collection('userInfo').find({
                "userId": elements.userId,
                "name": elements.name,
                "email": elements.email,
                "gender": elements.gender,
                "minAge": elements.minAge,
                "pictureUrl": elements.pictureUrl
            }).count(function(err, count) {


                if (count == 1) { //implies that the entries havent changed

                    console.log("entries havnent changed");


                } else {

                    var date = new Date();
                    var formattedDate = moment(date).format('YYYY-MM-DD- HH:MM:SS');
                    console.log("the date is: " + formattedDate);

                    db.collection('userInfo').update({
                        "userId": elements.userId
                    }, {
                        $set: {
                            "name": elements.name,
                            "email": elements.email,
                            "gender": elements.gender,
                            "minAge": elements.minAge,
                            "pictureUrl": elements.pictureUrl,
                            "lastModified": elements.lastModified
                        }
                    }, function(err) {

                        console.log("profile updated!");
                    });
                }
            });



        } else {

            console.log("there is no entry");


            db.collection('userInfo').insertOne(req.body, function(err) {
                console.log("Inserted");
                //return err;

            });

            console.log("added entry");
            console.log(req.body);


        }

    });
    res.send("Success!!");
    console.log("end of hussain's code");
});


//____________________________________________________________________________________
//retailer login, add retailer advertisements, delete retailer Advertisements, get retailer Advertisements
//retailer Beacons
//___________________________________________________________________________________



app.post('/retailerLogin', jsonParser, function(req, res) {
    // console.log(JSON.stringify(req.body));
    //hussain's code

    console.log("starting of hussain's code");

    var str = '';

    var obj = JSON.stringify(req.body);
    console.dir(req.body);
    var elements = req.body;
    console.log("the user name is: " + elements.userName);
    console.log("the password is: " + elements.password);


    db.collection('retailerLogin').find({
        "userName": elements.userName,
        "password": elements.password
    }).count(function(err, count) {

        console.log("doc count is " + count);

        if (count == 1) //implies that the retailer exists
        {
            db.collection('retailerLogin').find({ "userName": elements.userName }).toArray(function(err, retailer) {
                console.log("retailer id");
                console.log(retailer);
                console.log(JSON.stringify(retailer));
                res.send(JSON.stringify(retailer));
            });


        } else //implies wrong username and password
        {
            res.sendStatus(404);
        }


    });


});

app.post('/getRetailerAdvertisementsCount', jsonParser, function(req,res){


    console.log("starting get retailer advertisements count route");

    var elements = req.body;
    console.dir(req.body);

    db.collection("retailerAdvertisements").find({
        "retailerId" : elements.retailerId
    }).count(function(err,count){

        if(err){
            res.sendStatus(404);
        }

        else{
            console.log(count);
            res.send(count.toString());
            
        }

    });

});



app.post('/addRetailerAdvertisement',jsonParser, function(req,res){

    console.log("starting add retailer advertisements");
    var elements = req.body;

    console.dir(req.body);

    db.collection("retailerAdvertisements").insert({
    "retailerId" : elements.retailerId,
    "advertisementId" : elements.advertisementId
    }, function(err){
        if(err){
            res.sendStatus(404);
        }
        else{
            console.log("added advertisement");
            res.sendStatus(200);
        }

    });

});


app.post('/removeRetailerAdvertisement',jsonParser,function(req,res){

    console.log("starting remove retailer advertisements route");

    var elements = req.body;
    console.dir(req.body);

    db.collection("retailerAdvertisements").remove({
    "retailerId" : elements.retailerId,
    "advertisementId" : elements.advertisementId
    }, function(err){
        if(err){
            res.sendStatus(404);
        }
        else{
            console.log("removed advertisement");
            res.sendStatus(200);
        }

    });


});


app.post('/getRetailerBeacons', jsonParser, function(req,res){

    console.log("starting get retailer beacon route");

    var elements = req.body;
    console.dir(req.body);

    db.collection("retailerBeacons").find({
        "retailerId" : elements.retailerId
    }).toArray(function(err,doc){

        if(err){
            res.sendStatus(404);
        }
        else{
            console.dir(doc);
            res.json(doc);
            res.end();
        }
    });
});



app.post('/getRetailerCoupons', jsonParser, function(req,res){

    console.log("starting get retailer coupons route");

    var elements =  req.body;
    console.dir(req.body);

    db.collection("redemptionCoupons").find({
        "retailerId" : elements.retailerId
    }).toArray(function(err,doc){

        if(err){
            res.sendStatus(404);
        }
        else{
            console.dir(doc);
            res.json(doc);
            res.end();
        }
    });
});


app.post("/deleteRetailerCoupons", jsonParser, function(req,res){

    console.log("starting route delete retailer coupons");

    var elements = req.body;

    console.dir(req.body);


    db.collection("redemptionCoupons").remove({
        "userId" : elements.userId,
        "retailerId" : elements.retailerId,
        "coupon" : elements.coupon
    }, function(err){
        if(err){
            res.sendStatus(404);
        }

        else{
            res.send("success");
        }

    });
});


app.post('/testingRandomString' , jsonParser, function(req,res){

    var str = randomstring(5);
    res.send(str);
});




function convertTimestamp(timestamp) {
    var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2), // Add leading 0.
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM  
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
}



function randomstring(L){
    var s= '';
    var randomchar=function(){
        var n= Math.floor(Math.random()*62);
        if(n<10) return n; //1-10
        if(n<36) return String.fromCharCode(n+55); //A-Z
        return String.fromCharCode(n+61); //a-z
    }
    while(s.length< L) s+= randomchar();
    return s;
}













//_____________________________________________________________________________________________________________________________________

//_____________________________________________________________________________________________________________________________________

//_____________________________________________________________________________________________________________________________________

//_____________________________________________________________________________________________________________________________________

//_____________________________________________________________________________________________________________________________________

//ds assignment





app.post('/tellerLogin', jsonParser, function(req, res) {
    // console.log(JSON.stringify(req.body));
    //hussain's code

    console.log("starting of hussain's code");

    var str = '';

    var obj = JSON.stringify(req.body);
    console.dir(req.body);
    var elements = req.body;
    console.log("the user name is: " + elements.userName);
    console.log("the password is: " + elements.password);


    db.collection('tellerLogin').find({
        "userName": elements.userName,
        "password": elements.password
    }).count(function(err, count) {

        console.log("doc count is " + count);

        if (count == 1) //implies that the teller exists
        {
            db.collection('tellerLogin').find({ "userName": elements.userName }).toArray(function(err, retailer) {
                console.log("teller id");
                console.log(retailer);
                console.log(JSON.stringify(retailer));
                res.send(JSON.stringify(retailer));
            });


        } else //implies wrong username and password
        {
            res.sendStatus(404);
        }


    });


});


app.post('/tellerSignUp',jsonParser, function(req,res){

    console.log("starting add teller");
    var elements = req.body;

    console.dir(req.body);

    db.collection("tellerLogin").insert({
        "userName": elements.userName,
        "password": elements.password,
        "tellerId": elements.tellerId
    }, function(err){
        if(err){
            res.sendStatus(404);
        }
        else{
            console.log("added teller");
            res.sendStatus(200);
        }

    });

});




app.post('/stockBrokerLogin', jsonParser, function(req, res) {
    // console.log(JSON.stringify(req.body));
    //hussain's code

    console.log("starting of hussain's code");

    var str = '';

    var obj = JSON.stringify(req.body);
    console.dir(req.body);
    var elements = req.body;
    console.log("the user name is: " + elements.userName);
    console.log("the password is: " + elements.password);


    db.collection('stockBrokerLogin').find({
        "userName": elements.userName,
        "password": elements.password
    }).count(function(err, count) {

        console.log("doc count is " + count);

        if (count == 1) //implies that the teller exists
        {
            db.collection('stockBrokerLogin').find({ "userName": elements.userName }).toArray(function(err, retailer) {
                console.log("teller id");
                console.log(retailer);
                console.log(JSON.stringify(retailer));
                res.send(JSON.stringify(retailer));
            });


        } else //implies wrong username and password
        {
            res.sendStatus(404);
        }


    });


});


app.post('/stockBrokerSignUp',jsonParser, function(req,res){

    console.log("starting add stock broker");
    var elements = req.body;

    console.dir(req.body);

    db.collection("stockBrokerLogin").insert({
        "userName": elements.userName,
        "password": elements.password,
        "stockBrokerId": elements.stockBrokerId
    }, function(err){
        if(err){
            res.sendStatus(404);
        }
        else{
            console.log("added stock broker");
            //res.sendStatus(200);
        }

    });

    console.log("adding initial stock");

    db.collection("stocks").insert({
        "stockBrokerId": elements.stockBrokerId,
        "totalStock": 1000,
        "stockSold": 0,
        "stockHold": 1000
    }, function(err){
        if(err){
            res.sendStatus(404);
        }
        else{
            console.log("added initial 1000 stock");
            res.sendStatus(200);
        }

    });


});




app.post('/returnStock', jsonParser, function(req, res) {
    // console.log(JSON.stringify(req.body));
    //hussain's code

    console.log("starting of hussain's code");

    var str = '';

    var obj = JSON.stringify(req.body);
    console.dir(req.body);
    var elements = req.body;
    console.log("the user name is: " + elements.stockBrokerId);



    db.collection('stocks').find({
        "stockBrokerId": elements.stockBrokerId,
    }).count(function(err, count) {

        console.log("doc count is " + count);

        if (count == 1) //implies that the teller exists
        {
            db.collection('stocks').find({ "stockBrokerId": elements.stockBrokerId }).toArray(function(err, stockss) {
                console.log("stocks for stock broker");
                console.log(stockss);
                console.log(JSON.stringify(stockss));
                res.send(JSON.stringify(stockss));
            });

        } else 
        {
            res.sendStatus(404);
        }


    });


});







var port = process.env.port || 8080;

app.listen(port);
console.log("Server is up on port["+port+"]! Magic waiting to happen!!");
