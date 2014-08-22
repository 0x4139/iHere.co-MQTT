## Installation

    npm install mqtt

## Example

First you will need to install and run a broker, such as
[Mosquitto](http://mosquitto.org) or
For the sake of simplicity, let's put the subscriber and the publisher in the same file:
```js
var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost');

client.subscribe('presence');
client.publish('presence', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(message);
});

client.end();
```

output:
```
Hello mqtt
```
## Client API usage

See: [examples/client](https://github.com/adamvr/MQTT.js/tree/master/examples/client)

### Simple publish client

```js
var mqtt = require('mqtt')
  , client = mqtt.createClient();

client.publish('messages', 'mqtt');
client.publish('messages', 'is pretty cool');
client.publish('messages', 'remember that!', {retain: true});
client.end();
```

### Simple subscribe client

```js
var mqtt = require('mqtt')
  , client = mqtt.createClient();

client.subscribe('messages');
client.publish('messages', 'hello me!');
client.on('message', function(topic, message) {
  console.log(message);
});
client.options.reconnectPeriod = 0;  // disable automatic reconnect
```

### Connect using a URL

Using the connect method, which can create either a normal or secure MQTT client.

```js
var mqtt = require('mqtt')
  , client = mqtt.connect('mqtt://user:pass@localhost?clientId=123abc');

client.subscribe('messages');
client.publish('messages', 'hello me!');
client.on('message', function(topic, message) {
  console.log(message);
});
```

Supports `mqtt://` and `tcp://` for normal connections, and `mqtts://` or `ssl://` for secure connections.

As seen above the `clientId` can be passed in as a query parameter.

### Chainable API!

```js
var mqtt = require('mqtt')
  , client = mqtt.createClient();

client
  .subscribe('messages')
  .publish('presence', 'bin hier')
  .on('message', function(topic, message) {
    console.log(topic);
  });
```

## Server API usage

### Broadcast server example

Included in [examples/broadcast.js](https://github.com/adamvr/MQTT.js/blob/master/examples/server/broadcast.js):

```js
var mqtt = require('mqtt');

mqtt.createServer(function(client) {
  var self = this;

  if (!self.clients) self.clients = {};

  client.on('connect', function(packet) {
    client.connack({returnCode: 0});
    client.id = packet.clientId;
    self.clients[client.id] = client;
  });

  client.on('publish', function(packet) {
    for (var k in self.clients) {
      self.clients[k].publish({topic: packet.topic, payload: packet.payload});
    }
  });

  client.on('subscribe', function(packet) {
    var granted = [];
    for (var i = 0; i < packet.subscriptions.length; i++) {
      granted.push(packet.subscriptions[i].qos);
    }

    client.suback({granted: granted, messageId: packet.messageId});
  });

  client.on('pingreq', function(packet) {
    client.pingresp();
  });

  client.on('disconnect', function(packet) {
    client.stream.end();
  });

  client.on('close', function(err) {
    delete self.clients[client.id];
  });

  client.on('error', function(err) {
    client.stream.end();
    console.log('error!');
  });
}).listen(1883);
```
