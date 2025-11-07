import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { schemaErrorFormatter } from "../schema-error-formatter.js";

describe("schemaErrorFormatter", () => {
  it("should serialize", async () => {
    const error = schemaErrorFormatter([{ instancePath: "/", keyword: " const", params: {}, schemaPath: "#" }]);
    assert.ok(error instanceof Error);
  });
});
