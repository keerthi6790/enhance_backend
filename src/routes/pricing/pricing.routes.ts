import { FastifyInstance } from "fastify";
import { getPricingTiers, calculateCredits } from "./pricing.controller";
import { $ref } from "./pricing.schema";

export const PricingRoutes = async (app: FastifyInstance) => {
    app.get("/tiers", getPricingTiers);
    app.post(
        "/calculate",
        { schema: { body: $ref("CalculateCreditsSchema") } },
        calculateCredits
    );
};
