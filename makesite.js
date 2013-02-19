// Module Requirements
var fs   = require('fs')
var path = require('path')
var ansi = require('ansi')
var read =  require('read')
var sys = require('sys')
var execSync = require('exec-sync')
var Hogan = require('hogan.js');

var DatabaseProvider = require('./databaseprovider')
var LogProvider = require('./logprovider')
var stream = process.stdout
var cursor = ansi(stream, {enabled: true})
var logger = new LogProvider(cursor)
var db     = new DatabaseProvider('sites')

// Configure this
var dirs = {
  git: path.join(process.env.HOME, 'git'),
  tree: path.join(process.env.HOME, 'www'),
  log: path.join(process.env.HOME, 'logs')
}

// Configure this 
var nginxConf = path.join('/etc/nginx/sites-enabled/' + normalizedDomain + '.conf');

logger.addLevel('warn', 'red')
logger.addLevel('info', 'cyan')
logger.addLevel('success', 'brightGreen')

var domain, normalizedDomain, domainDirs, projectType = 'nodejs';

requireDir(function() {
  domain = (function(args){
    for (i=2;i<args.length;i++) {
      var type = args[i].match(/^\w+/)
      if (type !== null) {
        return args[i]
      }
    }
  })(process.argv)
  projectType = (function(args){
    for (var arg in args) {
      var type = args[arg].match(/^--type=(\w+)/)
      if (type !== null) {
        return type[1]
      }
    }
    return 'nodejs'
  })(process.argv)
  checkDomain(function() {
    createDir(function() {
      var init = execSync('cd '+domainDirs['git'] + '&& git init --bare')
      console.log(init)
      setOptions(function(opts) {
        writeFiles(opts)
        logger.info('Done', '\n')
        process.exit()
      })
    })
  })
})

function requireDir(callback) {
  var count = 0;
  for (var dir in dirs) {
    ;(function(dir){
      fs.mkdir(dirs[dir], function(err) {
        if (err) {
          if (err.errno == 47) {
            logger.info(dir, 'directory:')
            console.log(dirs[dir])
            if (count == 2) callback()
            else count++
          } else {
            console.log(err)
            process.exit()
          }          
        } else {
          logger.success('Created', dir, 'directory:')
          console.log(dirs[dir])
          if (count == 2) callback()
          else count++
        }        
      })
    })(dir)
  }
}

function createDir(callback) {

  var normalizedDomain = domain.replace(/[\.-]/i, '_')

  domainDirs = {
    git: path.join(dirs['git'], normalizedDomain),
    tree: path.join(dirs['tree'], normalizedDomain)
  }
  var count = 0
  for (var d in domainDirs) {
    ;(function(d) {
      fs.mkdir(domainDirs[d], function(err) {
        cursor.write('Creating ' + domainDirs[d] + '... ');
        if (err) {
          if (err.errno == 47) {
            logger.warn('Already Exists', '\n')
          } else {
            logger.warn('Failed', '\n')
            console.log(err)
          }
          process.exit()
        }
        logger.success('Done', '\n')
        if (count == 1) callback()
        else count++
      })
    })(d)
  }
}

function checkDomain(callback) {
  ;(function(cb) {
    if (typeof domain === undefined) {
      read({
        prompt: 'Enter domain: '
      }, function(err, d) {
        domain = d
        cb()
      })
    }else {
      cb()
    }
  })(function() {
    if (domain.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/) ===  null) {
      logger.warn('Invalid domain: ')
      console.log(domain)
      process.exit()
    }
    db.find('domain', domain, function(doc) {
      if (doc !== null) {
        logger.warn('Domain already exists: ')
        console.log(domain)
        process.exit()
      }
      callback()
    })
  });
}

function setOptions(callback) {
  findOpenPort(function(port) {
    var opts = {}
    opts.domain = domain
    opts.port = port
    opts.rootDir = domainDirs['tree'] + '/public'
    opts.treeDir = domainDirs['tree']
    opts.logDir = domainDirs['log']

    switch (projectType.toLowerCase()) {
      case 'nodejs':
        opts.proxyPass = true
        break
      case 'php':
        opts.tryFiles = true
        opts.isPhp = true
        break
    }

    callback(opts)
  })
  
}

function findOpenPort(callback) {
  while(true) {
    var port = Math.floor(Math.random() * 65535) + 49152
    db.find('port', port, function(doc) {
      if (doc === null) {
        callback(port)
      }
    })
  }
}

function writeFiles(options) {
  var nginxTemplate = Hogan.compile(fs.readFileSync('nginx.template', 'utf-8'))
  fs.writeFileSync(nginxConf, nginxTemplate.render(options))
  logger.success('Created config file: ')
  console.log(nginxConf)

  var hookTemplate = Hogan.compile(fs.readFileSync('hook.template', 'utf-8'))
  var hookPath = path.join(domainDirs['git'], 'hooks', 'post-receive')
  fs.writeFileSync(hookPath, hookTemplate.render(options))
  execSync('chmod +x ' + hookPath)
  logger.success('Created post-receive hook file: ')
  console.log(hookPath)

  db.insert({
    domain: options.domain,
    port: options.port,
    type: projectType
  })
}