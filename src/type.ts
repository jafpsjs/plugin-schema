import type { FastifySchemas } from "fastify";
import type { Static, StaticDecode, StaticEncode, TSchema } from "typebox";

export type EncodeSchema<T extends TSchema> = StaticEncode<T, FastifySchemas>;
export type DecodeSchema<T extends TSchema> = StaticDecode<T, FastifySchemas>;
export type StaticSchema<T extends TSchema> = Static<T, FastifySchemas>;
