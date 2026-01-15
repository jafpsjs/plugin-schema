import fp from "fastify-plugin";
import { SchemaController, schemaErrorFormatter } from "#fastify";
import { validationErrorFormatter } from "#formatter";
import { invalidValueErrorSchema } from "#schema";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FastifyInstance } from "fastify";
import type { StaticDecode, StaticEncode, TProperties, TSchema } from "typebox";

/* node:coverage disable */
export type SchemaPluginOptions = {
  /**
   *  {@link FastifyInstance.getSchemas} as references.
   *
   * Default to `true`.
   */
  useReferences?: boolean;
};

/* node:coverage enable */

export const name = "@jafps/plugin-schema";

export default fp<SchemaPluginOptions>(
  async (app, opts) => {
    const { useReferences } = opts;
    const controller = new SchemaController(app, { useReferences });
    app.decorate("schemas", controller);
    app.setValidatorCompiler(schema => controller.deserialize(schema));
    app.setSerializerCompiler(schema => controller.serialize(schema));
    app.setSchemaErrorFormatter(schemaErrorFormatter);
    app.errorSchemas.addFormatter(validationErrorFormatter);
    app.errorSchemas.addSchema(422, invalidValueErrorSchema);
  },
  {
    decorators: {},
    dependencies: ["@jafps/plugin-error"],
    fastify: "5.x",
    name
  }
);

export { ValidationError } from "#error";

/* node:coverage disable */
declare module "fastify" {
  interface FastifyTypeProviderDefault {
    serializer: this["schema"] extends TSchema ? StaticEncode<this["schema"], FastifySchemas> : unknown;
    validator: this["schema"] extends TSchema ? StaticDecode<this["schema"], FastifySchemas> : unknown;
  }

  interface FastifySchemas extends TProperties {

  }

  interface FastifyInstance {
    schemas: SchemaController;
  }
}


/* node:coverage enable */
