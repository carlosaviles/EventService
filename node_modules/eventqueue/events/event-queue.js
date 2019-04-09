var amqp = require('amqplib/callback_api');
var channel;
var receivingQueue;
var eventType;
var connectionReady = () => {};
var amqpURL = process.env.AMQPURL || 'amqp://localhost';

var channelErrorCallback = (err) => {
    console.log('Channel error');
    console.log(err);
};

var bindQueueCallback = (err, ok) => {
    console.log('Reading events for type ' + eventType);
    module.exports.connectionReady();
}

var assertQueueCallback = (err, q) => {

    receivingQueue = q;
    // Bind queue for receiving to Events exchange
    channel.bindQueue(receivingQueue.queue, 'Events', eventType, {}, bindQueueCallback);
};

var assertExchangeCallback = (err, ok) => {

    console.log('Exchange for sending Events ready');

    // Create queue for receiving
    channel.assertQueue('', {exclusive:true}, assertQueueCallback);
};

var createChannelCallback = function(err, ch) {
    channel = ch;
    channel.on('error', channelErrorCallback);
    channel.prefetch(1);

    // This is for sending 
    channel.assertExchange('Events', 'direct', {durable: false}, assertExchangeCallback);
    
};

var connectCallback = function(err, conn) {

    if(err) {
        console.log('Unable to connect to AMQP');
        console.log(err);
        console.log('Will retry in 5 seconds');
        setTimeout(doConnect, 5000);
    } else if (!conn) {
        console.log('AMQP connection is ' + conn);
    } else {
        conn.createChannel(createChannelCallback);
    }
    
};

var publishEvent = (msg, name) => {
    console.log('Published event ' + name + ':' + JSON.stringify(msg));
    try {
        channel.publish('Events', name, Buffer.from(JSON.stringify(msg)));
    } catch(error) {
        console.log(error);
    }
    
};

var setConsumeCallback = function(cb) {
    channel.consume(receivingQueue.queue, cb);
};

var connect = function(cb, eventTypeFromWhichReceive){  

    if(cb) {
        connectionReady = cb;
        module.exports.connectionReady = cb;
    }

    eventType = eventTypeFromWhichReceive;
    
    doConnect();
};

var doConnect = function() {
    amqp.connect(amqpURL, connectCallback);
}

var getChannel = function() {
    return channel;
}

module.exports.AMQP = amqp;
module.exports.connectCallback = connectCallback;
module.exports.createChannelCallback = createChannelCallback;
module.exports.setConsumeCallback = setConsumeCallback;
module.exports.connect = connect;
module.exports.connectionReady = connectionReady;
module.exports.publishEvent = publishEvent;
module.exports.assertQueueCallback = assertQueueCallback;
module.exports.channelErrorCallback = channelErrorCallback;
module.exports.bindQueueCallback = bindQueueCallback;
module.exports.assertExchangeCallback = assertExchangeCallback;
module.exports.getChannel = getChannel;