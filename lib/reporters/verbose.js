'use strict';
var prettyMs = require('pretty-ms');
var figures = require('figures');
var colors = require('../colors');
var plur = require('plur');
var beautifyStack = require('../beautify-stack');

function VerboseReporter() {
	if (!(this instanceof VerboseReporter)) {
		return new VerboseReporter();
	}
}

module.exports = VerboseReporter;

VerboseReporter.prototype.start = function () {
	return '';
};

VerboseReporter.prototype.test = function (test) {
	if (test.error) {
		return '  ' + colors.error(figures.cross) + ' ' + test.title + ' ' + colors.error(test.error.message);
	}

	if (test.skip) {
		return '  ' + colors.skip('- ' + test.title);
	}

	if (this.api.fileCount === 1 && this.api.testCount === 1 && test.title === '[anonymous]') {
		return null;
	}

	// display duration only over a threshold
	var threshold = 100;
	var duration = test.duration > threshold ? colors.duration(' (' + prettyMs(test.duration) + ')') : '';

	return '  ' + colors.pass(figures.tick) + ' ' + test.title + duration;
};

VerboseReporter.prototype.unhandledError = function (err) {
	var types = {
		rejection: 'Unhandled Rejection',
		exception: 'Uncaught Exception'
	};

	var output = colors.error(types[err.type] + ':', err.file) + '\n';

	if (err.stack) {
		output += '  ' + colors.stack(beautifyStack(err.stack)) + '\n';
	} else {
		output += '  ' + colors.stack(JSON.stringify(err)) + '\n';
	}

	output += '\n';

	return output;
};

VerboseReporter.prototype.finish = function () {
	var output = '\n';

	if (this.api.failCount > 0) {
		output += '  ' + colors.error(this.api.failCount, plur('test', this.api.failCount), 'failed') + '\n';
	} else {
		output += '  ' + colors.pass(this.api.passCount, plur('test', this.api.passCount), 'passed') + '\n';
	}

	if (this.api.skipCount > 0) {
		output += '  ' + colors.skip(this.api.skipCount, plur('test', this.api.skipCount), 'skipped') + '\n';
	}

	if (this.api.rejectionCount > 0) {
		output += '  ' + colors.error(this.api.rejectionCount, 'unhandled', plur('rejection', this.api.rejectionCount)) + '\n';
	}

	if (this.api.exceptionCount > 0) {
		output += '  ' + colors.error(this.api.exceptionCount, 'uncaught', plur('exception', this.api.exceptionCount)) + '\n';
	}

	if (this.api.failCount > 0) {
		output += '\n';

		var i = 0;

		this.api.tests.forEach(function (test) {
			if (!(test.error && test.error.message)) {
				return;
			}

			i++;

			output += '  ' + colors.error(i + '.', test.title) + '\n';
			output += '  ' + colors.stack(beautifyStack(test.error.stack)) + '\n';
		});
	}

	return output;
};

VerboseReporter.prototype.write = function (str) {
	console.error(str);
};