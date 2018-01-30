declare var global: any;
declare var require: any;

var globalStubs = {};
global.$_stubs_$ = {};

export function setGlobalStubs(stubs) {
  globalStubs = { ...globalStubs, ...stubs };
  global.$_stubs_$ = globalStubs;
}

let nodeRegistered = false;

let firstRequire = null;
function setFirstRequire(name: string) {
  if (firstRequire == null) {
    firstRequire = name;
  }
}

function cleanup() {
  let matcher = new RegExp(firstRequire);

  if (global.FuseBox) {
    global.FuseBox.flush(file => file.match(matcher));
  }
  if (require && require.cache) {
    for (let item of Object.getOwnPropertyNames(require.cache)) {
      if (item.match(matcher)) {
        delete require.cache[item];
      }
    }
  }
}

export function proxy(requireFunc: Function, stubs: any) {
  firstRequire = null;

  // if we are in node environment there is no proxy require and we need to override original require
  if (require && !nodeRegistered) {
    registerNode();
  }
  global.$_stubs_$ = Object.assign({}, globalStubs, stubs);

  // we will do require twice to make sure we are requiring a non cached function
  let req = requireFunc();
  cleanup();
  req = requireFunc();

  global.$_stubs_$ = globalStubs;

  cleanup();

  return req;
}

export function mock(path, impl) {
  if (require && !nodeRegistered) {
    registerNode();
  }
  let parts = path.split('/');
  global.$_stubs_$[parts[parts.length - 1]] = impl();
  global.$_stubs_$[path] = impl();
}

export function unmockAll() {
  // const keys = Object.getOwnPropertyNames(global.$_stubs_$);

  // if (keys.length == 0) {
  //   return;
  // }

  // // clear caches
  // if (global.FuseBox) {
  //   global.FuseBox.flush(file => keys.some(k => file.indexOf(k) >= 0));
  // }
  // if (require && require.cache) {
  //   for (let item of Object.getOwnPropertyNames(require.cache)) {
  //     if (keys.some(k => item.indexOf(k) >= 0)) {
  //       delete require.cache[item];
  //     }
  //   }
  // }

  global.$_stubs_$ = {};
}

export function unmock(path) {
  let parts = path.split('/');
  global.$_stubs_$[parts[parts.length - 1]] = null;
  global.$_stubs_$[path] = null;
}

export function proxyRequire(require: Function, path: string) {
  let parts = path.split('/');
  let module_name = parts[parts.length - 1];
  setFirstRequire(module_name);
  return global.$_stubs_$[path] || global.$_stubs_$[module_name] || require(path);
}

export function FuseBoxStubPlugin(test) {
  return {
    test: test || /\.js/,
    transform(file) {
      file.contents = file.contents.replace(
        /require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g,
        'proxyRequire(function() { return require($1); }, $1)'
      );

      if (file.contents.indexOf('jest.mock') >= 0) {
        // replace mocks
        file.contents = file.contents.replace(/jest\.mock\s*\(/g, 'require("proxyrequire").mock(');

        file.contents = file.contents + '\nrequire("proxyrequire").unmockAll()';
      }
    }
  };
}

export function registerGlobals() {
  global.proxyRequire = proxyRequire;
}

export function registerNode() {
  global.$_stubs_$ = {};

  var Module = require('module');
  if (Module && Module.prototype && Module.prototype.require) {
    var originalRequire = Module.prototype.require;

    Module.prototype.require = function(this: any, path: string) {
      let parts = path.split('/');
      let module_name = parts[parts.length - 1];

      setFirstRequire(module_name);

      return (
        global.$_stubs_$[path] ||
        global.$_stubs_$[module_name] ||
        originalRequire.apply(this, arguments)
      );
    };
  }

  nodeRegistered = true;
}

export function transform(content: string) {
  return content.replace(
    /require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g,
    'proxyRequire(function() { return require($1); }, $1)'
  );
}

export function webpackStubLoader(content: string) {
  return transform(content);
}
