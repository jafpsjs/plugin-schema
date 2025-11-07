import { ValidationError } from "#error";

interface FastifySchemaValidationError {
  instancePath: string;
  keyword: string;
  message?: string;
  params: Record<string, unknown>;
  schemaPath: string;
}

/**
 * @see https://fastify.dev/docs/v5.6.x/Reference/Validation-and-Serialization/#schemaerrorformatter
 */
export function schemaErrorFormatter(errors: FastifySchemaValidationError[]): Error {
  return new ValidationError(errors.map(e => {
    const { message = "Invalid input", ...others } = e;
    return { ...others, message };
  }));
}
