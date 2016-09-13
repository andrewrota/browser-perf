var util = require('util'),
  wd = require('wd'),
  events = require('events'),
  helpers = require('../helpers'),
  jsmin = require('jsmin').jsmin,
  rumSpeedIndex = require('rum-speedindex');

function SpeedIndexProbe() {
  events.EventEmitter.call(this);
}

util.inherits(SpeedIndexProbe, events.EventEmitter);

SpeedIndexProbe.prototype.id = 'SpeedIndexProbe';
SpeedIndexProbe.prototype.teardown = function(browser) {
    var code = function() {
      window.__speedIndex = {
        speedIndex: window.RUMSpeedIndex()
      };
    };
    var me = this;
    return browser.execute(';RUMSpeedIndex = ' + jsmin(rumSpeedIndex.toString())).then(function() {
        return browser.execute(helpers.fnCall(code))
      }).then(function() {
      return browser.waitFor({
        asserter: wd.asserters.jsCondition('(typeof window.__speedIndex !== "undefined")', false),
        timeout: 1000 * 5,
        pollFreq: 1000
      });
    }).then(function() {
      return browser.eval('window.__speedIndex');
    }).then(function(res) {
      me.emit('data', res);
    });
};

module.exports = SpeedIndexProbe;