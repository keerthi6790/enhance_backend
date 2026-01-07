import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

export const createSeoPropsSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
  image: z.string(),
  pagename: z.string(),
});

export const updateSeoPropsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  image: z.string().optional(),
  pagename: z.string().optional(),
});

const seoPropsResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
  pagename: z.string(),
});

export const { schemas: seoPropsSchema, $ref } = buildJsonSchemas(
  {
    CreateSeoPropsSchema: createSeoPropsSchema,
    UpdateSeoPropsSchema: updateSeoPropsSchema,
    SeoPropsResponseSchema: seoPropsResponseSchema,
  },
  { $id: "SeoPropsSchema" }
);
