# Introduction

Easily stub module references in node.js, FuseBox or webpack

## Stubbing References

Fitrst, you need to configure your environment to start stubbing (e.g. see FuseBox below).
Once the environment is configured, you can follow notation from well known *proxyquire* package.

```js
import { proxy } from 'proxyrequire';

const Stub = proxy(() => require('$module_path'), {
  '$stubbed_reference': your_stub
});
```

For example, if I wish to stub the `../container` and '../other' reference in file 'myFile.ts':

```js
// myFile.ts
import { Container } from '../container';
import Other from '../../other';
```

In my test file (sitting in subdirectory `tests`)

```js
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

```js
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

```js
// entry file
require('proxyrequire').registerGlobals()
```

If you cannot isolate this file, please use the following boilerplate:

```js
global.$_stubs_$ = {};
function proxyRequire (require, path) {
   return global.$_stubs_$[path] || require(path);
};
global.proxyRequire = proxyRequire;
``` 

## Webpack

Import the webpack loader and chain it after the typescript compilation. 

```js
const StubLoader = require('proxyrequire').WebpackLoader;
```

Make sure you register global variables in your entry file, same as in FuseBox.

** WARNING** This functionality has not yet been tested.

## Node.JS

Node.JS does not need any kind of configuration. Just start using `proxy` function straight away.
