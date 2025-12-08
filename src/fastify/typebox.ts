import { Check, Clean, Clone, DecodeError, DecodeUnsafe, Default, EncodeError, EncodeUnsafe, Errors, Pipeline } from "typebox/value";
import type { TProperties, TSchema } from "typebox";

function AssertDecode(context: TProperties, type: TSchema, value: unknown): unknown {
  if (!Check(context, type, value)) {
    throw new DecodeError(value, Errors(context, type, value));
  }
  return value;
}

export const decode = Pipeline([
  (_context, _type, value) => Clone(value),
  (context, type, value) => Default(context, type, value),
  (context, type, value) => Clean(context, type, value),
  (context, type, value) => AssertDecode(context, type, value),
  (context, type, value) => DecodeUnsafe(context, type, value)
]);


function AssertEncode(context: TProperties, type: TSchema, value: unknown): unknown {
  if (!Check(context, type, value)) {
    throw new EncodeError(value, Errors(context, type, value));
  }
  return value;
}

export const encode = Pipeline([
  (_context, _type, value) => Clone(value),
  (context, type, value) => EncodeUnsafe(context, type, value),
  (context, type, value) => Default(context, type, value),
  (context, type, value) => Clean(context, type, value),
  (context, type, value) => AssertEncode(context, type, value)
]);
