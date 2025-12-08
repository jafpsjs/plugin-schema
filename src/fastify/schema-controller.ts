import { Compile } from "typebox/compile";
import { ValidationError } from "#error";
import { decode, encode } from "./typebox.js";
import type { FastifyInstance, FastifySchemas } from "fastify";
import type { FastifyRouteSchemaDef, FastifyValidationResult } from "fastify/types/schema.js";
import type { TOptions, TProperties, TSchema } from "typebox";

export type SchemaControllerOptions = {
  useReferences?: boolean;
};


export class SchemaController {
  private readonly app: FastifyInstance;
  private readonly useReferences: boolean;
  private readonly schemas: FastifySchemas;

  public constructor(app: FastifyInstance, opts: SchemaControllerOptions = {}) {
    const { useReferences = true } = opts;
    this.app = app;
    this.useReferences = useReferences;
    this.schemas = {} as FastifySchemas;
  }

  public deserialize(routeSchema: FastifyRouteSchemaDef<TSchema>): FastifyValidationResult {
    const { schema } = routeSchema;
    const ctx = (this.useReferences ? this.getSchemas() : {}) as TProperties;
    const compiledSchema = Compile(ctx, schema);
    return input => {
      let value: unknown;
      this.app.log.debug({ input, schema }, "Validate request");
      try {
        value = decode(ctx, schema, input);
        return { value };
      } catch (_e) {
        const errors = [...compiledSchema.Errors(value)];
        return { error: new ValidationError(errors) };
      }
    };
  }

  public serialize(routeSchema: FastifyRouteSchemaDef<TSchema>): (data: unknown) => string {
    const { schema } = routeSchema;
    const ctx = (this.useReferences ? this.getSchemas() : {}) as TProperties;
    const compiledSchema = Compile(ctx, schema);
    return input => {
      let value: unknown;
      this.app.log.debug({ input, schema }, "Serialize response");
      try {
        value = encode(ctx, schema, input);
        return JSON.stringify(value);
      } catch (_err) {
        const errors = [...compiledSchema.Errors(value)];
        const err = new ValidationError(errors);
        this.app.log.error({ err }, "Cannot serialize response to match response schema");
        throw err;
      }
    };
  }

  public addSchema<T extends keyof FastifySchemas>(schema: TOptions<FastifySchemas[T], { $id: string }>): void {
    const id = schema.$id;
    if (this.schemas[id]) {
      throw new Error(`Same schema $id has already added. (${id})`);
    }
    this.schemas[id] = schema;
  }

  public getSchema<T extends keyof FastifySchemas>(id: T): FastifySchemas[T] {
    return this.schemas[id];
  }

  public getSchemas(): FastifySchemas {
    return { ...this.schemas };
  }
}
