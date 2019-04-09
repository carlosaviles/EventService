const EventQueue = require('eventqueue');
var EventHandler = null;

init();

function setEventHandler(eh) {
    EventHandler = eh;
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

    EventMessage.getChannel().ack(msg);

    const content = JSON.parse(msg.content.toString());
    console.log('Received event with content ' + JSON.stringify(content));

    if (EventHandler === null) {
        console.log('There is no event handler available. Event processing is ignored');
    } else {
        EventHandler.handle(content);
    }
}

function init() {
    console.log('Service init');

    const eventName = process.env.EVENT_NAME || null;

    if (eventName === null) {
        console.log('EventName is not defined. Will not listen to events');
    } else {
        EventQueue.connect(eventQueueReady, eventName);
    }
}

module.exports.setEventHandler = setEventHandler;