const test = require('../..');

test.cb('slow', t => {
	setTimeout(t.end, 5000);
});

test('fast', t => t.pass());
