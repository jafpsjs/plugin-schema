import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fastify from "fastify";
import { Type } from "typebox";
import { ValidationError } from "#error";
import { SchemaController } from "../schema-controller.js";

describe("SchemaSerializer", () => {
  it("should serialize", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Literal(true) });
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    const json = serializeFn({ success: true });
    const res = JSON.parse(json);
    assert.equal(res.success, true);
  });

  it("should serialize without additional values", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Literal(true) });
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    const json = serializeFn({ other: true, success: true });
    const res = JSON.parse(json);
    assert.ok(!res.other);
  });

  it("should serialize with default value", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Boolean({ default: true }) });
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    const json = serializeFn({ });
    const res = JSON.parse(json);
    assert.equal(res.success, true);
  });

  it("should serialize with references", async () => {
    const app = await fastify();
    const refSchema = Type.Object({ success: Type.Literal(true) }, { $id: "result" });
    const serializer = new SchemaController(app);
    serializer.addSchema(refSchema as any);
    const schema = Type.Ref("result");
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    const json = serializeFn({ success: true });
    const res = JSON.parse(json);
    assert.equal(res.success, true);
  });

  it("should not serialize without references", async () => {
    const app = await fastify();
    const refSchema = Type.Object({ success: Type.Literal(true) }, { $id: "result" });
    const serializer = new SchemaController(app, { useReferences: false });
    serializer.addSchema(refSchema as any);
    const schema = Type.Ref("result");
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    assert.throws(() => serializeFn({ success: true }));
  });

  it("should serialize with typebox module", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const module = Type.Module({
      a: Type.Object({ success: Type.Literal(true) }),
      b: Type.Ref("a")
    });
    const serializeFn = serializer.serialize({ method: "GET", schema: module.b, url: "/" });
    const json = serializeFn({ success: true });
    const res = JSON.parse(json);
    assert.equal(res.success, true);
  });

  it("should serialize with typebox codec", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({
      success: Type.Codec(Type.String())
        .Decode(v => v === "true")
        .Encode(v => `${v}`)
    });
    const serializeFn = serializer.serialize({ method: "GET", schema, url: "/" });
    const json = serializeFn({ success: true });
    const res = JSON.parse(json);
    assert.equal(res.success, "true");
  });

  it("should deserialize", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Literal(true) });
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ success: true });
    const res = json.value;
    assert.equal(res.success, true);
  });

  it("should deserialize without additional values", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Literal(true) });
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ other: true, success: true });
    const res = json.value;
    assert.ok(!res.other);
  });

  it("should deserialize with default value", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({ success: Type.Boolean({ default: true }) });
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ });
    const res = json.value;
    assert.equal(res.success, true);
  });

  it("should deserialize with references", async () => {
    const app = await fastify();
    const refSchema = Type.Object({ success: Type.Literal(true) }, { $id: "result" });
    const serializer = new SchemaController(app);

    serializer.addSchema(refSchema as any);
    const schema = Type.Ref("result");
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ success: true });
    const res = json.value;
    assert.equal(res.success, true);
  });

  it("should not deserialize with references", async () => {
    const app = await fastify();
    const refSchema = Type.Object({ success: Type.Literal(true) }, { $id: "result" });
    const serializer = new SchemaController(app, { useReferences: false });

    serializer.addSchema(refSchema as any);
    const schema = Type.Ref("result");
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ success: true });
    const res = json.error;
    assert.ok(res instanceof ValidationError);
  });

  it("should deserialize with typebox module", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const module = Type.Module({
      a: Type.Object({ success: Type.Literal(true) }),
      b: Type.Ref("a")
    });
    const serializeFn = serializer.deserialize({ method: "GET", schema: module.b, url: "/" });
    const json = await serializeFn({ success: true });
    const res = json.value;
    assert.equal(res.success, true);
  });

  it("should deserialize with typebox codec", async () => {
    const app = await fastify();
    const serializer = new SchemaController(app);
    const schema = Type.Object({
      success: Type.Codec(Type.String())
        .Decode(v => v === "true")
        .Encode(v => `${v}`)
    });
    const serializeFn = serializer.deserialize({ method: "GET", schema, url: "/" });
    const json = await serializeFn({ success: "true" });
    const res = json.value;
    assert.equal(res.success, true);
  });

  it("should throw on same $id added", async () => {
    const app = await fastify();
    const bodySchema = Type.Options(Type.Object({
      a: Type.String(),
      b: Type.String()
    }), { $id: "b" });
    const serializer = new SchemaController(app);
    serializer.addSchema(bodySchema);
    assert.throws(() => {
      serializer.addSchema(bodySchema);
    });
  });

  it("should return schema on $id", async () => {
    const app = await fastify();
    const bodySchema = Type.Options(Type.Object({
      a: Type.String(),
      b: Type.String()
    }), { $id: "b" });
    const serializer = new SchemaController(app);
    serializer.addSchema(bodySchema);
    assert.equal(serializer.getSchema("b"), bodySchema);
  });
});
