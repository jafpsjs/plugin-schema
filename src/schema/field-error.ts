import { Type } from "typebox";
import type { Static } from "typebox";

export const fieldErrorSchema = Type.Object({
  instancePath: Type.String({ examples: ["/foo"] }),
  message: Type.String({ examples: ["Expected string"] })
}, { additionalProperties: false });

/* node:coverage disable */
export type FieldError = Static<typeof fieldErrorSchema>;

/* node:coverage enable */
