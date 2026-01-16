import { AssertError } from "typebox/value";
import { ValidationError } from "#error";
import { decode, encode } from "./typebox.js";
import type { FastifyInstance, FastifySchemas } from "fastify";
import type { FastifyRouteSchemaDef, FastifyValidationResult } from "fastify/types/schema.js";
import type { TProperties, TSchema } from "typebox";

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
    return input => {
      let value: unknown;
      this.app.log.debug({ input, schema }, "Validate request");
      try {
        value = decode(ctx, schema, input);
        return { value };
      } catch (err) {
        this.app.log.info({ err }, "Cannot deserialize request to match request schema");
        if (err instanceof AssertError) {
          return { error: new ValidationError(err.cause.errors) };
        }
        return { error: new ValidationError([]) };
      }
    };
  }

  public serialize(routeSchema: FastifyRouteSchemaDef<TSchema>): (data: unknown) => string {
    const { schema } = routeSchema;
    const ctx = (this.useReferences ? this.getSchemas() : {}) as TProperties;
    return input => {
      let value: unknown;
      this.app.log.debug({ input, schema }, "Serialize response");
      try {
        value = encode(ctx, schema, input);
        return JSON.stringify(value);
      } catch (err) {
        this.app.log.info({ err }, "Cannot serialize response to match response schema");
        const error = err instanceof AssertError ? new ValidationError(err.cause.errors) : new ValidationError([]);
        throw error;
      }
    };
  }

  public addSchema<T extends keyof FastifySchemas>(schema: FastifySchemas[T]): void {
    if (!("$id" in schema)) {
      throw new Error("$id is not defined in schema.");
    }
    if (typeof schema.$id !== "string") {
      throw new Error(`$id is not string. (${typeof schema.$id})`);
    }
    if (!schema.$id) {
      throw new Error("$id is not empty");
    }
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
