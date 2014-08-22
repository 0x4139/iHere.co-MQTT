var mqtt = require('mqtt')

client = mqtt.createClient(1883, '178.62.165.114');
var i=0;

client.subscribe('presence');
client.publish('presence', 'Message: '+i);

client.on('message', function (topic, message) {
  console.log(message);
  i++;
  client.publish('presence', 'Message: '+i);
});
