jest.mock('amqplib/callback_api');
//var amqp = require('amqplib/callback_api');

beforeEach(()=> {
   jest.clearAllMocks();
});

test('Connect method exists', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');
    expect(EventsQueue.connect).not.toBeUndefined();
    expect(EventsQueue.connect).toBeInstanceOf(Function);
});

test('Connect sets up send channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var eventTypeName = '' + Math.floor(Math.random() * 1000); // Generate random event type name

    EventsQueue.connect(() => {}, eventTypeName);

    expect(EventsQueue.AMQP.connect).toHaveBeenCalled();
    expect(EventsQueue.AMQP.connect).toHaveBeenCalledWith('amqp://localhost', EventsQueue.connectCallback);
    expect(EventsQueue.AMQP.mockConnection.createChannel).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockConnection.createChannel).toHaveBeenCalledWith(EventsQueue.createChannelCallback);
    expect(EventsQueue.AMQP.mockChannel.assertQueue).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockChannel.assertQueue).toHaveBeenCalledWith('', {exclusive: true}, EventsQueue.assertQueueCallback);
    expect(EventsQueue.AMQP.mockChannel.assertExchange).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockChannel.assertExchange).toHaveBeenCalledWith('Events', 'direct', {durable: false}, EventsQueue.assertExchangeCallback);
    expect(EventsQueue.AMQP.mockChannel.bindQueue).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockChannel.bindQueue).toHaveBeenCalledWith(EventsQueue.AMQP.mockQueue.queue, 'Events', eventTypeName,{}, EventsQueue.bindQueueCallback);
});

test('setConsumeCallback method exists', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    expect(EventsQueue).toHaveProperty('setConsumeCallback');
    expect(EventsQueue.setConsumeCallback).toBeInstanceOf(Function);
});

test('setConsumeCallback applies callback to channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');
    EventsQueue.connect(()=>{});
    
    var mockCallback = function() {

    };

    EventsQueue.setConsumeCallback(mockCallback);

    expect(EventsQueue.AMQP.mockChannel.consume).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockChannel.consume).toHaveBeenCalledWith(EventsQueue.AMQP.mockQueue.queue, mockCallback);
});

test('Connect sets connectionReady callback property', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var mockConnectionReadyCallback = function() {

    };

    EventsQueue.connect(mockConnectionReadyCallback);

    expect(EventsQueue.connectionReady).toBe(mockConnectionReadyCallback);

});

test('bindQueueCallback invokes connectionReadyCallback', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var mockConnectionReadyCallback = jest.fn();

    EventsQueue.connectionReady = mockConnectionReadyCallback;
    EventsQueue.bindQueueCallback(null, {});

    expect(mockConnectionReadyCallback).toHaveBeenCalled();
});

test('If connectCallback returns error, do not try to create channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');
    EventsQueue.connectCallback('Error', EventsQueue.AMQP.mockConnection);

    expect(EventsQueue.AMQP.mockConnection.createChannel).not.toHaveBeenCalled();
});

test('If connectCallback return null connection, do not try to create channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');
    EventsQueue.connectCallback(null, null);

    expect(EventsQueue.AMQP.mockConnection.createChannel).not.toHaveBeenCalled();

});

test('publishEvent method exists', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');
    
    expect(EventsQueue.publishEvent).not.toBeUndefined();
    expect(EventsQueue.publishEvent).toBeInstanceOf(Function);
});

test('assertQueueCallback exists', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    expect(EventsQueue.assertQueueCallback).not.toBeUndefined();
    expect(EventsQueue.assertQueueCallback).toBeInstanceOf(Function);
});

test('assertQueueCallback invokes bindQueue on channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var mock_q = {
        queue: 'the_queue'
    }

    EventsQueue.connect(()=>{}, 'EventType');
    EventsQueue.assertQueueCallback(null, mock_q);

    expect(EventsQueue.AMQP.mockChannel.bindQueue).toHaveBeenCalledWith(mock_q.queue, 'Events', 'EventType', {}, EventsQueue.bindQueueCallback);

});

test('publishEvent invokes channel.publish', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var msg = {
        text: 'text'
    }

    var buffer = Buffer.from(JSON.stringify(msg));

    EventsQueue.publishEvent(msg, 'NO_WEATHER');
    //EventsQueue.connect(()=>{});
    
    expect(EventsQueue.AMQP.mockChannel.publish).toHaveBeenCalled();
    expect(EventsQueue.AMQP.mockChannel.publish).toHaveBeenCalledWith('Events', 'NO_WEATHER', buffer);
});

test('createChannelCallback adds error emmit responder to channel', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    var mockChannel = {};
    mockChannel.assertExchange = jest.fn();
    mockChannel.assertQueue = jest.fn();
    mockChannel.on = jest.fn();

    EventsQueue.createChannelCallback(null, mockChannel);

    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.on).toHaveBeenCalledWith('error', EventsQueue.channelErrorCallback);
});

test('has channelErrorCallback method', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    expect(EventsQueue.channelErrorCallback).not.toBeUndefined();
    expect(EventsQueue.channelErrorCallback).toBeInstanceOf(Function);
});

test('assertExchangeCallback method is present', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    expect(EventsQueue.assertExchangeCallback).not.toBeUndefined();
    expect(EventsQueue.assertExchangeCallback).toBeInstanceOf(Function);

});

test('createChannelCallback invokes assertExchangeCallback', () => {

    jest.clearAllMocks();
    var EventsQueue = require('./event-queue');

    EventsQueue.createChannelCallback(null, EventsQueue.AMQP.mockChannel);
    
    expect(EventsQueue.AMQP.mockChannel.assertQueue).toHaveBeenCalled();

});