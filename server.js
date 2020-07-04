var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 8080;

var soap = require('soap');

var url = path.join(__dirname, 'wsdl', 'RateService_v20.wsdl');
var params = require('./params/rateRequest.js');
var arr = require('./tarray.js');
const { resolve } = require('path');
const { rejects } = require('assert');
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
    params = setODPair(params, "AE", "SA");
    params = setService(params, service.IEF);
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
                        if  (err) {
                            reject(err);
                        } else if (result.RateReplyDetails) {
                            resolve(result.RateReplyDetails[0].CommitDetails[0].CommitTimestamp);
                        } else {
                            resolve(result)
                        }
                    });
                }
            });
        })
    });

    Promise.allSettled(arrOfPromises).then(allRes => {
        res.send(allRes);
    }).catch(err => res.status(500).send(err))
});


app.listen(port, function () {
    console.log('Soap app listening on port ' + port);
});

function setService(trans, svc) {
    if ((svc === "INTERNATIONAL_PRIORITY_FREIGHT" || "INTERNATIONAL_ECONOMY_FREIGHT")) {
        trans.RequestedShipment.TotalWeight.Value = '100';
    } else {
        trans.RequestedShipment.TotalWeight.Value = '10';
    }

    trans.RequestedShipment.ServiceType = svc;
    console.log(trans.RequestedShipment.TotalWeight.Value);
    return trans;
}



function setODPair(trans, Origin, Dest, O_City, D_City) {
    trans.RequestedShipment.Recipient.Address.City = D_City;
    trans.RequestedShipment.Recipient.Address.CountryCode = Dest;
    trans.RequestedShipment.Shipper.Address.City = O_City;
    trans.RequestedShipment.Shipper.Address.CountryCode = Origin;
    return trans;
}
