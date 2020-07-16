// var configAuth = require('./../config/auth.js');
var date = new Date();
var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 3);

module.exports = {

    'WebAuthenticationDetail': {
        'UserCredential': {
            'Key': '', //Your Key given by FedEx
            'Password': '' //Your Password given by FedEx
        }
    },
    'ClientDetail': {
        'AccountNumber': '', //Your Account Number given by FedEx
        'MeterNumber' : '251823183' //Your Meter Number given by FedEx
    },    
    'TransactionDetail': {
        'CustomerTransactionId': '', //Your Unique Transactional ID
    },
    'Version': {
        'ServiceId': 'crs',
        'Major': '20', 
        'Intermediate': '0',
        'Minor': '0'
    },
    'ReturnTransitAndCommit': true,
    'RequestedShipment': {
        'ShipTimestamp': new Date(tomorrow.getTime() + (24*60*60*1000)).toISOString(),
        'DropoffType': 'REGULAR_PICKUP',
        'ServiceType': 'INTERNATIONAL_PRIORITY',
        'PackagingType': 'YOUR_PACKAGING',
        'TotalWeight': {
            'Units': 'KG',
            'Value': "10"
        },
        'Shipper': {
            'Contact': {
                'CompanyName': 'Company Name',
                'PhoneNumber': '5555555555'
            },
            'Address': {
                'StreetLines': [
                'Address Line 1'
                ],
                'City': 'Dubai',
                'StateOrProvinceCode': '',
                'PostalCode': '',
                'CountryCode': 'AE'
            }
        },
        'Recipient': {
            'Contact': {
                'PersonName': 'Recipient Name',
                'PhoneNumber': '5555555555'
            },
            'Address': {
                'StreetLines': [
                'Address Line 1'
                ],
                'City': 'Jeddah',
                'StateOrProvinceCode': '',
                'PostalCode': '',
                'CountryCode': 'SA'
            }
        },
        'ShippingChargesPayment': {
            'PaymentType': 'SENDER',
            'Payor': {
                'ResponsibleParty': {
                    'AccountNumber': '260817302' //Your Account Number given by FedEx
                }
            }
        },
        'RateRequestTypes': 'LIST',
        'PackageCount': '1',
        'RequestedPackageLineItems': {
            'GroupPackageCount': 1,
            'Weight': {
                'Units': 'KG',
                'Value': "100"
            },
            'Dimensions': {
                'Length': "4",
                'Width': "6",
                'Height': "10",
                'Units': "IN"
            }
        }
    }

};
