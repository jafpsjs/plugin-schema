import { Compile } from "typebox/compile";
import { Clone } from "typebox/value";
import { ValidationError } from "#error";
import type { FastifyInstance, FastifySchemas } from "fastify";
import type { FastifyRouteSchemaDef, FastifyValidationResult } from "fastify/types/schema.js";
import type { TOptions, TProperties, TSchema } from "typebox";

export type SchemaControllerOptions = {
  useDefault?: boolean;
  useReferences?: boolean;
};


export class SchemaController {
  private readonly app: FastifyInstance;
  private readonly useDefault: boolean;
  private readonly useReferences: boolean;
  private readonly schemas: FastifySchemas;

  public constructor(app: FastifyInstance, opts: SchemaControllerOptions = {}) {
    const { useDefault = true, useReferences = true } = opts;
    this.app = app;
    this.useDefault = useDefault;
    this.useReferences = useReferences;
    this.schemas = {} as FastifySchemas;
  }

  public deserialize(routeSchema: FastifyRouteSchemaDef<TSchema>): FastifyValidationResult {
    const { schema } = routeSchema;
    const ctx = (this.useReferences ? this.schemas : {}) as TProperties;
    const compiledSchema = Compile(ctx, schema);
    return input => {
      const value = this.useDefault ? compiledSchema.Default(input) : input;
      this.app.log.debug({ input, schema, useDefault: this.useDefault, value }, "Validate request");
      try {
        if (!compiledSchema.Check(value)) {
          throw new Error("Invalid values");
        }
        return { value: compiledSchema.Clean(compiledSchema.Decode(value)) };
      } catch (_e) {
        const errors = [...compiledSchema.Errors(value)];
        return { error: new ValidationError(errors) };
      }
    };
  }

  public serialize(routeSchema: FastifyRouteSchemaDef<TSchema>): (data: unknown) => string {
    const { schema } = routeSchema;
    const ctx = (this.useReferences ? this.schemas : {}) as TProperties;
    const compiledSchema = Compile(ctx, schema);
    return data => {
      let value: unknown;
      try {
        const cleaned = compiledSchema.Clean(Clone(data));
        const defaultData = this.useDefault ? compiledSchema.Default(cleaned) : cleaned;
        value = compiledSchema.Encode(defaultData);
      } catch (_err) {
        const errors = [...compiledSchema.Errors(value)];
        const err = new ValidationError(errors);
        this.app.log.error({ err }, "Cannot serialize response to match response schema");
        throw err;
      }
      this.app.log.debug({ input: data, schema, useDefault: this.useDefault, value }, "Serialize response");
      return JSON.stringify(value);
    };
  }

  public addSchema<T extends keyof FastifySchemas>(schema: TOptions<FastifySchemas[T], { $id: string }>): void {
    const id = schema.$id;
    if (this.schemas[id]) {
      throw new Error(`Same schema $id has already added. (${id})`);
    }
    const { $id, ...others } = schema;
    this.schemas[id] = others;
  }

  public getSchema<T extends keyof FastifySchemas>(id: T): FastifySchemas[T] {
    return this.schemas[id];
  }

  public getSchemas(): FastifySchemas {
    return { ...this.schemas };
  }
}
