

var ODPair = {'AE SA': {Origin: "AE", Destination: "SA", Origin_City: "Dubai", Dest_City: "Jeddah"},
'AE OM': {Origin: "AE", Destination: "OM", Origin_City: "Dubai", Dest_City: "Muscat"}};

Object.keys(ODPair).forEach(function(key) {
  console.log(key, ODPair[key]);
});
