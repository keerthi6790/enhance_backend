import { FastifyInstance } from "fastify";
import {
  addToolController,
  updateToolController,
  listToolsController,
} from "./common.controller";
import { $ref } from "./common.schema";

export async function CommonRoutes(server: FastifyInstance) {
  // List all tools
  server.get("/tools", async (req, reply) => {
    const tools = await listToolsController();
    reply.send(tools);
  });

  // Add a new tool
  server.post(
    "/tools",
    { schema: { body: $ref("addToolSchema") } },
    async (req, reply) => {
      const tool = await addToolController(req.body);
      reply.code(201).send(tool);
    }
  );

  // Update a tool
  server.put(
    "/tools/:id",
    {
      schema: {
        body: $ref("updateToolSchema"),
        params: $ref("toolIdParamSchema"),
      },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const tool = await updateToolController(id, req.body);
      reply.send(tool);
    }
  );
}
