'use strict'
// **Github:** https://github.com/thunks/tman
//
// **License:** MIT

var core = require('./core')
var format = require('./format')
var info = require('../package.json')

var env = {}
var tm = module.exports = tmanFactroy()
tm.NAME = info.name
tm.VERSION = info.version
tm.Test = core.Test
tm.Suite = core.Suite
tm.format = format
tm.createTman = tmanFactroy
tm.env = env
tm.env.TEST = getProcessEnv()

function tmanFactroy () {
  var tman = core.Tman(env)
  tman._afterRun = finished
  return tman
}

// default out stream
core.Suite.prototype.log = function () {
  console.log.apply(console, arguments)
}

// default suite reporter (start event)
core.Suite.prototype.onStart = function () {
  if (!this.parent || !this.root.log) return
  var title = '✢ ' + this.title
  title = format[this.mode === 'skip' ? 'cyan' : 'white'](title, true)
  this.root.log(format.indent(this.depth) + title)
}

// default suite reporter (finish event)
core.Suite.prototype.onFinish = function () {
  if (!this.root.log) return
  if (this.state instanceof Error) {
    var title = format.red('✗ ' + this.state.title + ' (' + this.state.order + ')', true)
    this.root.log(format.indent(this.depth + 1) + title)
  }
}

// default test reporter (finish event)
core.Test.prototype.onFinish = function () {
  if (!this.root.log) return
  var title = this.title
  if (this.state === null) {
    title = format.cyan('‒ ' + title, true)
  } else if (this.state === true) {
    title = format.green('✓ ') + format.gray(title)
    var time = this.endTime - this.startTime
    if (time > 50) title += format.red(' (' + time + 'ms)')
  } else {
    title = format.red('✗ ' + title + ' (' + this.state.order + ')', true)
  }
  this.root.log(format.indent(this.depth) + title)
}

// default finished reporter
function finished (err, res) {
  if (err) throw err
  var message = ''
  var log = this.rootSuite.log

  if (log) {
    if (this.rootSuite.abort) message += format.yellow('\nTest is terminated by SIGINT!\n', true)
    message += format.reset('\nTest ' + (res.errors.length ? 'failed: ' : 'finished: '))
    message += format[res.passed ? 'green' : 'gray'](res.passed + ' passed; ', true)
    message += format[res.errors.length ? 'red' : 'gray'](res.errors.length + ' failed; ', true)
    message += format[res.ignored ? 'cyan' : 'gray'](res.ignored + ' ignored.', true)
    message += format.yellow(' (' + (res.endTime - res.startTime) + 'ms)', true)
    log(message, format.reset('\n'))

    /* istanbul ignore next */
    res.errors.forEach(function (err) {
      log(format.indent(1) + format.red(err.order + ') ' + err.title + ':', true))
      var message = err.stack ? err.stack : String(err)
      log(message.replace(/^/gm, format.indent(2)) + '\n')
    })
    if (res.errors.length) log(format.reset('\n'))
  }

  if (this.rootSuite.exit) this.exit((res.errors.length || !res.passed) ? 1 : 0)
}

function getProcessEnv () {
  var envTest = tm.env.TEST || process.env.TEST
  if (envTest) return envTest
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].indexOf('--test') === 0) {
      envTest = process.argv[i].slice(7)
      break
    }
  }
  return envTest == null ? '' : (envTest || 'root')
}
