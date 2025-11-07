import { Clean, Clone } from "typebox/value";
import { fieldErrorSchema } from "#schema";
import type { FieldError } from "#schema";


export class ValidationError extends Error {
  public readonly fieldErrors: FieldError[];

  public constructor(fieldErrors: FieldError[], message = "Value(s) do not match JSON schema") {
    super(message);
    this.fieldErrors = [...fieldErrors].map(f => {
      const clone = Clone(f);
      return Clean(fieldErrorSchema, clone) as FieldError;
    });
  }

  public static nonExistID(): ValidationError {
    return new ValidationError([{ instancePath: "/id", message: "ID does not exist" }]);
  }

  public static nonMatchVersion(): ValidationError {
    return new ValidationError([
      { instancePath: "/id", message: "ID may not exist" },
      { instancePath: "/version", message: "version may not match" }
    ]);
  }
}
