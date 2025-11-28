import { Type } from "typebox";
import { fieldErrorSchema } from "./field-error.js";
import type { Static } from "typebox";

export const invalidValueErrorSchema = Type.Object({
  code: Type.Literal("InvalidValue"),
  data: Type.Object({
    fieldErrors: Type.Array(fieldErrorSchema),
    message: Type.String()
  }),
  success: Type.Literal(false)
}, {
  additionalProperties: false,
  description: "Invalid Value",
  title: "Invalid Value"
});

/* node:coverage disable */
export type InvalidValueError = Static<typeof invalidValueErrorSchema>;

/* node:coverage enable */
