import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import { createSeoPropsSchema, updateSeoPropsSchema } from "./seoprops.schema";
import { z } from "zod";

type CreateSeoPropsInput = z.infer<typeof createSeoPropsSchema>;
type UpdateSeoPropsInput = z.infer<typeof updateSeoPropsSchema>;

export async function createSeoProps(
  req: FastifyRequest<{ Body: CreateSeoPropsInput }>,
  reply: FastifyReply
) {
  const body = req.body;
  try {
    const seoProps = await prisma.seoProps.create({
      data: body,
    });
    return reply.code(201).send(seoProps);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

export async function getSeoProps(
  req: FastifyRequest<{ Params: { pagename: string } }>,
  reply: FastifyReply
) {
  const { pagename } = req.params;
  console.log({ pagename });
  try {
    const seoProps = await prisma.seoProps.findUnique({
      where: { pagename },
      omit: {
        createdAt: true,
        updatedAt: true,
        id: true,
      },
    });
    if (!seoProps) {
      return reply.code(404).send({ message: "SeoProps not found" });
    }
    return reply.code(200).send(seoProps);
  } catch (e) {
    console.log({ e });
    return reply.code(500).send(e);
  }
}

export async function updateSeoProps(
  req: FastifyRequest<{ Params: { id: string }; Body: UpdateSeoPropsInput }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const body = req.body;
  try {
    const seoProps = await prisma.seoProps.update({
      where: { id },
      data: body,
    });
    return reply.code(200).send(seoProps);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

export async function deleteSeoProps(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  try {
    await prisma.seoProps.delete({
      where: { id },
    });
    return reply.code(204).send();
  } catch (e) {
    return reply.code(500).send(e);
  }
}
