"use strict";
global.$_stubs_$ = global.$_stubs_$ || {};
function proxy(requireFunc, stubs) {
    global.$_stubs_$ = stubs;
    var req = requireFunc();
    global.$_stubs_$ = {};
    return req;
}
exports.proxy = proxy;
;
function proxyRequire(require, path) {
    return global.$_stubs_$[path] || require(path);
}
exports.proxyRequire = proxyRequire;
;
function FuseBoxStubPlugin(test) {
    return {
        test: test || /\.js/,
        transform: function (file) {
            file.contents = file.contents.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)');
        }
    };
}
exports.FuseBoxStubPlugin = FuseBoxStubPlugin;
function registerGlobals() {
    global.proxyRequire = proxyRequire;
}
exports.registerGlobals = registerGlobals;
function webpackStubLoader(content) {
    return content.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)');
}
exports.webpackStubLoader = webpackStubLoader;
