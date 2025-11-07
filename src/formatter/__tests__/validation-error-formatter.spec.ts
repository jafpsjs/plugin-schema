import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fastify from "fastify";
import { ValidationError } from "#error";
import { validationErrorFormatter } from "../validation-error-formatter.js";

describe("validationErrorFormatter", () => {
  it("should format ValidationError", async () => {
    const app = await fastify();
    const error = new ValidationError([]);
    const result = await validationErrorFormatter.bind(app)(error);
    assert.ok(result);
    assert.equal(result.success, false);
    assert.equal(result.status, 422);
    assert.equal(result.code, "InvalidValue");
  });

  it("should not format non-ValidationError", async () => {
    const app = await fastify();
    const result = await validationErrorFormatter.bind(app)(new Error());
    assert.equal(result, null);
  });
});
