import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

export const toolBaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  link: z.string().url(),
  isEnabled: z.boolean().optional(),
});

export const addToolSchema = toolBaseSchema;

export const updateToolSchema = toolBaseSchema.partial();

export const toolIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const toolListSchema = z.array(
  toolBaseSchema.extend({
    id: z.string().cuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
    isEnabled: z.boolean(),
  })
);

export type AddToolInput = z.infer<typeof addToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type ToolIdParamInput = z.infer<typeof toolIdParamSchema>;
export type ToolListOutput = z.infer<typeof toolListSchema>;

export const { schemas: commonSchemas, $ref } = buildJsonSchemas(
  {
    addToolSchema,
    updateToolSchema,
    toolIdParamSchema,
    toolListSchema,
  },
  { $id: "commonSchemas" }
);
