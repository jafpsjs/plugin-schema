import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Type } from "typebox";
import { Errors } from "typebox/value";
import { ValidationError } from "../validation-error.js";

describe("ValidationError", () => {
  it("should clean extra properties for fieldErrors", async () => {
    const schema = Type.Object({ success: Type.Literal(false) });
    const errors = Errors(schema, { 1: true });
    const error = new ValidationError(errors);
    assert.ok(error.fieldErrors[0]);
    assert.equal(Object.keys(error.fieldErrors[0]).length, 2);
  });

  it("should create error for non exists ID", async () => {
    const error = ValidationError.nonExistID();
    assert.ok(error.fieldErrors[0]);
    assert.equal(Object.keys(error.fieldErrors[0]).length, 2);
  });

  it("should create error for non match version", async () => {
    const error = ValidationError.nonMatchVersion();
    assert.ok(error.fieldErrors[0]);
    assert.equal(Object.keys(error.fieldErrors[0]).length, 2);
  });
});
