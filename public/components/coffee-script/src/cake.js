(function() {
  var CoffeeScript, cakefileDirectory, existsSync, fatalError, fs, helpers, missingTask, oparse, options, optparse, path, printTasks, switches, tasks;

  fs = require('fs');

  path = require('path');

  helpers = require('./helpers');

  optparse = require('./optparse');

  CoffeeScript = require('./coffee-script');

  existsSync = fs.existsSync || path.existsSync;

  tasks = {};

  options = {};

  switches = [];

  oparse = null;

  helpers.extend(global, {
    task: function(name, description, action) {
      var _ref;
      if (!action) {
        _ref = [description, action], action = _ref[0], description = _ref[1];
      }
      return tasks[name] = {
        name: name,
        description: description,
        action: action
      };
    },
    option: function(letter, flag, description) {
      return switches.push([letter, flag, description]);
    },
    invoke: function(name) {
      if (!tasks[name]) {
        missingTask(name);
      }
      return tasks[name].action(options);
    }
  });

  exports.run = function() {
    var arg, args, e, _i, _len, _ref, _results;
    global.__originalDirname = fs.realpathSync('.');
    process.chdir(cakefileDirectory(__originalDirname));
    args = process.argv.slice(2);
    CoffeeScript.run(fs.readFileSync('Cakefile').toString(), {
      filename: 'Cakefile'
    });
    oparse = new optparse.OptionParser(switches);
    if (!args.length) {
      return printTasks();
    }
    try {
      options = oparse.parse(args);
    } catch (_error) {
      e = _error;
      return fatalError("" + e);
    }
    _ref = options["arguments"];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      _results.push(invoke(arg));
    }
    return _results;
  };

  printTasks = function() {
    var cakefilePath, desc, name, relative, spaces, task;
    relative = path.relative || path.resolve;
    cakefilePath = path.join(relative(__originalDirname, process.cwd()), 'Cakefile');
    console.log("" + cakefilePath + " defines the following tasks:\n");
    for (name in tasks) {
      task = tasks[name];
      spaces = 20 - name.length;
      spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
      desc = task.description ? "# " + task.description : '';
      console.log("cake " + name + spaces + " " + desc);
    }
    if (switches.length) {
      return console.log(oparse.help());
    }
  };

  fatalError = function(message) {
    console.error(message + '\n');
    console.log('To see a list of all tasks/options, run "cake"');
    return process.exit(1);
  };

  missingTask = function(task) {
    return fatalError("No such task: " + task);
  };

  cakefileDirectory = function(dir) {
    var parent;
    if (existsSync(path.join(dir, 'Cakefile'))) {
      return dir;
    }
    parent = path.normalize(path.join(dir, '..'));
    if (parent !== dir) {
      return cakefileDirectory(parent);
    }
    throw new Error("Cakefile not found in " + (process.cwd()));
  };

}).call(this);
