import prisma from "../../utils/Prisma";
import { AddToolInput, UpdateToolInput } from "./common.schema";

export async function addToolController(data: AddToolInput) {
  const tool = await prisma.tool.create({ data });
  return tool;
}

export async function updateToolController(id: string, data: UpdateToolInput) {
  const tool = await prisma.tool.update({
    where: { id },
    data,
  });
  return tool;
}

export async function listToolsController() {
  // Only return enabled tools
  const tools = await prisma.tool.findMany({
    where: { isEnabled: true },
    orderBy: { createdAt: "desc" },
  });
  return tools;
}
