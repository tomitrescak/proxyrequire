"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var globalStubs = {};
global.$_stubs_$ = {};
function setGlobalStubs(stubs) {
    globalStubs = __assign({}, globalStubs, stubs);
    global.$_stubs_$ = globalStubs;
}
exports.setGlobalStubs = setGlobalStubs;
var nodeRegistered = false;
var firstRequire = null;
function setFirstRequire(name) {
    if (firstRequire == null) {
        firstRequire = name;
    }
}
function cleanup() {
    var matcher = new RegExp(firstRequire);
    if (global.FuseBox) {
        global.FuseBox.flush(function (file) { return file.match(matcher); });
    }
    if (require && require.cache) {
        for (var _i = 0, _a = Object.getOwnPropertyNames(require.cache); _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.match(matcher)) {
                delete require.cache[item];
            }
        }
    }
}
function proxy(requireFunc, stubs) {
    firstRequire = null;
    if (require && !nodeRegistered) {
        registerNode();
    }
    global.$_stubs_$ = Object.assign({}, globalStubs, stubs);
    var req = requireFunc();
    cleanup();
    req = requireFunc();
    global.$_stubs_$ = globalStubs;
    cleanup();
    return req;
}
exports.proxy = proxy;
function mock(path, impl) {
    if (require && !nodeRegistered) {
        registerNode();
    }
    var parts = path.split('/');
    global.$_stubs_$[parts[parts.length - 1]] = impl();
    global.$_stubs_$[path] = impl();
}
exports.mock = mock;
function unmockAll() {
    global.$_stubs_$ = {};
}
exports.unmockAll = unmockAll;
function unmock(path) {
    var parts = path.split('/');
    global.$_stubs_$[parts[parts.length - 1]] = null;
    global.$_stubs_$[path] = null;
}
exports.unmock = unmock;
function proxyRequire(require, path) {
    var parts = path.split('/');
    var module_name = parts[parts.length - 1];
    setFirstRequire(module_name);
    return global.$_stubs_$[path] || global.$_stubs_$[module_name] || require(path);
}
exports.proxyRequire = proxyRequire;
function FuseBoxStubPlugin(test) {
    return {
        test: test || /\.js/,
        transform: function (file) {
            file.contents = file.contents.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)');
            if (file.contents.indexOf('jest.mock') >= 0) {
                file.contents = file.contents.replace(/jest\.mock\s*\(/g, 'require("proxyrequire").mock(');
                file.contents = file.contents + '\nrequire("proxyrequire").unmockAll()';
            }
        }
    };
}
exports.FuseBoxStubPlugin = FuseBoxStubPlugin;
function registerGlobals() {
    global.proxyRequire = proxyRequire;
}
exports.registerGlobals = registerGlobals;
function registerNode() {
    global.$_stubs_$ = {};
    var Module = require('module');
    if (Module && Module.prototype && Module.prototype.require) {
        var originalRequire = Module.prototype.require;
        Module.prototype.require = function (path) {
            var parts = path.split('/');
            var module_name = parts[parts.length - 1];
            setFirstRequire(module_name);
            return (global.$_stubs_$[path] ||
                global.$_stubs_$[module_name] ||
                originalRequire.apply(this, arguments));
        };
    }
    nodeRegistered = true;
}
exports.registerNode = registerNode;
function transform(content) {
    return content.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)');
}
exports.transform = transform;
function webpackStubLoader(content) {
    return transform(content);
}
exports.webpackStubLoader = webpackStubLoader;
