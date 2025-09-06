---
sidebar_position: 3
---

# Import a file as the source text

Suppose there is a file named bundle.js.

```js
console.log("Hello from bundle.js");
```

```js
import "./bundle.js";
// Above will directly run `console.log("Hello from bundle.js")`
```

Use **raw-loader**

```js
import bundleSource from "!!raw-loader!./bundle.js";
console.log(bundleSource);
```

Will output the source code:

```js
console.log("Hello from bundle.js");
```