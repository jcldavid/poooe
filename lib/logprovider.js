function LogProvider(cursor) {
  this.cursor = cursor;
}

LogProvider.prototype.addLevel = function(name, color) {
  LogProvider.prototype[name] = function() {
    var args = arguments
    var s = ''
    var msg = function() {
      for(var arg in args) {
        s += args[arg] + (args[arg] == '\n' ? '': ' ')
      }
      return s;
    }
    this.cursor.fg[color]().bold().write(msg()).reset()
  }
}

module.exports = LogProvider;
