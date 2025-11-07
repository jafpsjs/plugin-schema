import { ValidationError } from "#error";
import type { ErrorFormatter } from "@jafps/plugin-error";

export const validationErrorFormatter: ErrorFormatter = async function (err) {
  if (!(err instanceof ValidationError)) {
    return null;
  }
  return {
    code: "InvalidValue",
    data: {
      fieldErrors: err.fieldErrors,
      message: "Value(s) does not match JSON schema."
    },
    status: 422,
    success: false
  };
};
