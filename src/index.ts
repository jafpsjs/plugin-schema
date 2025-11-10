import fp from "fastify-plugin";
import { SchemaController, schemaErrorFormatter } from "#fastify";
import { validationErrorFormatter } from "#formatter";
import { invalidValueErrorSchema } from "#schema";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FastifyInstance } from "fastify";
import type { StaticDecode, TProperties, TSchema } from "typebox";

export type SchemaPluginOptions = {
  /**
   * Use `default` in JSON schema.
   *
   * Default to `true`.
   */
  useDefault?: boolean;

  /**
   *  {@link FastifyInstance.getSchemas} as references.
   *
   * Default to `true`.
   */
  useReferences?: boolean;
};

export const name = "@jafps/plugin-schema";

export default fp<SchemaPluginOptions>(
  async (app, opts) => {
    const { useDefault, useReferences } = opts;
    const controller = new SchemaController(app, { useDefault, useReferences });
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

declare module "fastify" {
  interface FastifyTypeProviderDefault {
    serializer: this["schema"] extends TSchema ? StaticDecode<this["schema"], FastifySchemas> : unknown;
    validator: this["schema"] extends TSchema ? StaticDecode<this["schema"], FastifySchemas> : unknown;
  }

  interface FastifySchemas extends TProperties {

  }

  interface FastifyInstance {
    getSchema<T extends keyof FastifySchemas>(schemaId: T): FastifySchemas[T];
    getSchemas(): FastifySchemas;
  }
}
