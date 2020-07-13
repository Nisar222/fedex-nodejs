var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 8080;
var captureRequest = '';
var fs = require('fs');
var outputvalues = '';

var soap = require('soap');

var url = path.join(__dirname, 'wsdl', 'RateService_v20.wsdl');
var params = require('./params/rateRequest.js');
var arr = require('./badarray.js');
const { resolve } = require('path');
const { rejects } = require('assert');
const { findIndex } = require('./array.js');
const { resolveCname } = require('dns');
var ODPair = { Origin: "AE", Destination: "SA", Origin_City: "Dubai", Dest_City: "Jeddah" };
var service = { IP: "INTERNATIONAL_PRIORITY", IE: "INTERNATIONAL_ECONOMY", IPF: "INTERNATIONAL_PRIORITY_FREIGHT", IEF: "INTERNATIONAL_ECONOMY_FREIGHT" }

app.get('/', function (req, res) {
    res.send('Hello World');
});

app.get('/describe', function (req, res) {
    soap.createClient(url, function (err, client) {
        res.send(client.describe());
    });
});

app.get('/rate', function (req, res) {
    params = setODPair(params, "AE", "SA", "Dubai","Jeddah", "AE SA");
    params = setService(params, service.IP);
    soap.createClient(url, function (err, client) {
        client.getRates(params, function (err, result) {
            // res.json(result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
            res.json(result);
            console.log(result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
            console.log(result);
        });
    });
});


app.get('/rates', function (req, res) {
    const arrOfPromises = arr.map(item => {
        return new Promise((resolve, reject) => {
            const params1 = setODPair(params, item.Orig, item.Dest, item.Origin_City, item.Dest_City);         
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client.getRates(params1, (err, result) => {
                        if (err) {
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            resolve(result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
                            // console.log(arr);
                            // I need to write to the original Object with teh result
                        } else {
                            reject(result);
                        }
                    });
                }
            });
        });
    });

          
    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
        allRes.forEach(element => {
            fs.appendFile('./response.json', JSON.stringify(element.value, null, 2), function (err, data) {
                if (err) {
                    return console.log(err);
                }
                console.log(data);
            });           
        }); 
    }).catch(err => console.log(err));
    
    // Promise.allSettled(arrOfPromises).then(allRes => {
    //     res.send(allRes);
    //     fs.appendFile('./response.json', JSON.stringify(allRes, null, 2), function (err, data) {
    //         if (err) {
    //             return console.log(err);
    //         }
    //         console.log(data);
    //     });
    // }).catch(err => console.log(err));// (err => res.status(500).send(err));
});


app.listen(port, function () {
    console.log('Soap app listening on port ' + port);
});

function setService(trans, svc) {
    if ((svc === "INTERNATIONAL_PRIORITY_FREIGHT" || "INTERNATIONAL_ECONOMY_FREIGHT")) {
        trans.RequestedShipment.TotalWeight.Value = '10';
        trans.RequestedShipment.RequestedPackageLineItems.Weight.Units = 'KG';
        trans.RequestedShipment.RequestedPackageLineItems.Weight.Value = '10';
    } else {
        trans.RequestedShipment.TotalWeight.Value = '100';
        trans.RequestedShipment.RequestedPackageLineItems.Weight.Units = 'KG';
        trans.RequestedShipment.RequestedPackageLineItems.Weight.Value = '100';
    }

    trans.RequestedShipment.ServiceType = svc;
    console.log(trans.RequestedShipment.TotalWeight.Value);
    return trans;
}



function setODPair(trans, Origin, Dest, O_City, D_City, srvc, ODPairval) {
    trans.RequestedShipment.Recipient.Address.City = D_City;
    trans.RequestedShipment.Recipient.Address.CountryCode = Dest;
    trans.RequestedShipment.Shipper.Address.City = O_City;
    trans.RequestedShipment.Shipper.Address.CountryCode = Origin;
    trans.TransactionDetail.CustomerTransactionId = ODPairval;
    setService(trans, srvc);
    return trans;
}






//----------------------------

app.get('/IPrates', function (req, res) {
    const arrOfPromises = arr.map(item => {
        return new Promise((resolve, reject) => {
            var srvc = 'INTERNATIONAL_PRIORITY';
            const params1 = setODPair(params, item.Orig, item.Dest, item.Origin_City, item.Dest_City, srvc, item.ODPair);
            // console.log(allRes);   
                        // write request transaction details to file
                        // outputvalues = item.Orig + "," + item.Dest + "," + item.Origin_City + "," + item.Dest_City + ",";

                        // fs.appendFile('./response.json', JSON.stringify(outputvalues), function (err, data) {
                        //     if (err) {
                        //         return console.log(err);
                        //     }
                        //     console.log(data);
                        // });           
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client.getRates(params1, (err, result) => {
                        if (err) {
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            if(result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp == 'undefined') 
                            {
                                reject("Commit Not Available");
                            } else
                                {  
                                resolve(result.TransactionDetail.CustomerTransactionId + " + " + result.RateReplyDetails[0].DeliveryStation + result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp + "\n");
                                 
                                //write result to file  
                                    fs.appendFile('./response.json', JSON.stringify(outputvalues), function (err, data) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        console.log(data);
                                    });
                            }
                        } else {
                            reject(result);
                        }
                    });
                }   
            });
        });
    });
    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
        
        fs.appendFile('./response.json', JSON.stringify(allRes), function (err, data) {
            if (err) {
                return console.log(err);
            }
            // console.log(allRes);
        });
    }).catch(err => res.status(500).send(err));

});


//-------------IPF Rates---------------------//

app.get('/IPFrates', function (req, res) {
    const arrOfPromises = arr.map(item => {
        return new Promise((resolve, reject) => {
            var srvc = 'INTERNATIONAL_PRIORITY_FREIGHT';
            const params1 = setODPair(params, item.Orig, item.Dest, item.Origin_City, item.Dest_City, srvc, item.ODPair);
            // console.log(allRes);              
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client.getRates(params1, (err, result) => {
                        if (err) {
                            console.log(result);
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            console.log(result);
                            resolve(result.TransactionDetail.CustomerTransactionId + " + " + result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
                        } else {
                            reject(result);
                        }
                    });
                }
            });
        });
    });
    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
        fs.appendFile('./response.json', JSON.stringify(allRes), function (err, data) {
            if (err) {
                return console.log(err);
            }
            // console.log(allRes);
        });
    }).catch(err => res.status(500).send(err));

});



//-------------IE Rates---------------------//

app.get('/IErates', function (req, res) {
    const arrOfPromises = arr.map(item => {
        return new Promise((resolve, reject) => {
            var srvc = 'INTERNATIONAL_ECONOMY';
            const params1 = setODPair(params, item.Orig, item.Dest, item.Origin_City, item.Dest_City, srvc, item.ODPair);
            // console.log(allRes);              
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client.getRates(params1, (err, result) => {
                        if (err) {
                            console.log(result);
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            resolve(result.TransactionDetail.CustomerTransactionId + " + " + result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
                        } else {
                            reject(result);
                        }
                    });
                }
            });
        });
    });
    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
        fs.appendFile('./response.json', JSON.stringify(allRes), function (err, data) {
            if (err) {
                return console.log(err);
            }
            // console.log(allRes);
        });
    }).catch(err => res.status(500).send(err));

});


//-------------IEF Rates---------------------//

app.get('/IEFrates', function (req, res) {
    const arrOfPromises = arr.map(item => {
        return new Promise((resolve, reject) => {
            var srvc = 'INTERNATIONAL_ECONOMY_FREIGHT';
            const params1 = setODPair(params, item.Orig, item.Dest, item.Origin_City, item.Dest_City, srvc, item.ODPair);
            // console.log(allRes);              
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    client.getRates(params1, (err, result) => {
                        if (err) {
                            console.log(result);
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            resolve(result.TransactionDetail.CustomerTransactionId + " + " + result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
                        } else {
                            reject(result);
                        }
                    });
                }
            });
        });
    });
    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
        fs.appendFile('./response.json', JSON.stringify(allRes), function (err, data) {
            if (err) {
                return console.log(err);
            }
            // console.log(allRes);
        });
    }).catch(err => res.status(500).send(err));

});
