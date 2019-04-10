const EventQueue = require('eventqueue');
var EventHandler = null;

init();

function addEventHandler(eh) {
    EventHandler = eh;
    console.log('Set event handler to ' + JSON.stringify(EventHandler));
}

function eventQueueReady() {
    console.log('Event queue ready');
    console.log('Event handler is ' + JSON.stringify(EventHandler));
    EventQueue.setConsumeCallback(consumeCallback);
}

function consumeCallback(msg) {

    if (!msg) {
        console.log('Event message is null');
        return;
    }

    if (!msg.content) {
        console.log('Event message has no content');
    }

    //EventQueue.getChannel().ack(msg);

    const content = JSON.parse(msg.content.toString());
    console.log('Received event with content ' + JSON.stringify(content));

    if (EventHandler === null) {
        console.log('There is no event handler available. Event processing is ignored');
    } else {
        EventHandler.handle(msg, handlingCallback);
    }
}

function handlingCallback(msg, responseContent, responseKey) {

    if(!msg) {
        console.log('Unable to ack undefined message.');
    } else {

        if (!responseContent) {
            console.log('No response required');
        } else {
            EventQueue.publishEvent(responseContent, responseKey);
        }

        EventQueue.getChannel().ack(msg);
        console.log('Message ack\'d');
    }

    

}

function init() {
    console.log('Service init');

    const eventNames = process.env.EVENT_NAMES;

    if (!eventNames) {
        console.log('EventNames is not defined. Will not listen to events');
    } else {
        EventQueue.connect(eventQueueReady, eventNames.split(' '));
    }
}

function publishEvent(message, eventType) {
    EventQueue.publishEvent(message, eventType);
}

module.exports.addEventHandler = addEventHandler;
module.exports.publishEvent = publishEvent;