var events = require('events');
var logger = new events.EventEmitter();
logger.writelog = function(msg) {
    console.log(msg);
    logger.emit('error', 'h');
};
for (var i = 0; i < 11; i++) {
    logger.on('error', function(e) {
        console.log(e);
    });
    logger.writelog('hello');
}