# @jafps/plugin-schema

[![NPM Version](https://img.shields.io/npm/v/%40jafps%2Fplugin-schema)](https://www.npmjs.com/package/@jafps/plugin-schema)

Fastify plugin for using typebox to handle JSON schemas.

It depends on [@jafps/plugin-error].

## Usage

```ts
import schemaPlugin from "@jafps/plugin-schema";

await app.register(schemaPlugin);
```

[@jafps/plugin-error]: https://github.com/jafpsjs/plugin-error
