# Introduction

Easily stub module references in node.js, FuseBox or webpack

## Stubbing References

Fitrst, you need to configure your environment to start stubbing (e.g. see FuseBox below).
Once the environment is configured, you can follow notation from well known *proxyquire* package.

```javascript
import { proxy } from 'proxyrequire';

const Stub = proxy(() => require('$module_path'), {
  '$stubbed_reference': your_stub
});
```

For example, if I wish to stub the `../container` and '../other' reference in file 'myFile.ts':

```javascript
// myFile.ts
import { Container } from '../container';
import Other from '../../other';
```

In my test file (sitting in subdirectory `tests`)

```javascript
import { proxy } from 'proxyrequire';
const Stub = proxy(() => require('../myFile').Container, {
  '../container': { Container: () => <div>Stubbed Container</div> },
  '../../other': { default: { stubbedObject } } // please note the object contruction with 'default'
});
```

### FuseBox

Use the package plugin to rewrite all your require references to allow stubbing.
In your fusebox config add plugin. Plugin parameter specifies the regular expression
as filter on files which you want to stub:

```javascript
const StubPlugin = require('proxyrequire').FuseBoxStubPlugin(/\.tsx?/);

fsbx.FuseBox.init({
  homeDir: "src",
  ...
  plugins: [
    StubPlugin, // add this plugin
    ...
  ]
}).devServer("...", {
  ...
});
```

Then, in your entry file, make sure you register global helpers.
Please, make sure that the entry file is not processed by the plugin.

```javascript
// entry file
require('proxyrequire').registerGlobals()
```

If you cannot isolate this file, please use the following boilerplate:

```javascript
global.$_stubs_$ = {};
function proxyRequire (require, path) {
   return global.$_stubs_$[path] || require(path);
};
global.proxyRequire = proxyRequire;
``` 

## Webpack

Import the webpack loader and chain it after the typescript compilation. 

```javascript
const StubLoader = require('proxyrequire').WebpackLoader;
```

Make sure you register global variables in your entry file, same as in FuseBox.

** WARNING** This functionality has not yet been tested.

## Node.JS - Mocha

You need to register the stubbing environment in your entry file (e.g. in the
setup function of `wallaby.js`). For Jest, see below.

```javascript
require('proxyrequire').registerNode();
```

Just start using `proxy` function straight away.

## Node.JS - Jest

Jest uses its own implementation of require, therefore we need to rewrite our sources.
Luckily, jest gives us tools to do that easily. Following is a configuration for Typescript,
but you can easily devise configuration for Javascript.

First, create a preprocessor and place it in the root directory:

```javascript
// preprocessor.js
const tsc = require('typescript');
const tsConfig = require('./tsconfig.fuse.json');
const transform = require('jsx-controls-loader').loader;
const stubLoader = require('proxyrequire').webpackStubLoader;


module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      let res = tsc.transpile(
        path.endsWith('.tsx') ? transform(src): src,
        tsConfig.compilerOptions,
        path,
        []
      );
      res = stubLoader(res);
      res = 'const proxyRequire = require("proxyrequire").proxyRequire\n' + res;
      return res;
    }
    return src;
  },
};
```

And in your Jest config in package.json specify:

```javascript
// package.json
"jest": {
    "transform": {
      ".(ts|tsx)": "<rootDir>/preprocessor.js"
    }
}
```


### Note

Node.js implementation is optimised for Wallaby.js and you can see the source code below.
Please PR if you need to support more environments:

```js
export function registerNode() {
  global.$_stubs_$ = {};

  var Module = require('module');
  var originalRequire = Module.prototype.require;

  Module.prototype.require = function (this: any, path: string) {
    //do your thing here
    return global.$_stubs_$[path] || originalRequire.apply(this, arguments);
  };
}
```

