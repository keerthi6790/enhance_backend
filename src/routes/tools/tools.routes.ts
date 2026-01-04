import { FastifyInstance } from "fastify";
import { processImagesController } from "./tools.controller";

export async function ToolsRoutes(server: FastifyInstance) {
  server.post(
    "/process-images",
    {
      preHandler: [server.authenticate],
    },
    async (req, reply) => {
      const userId = (req.user as any).id;
      const images: any[] = [];
      let option = {};

      // Parse multipart form data
      const parts = req.parts();
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "images") {
          const buffer = await part.toBuffer();
          images.push({
            buffer,
            filename: part.filename,
            mimetype: part.mimetype,
          });
        } else if (part.type === "field" && part.fieldname === "option") {
          try {
            option = JSON.parse(part.value as string);
          } catch {
            option = {};
          }
        }
      }

      if (!images.length) {
        return reply.status(400).send({ error: "No images uploaded" });
      }

      const result = await processImagesController(images, option, userId);

      if (result === "Please recharge") {
        return reply.status(402).send({ error: "Please recharge" });
      }
      // Return the processed image URL/result
      reply.send({
        processedImages: result,
      });
    }
  );
}
