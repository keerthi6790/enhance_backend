import { FastifyInstance } from "fastify";
import {
  rechargeCredits,
  getAvailableCredits,
  getRechargeHistory,
} from "./recharge.controller";
import { $ref } from "./recharge.schema";

export const RechargeRoutes = async (app: FastifyInstance) => {
  app.post(
    "/recharge",
    {
      preHandler: [app.authenticate], // Require authentication
      schema: {
        body: $ref("RechargeRequestSchema"),
        response: { 200: $ref("RechargeResponseSchema") },
      },
    },
    rechargeCredits
  );

  // Get available credits
  app.get(
    "/available-credits",
    {
      preHandler: [app.authenticate],
    },
    getAvailableCredits
  );

  // Get recharge history
  app.get(
    "/recharge-history",
    {
      preHandler: [app.authenticate],
    },
    getRechargeHistory
  );
};
