const callback_api = jest.genMockFromModule('amqplib/callback_api');

var queue = {
    queue: 'mockQueueName'
}

var channel = {
    assertQueue: jest.fn((a,b,c) => {
        c(null, queue);
    }),
    assertExchange: jest.fn((a,b,c,d) => {
        d();
    }),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    on: jest.fn()
}

var connection = {
    createChannel: jest.fn(cb => {
        cb(null, channel);
    })
}

var connect = jest.fn((url, cb) => {
    cb(null, connection);
});

callback_api.connect = connect;
callback_api.mockConnection = connection;
callback_api.mockChannel = channel;
callback_api.mockQueue = queue;

module.exports = callback_api;