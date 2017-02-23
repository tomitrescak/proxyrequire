global.$_stubs_$ = global.$_stubs_$ || {};

export function proxy (requireFunc: Function, stubs: any) {
   global.$_stubs_$ = stubs;
   const req = requireFunc();
   global.$_stubs_$ = {};
   return req;
};

export function proxyRequire (require: Function, path: string) {
   return global.$_stubs_$[path] || require(path);
};

export function FuseBoxStubPlugin (test) {
  return {
    test: test || /\.js/,
    transform(file) {
      file.contents = file.contents.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)')
    }
  }
}

export function registerGlobals() {
  global.proxyRequire = proxyRequire;
}

export function webpackStubLoader(content: string) {
  return content.replace(/require\s*\((['"]\s*[\w-_\.\/\\]*\s*['"])\)/g, 'proxyRequire(function() { return require($1); }, $1)');
}