var fs = require('fs')

function DatabaseProvider(name) {
  this.filename = (name || 'database') + '.json'
  this.readDb()
}

DatabaseProvider.prototype.readDb = function() {
  try {
    this.db = JSON.parse(fs.readFileSync(this.filename));
  } catch(err) {
    if (err.errno == 34) {
      this.db = []
    } else {
      throw err
    }
  }
}

DatabaseProvider.prototype.insert = function(obj, callback) {
  this.db.push(obj)
  this.save(callback)
}

DatabaseProvider.prototype.save = function(callback) {
  fs.writeFileSync(this.filename, JSON.stringify(this.db))
}

DatabaseProvider.prototype.find = function(key, value, callback) {
  var find = this.db.filter(function(doc) {
    return doc[key] == value;
  })
  callback(find.length == 0 ? null : find)
}

module.exports = DatabaseProvider