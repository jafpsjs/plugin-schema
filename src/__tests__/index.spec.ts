import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import errorPlugin from "@jafps/plugin-error";
import fastify from "fastify";
import { Type } from "typebox";
import schemaPlugin from "../index.js";
import type { FastifyInstance } from "fastify";

const bodySchema = Type.Options(Type.Object({
  a: Type.String(),
  b: Type.String()
}), { $id: "b" });

declare module "fastify" {
  interface FastifySchemas {
    b: typeof bodySchema;
  }
}

describe("@jafps/plugin-schema", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await fastify();
    await app.register(errorPlugin);
    await app.register(schemaPlugin);
    app.addSchema(bodySchema);

    app.post("/validate", { schema: { body: Type.Ref("b") } }, async (_req, res) => {
      res.send({ success: true });
    });
  });


  it("should format ValidationError", async () => {
    const res = await app.inject({
      body: {
        a: "a",
        b: 1
      },
      headers: { "content-type": "application/json" },
      method: "POST",
      path: "/validate"
    });
    const json = await res.json();
    assert.equal(res.statusCode, 422);
    assert.equal(json.success, false);
    assert.equal(json.code, "InvalidValue");
    assert.ok(json.data.message);
  });
});
