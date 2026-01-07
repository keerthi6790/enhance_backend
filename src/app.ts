require("dotenv").config();
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt, { FastifyJWT } from "fastify-jwt";
import { userSchema } from "./routes/user/user.schema";
import { UserRoutes } from "./routes/user/user.routes";
import { rechargeSchema } from "./routes/recharge/recharge.schema";
import { RechargeRoutes } from "./routes/recharge/recharge.routes";
import { toolsSchema } from "./routes/tools/tools.schema";
import { ToolsRoutes } from "./routes/tools/tools.routes";
import { pricingSchema } from "./routes/pricing/pricing.schema";
import { PricingRoutes } from "./routes/pricing/pricing.routes";
import { faqSchema } from "./routes/faq/faq.schema";
import { FaqRoutes } from "./routes/faq/faq.routes";
import { paymentSchema } from "./routes/payment/payment.schema";
import { PaymentRoutes } from "./routes/payment/payment.routes";
import multipart from "@fastify/multipart";
import fastifyCors from "@fastify/cors";
import { CommonRoutes } from "./routes/common/common.routes";
import { commonSchemas } from "./routes/common/common.schema";
import { seoPropsSchema } from "./routes/seoprops/seoprops.schema";
import { SeoPropsRoutes } from "./routes/seoprops/seoprops.routes";

const server = fastify();

server.register(multipart);

server.register(fastifyCors, {
  origin: ["http://localhost:5173", "https://enhanceassets.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

if (process.env.JWT_SECRET_KEY)
  server.register(fjwt, { secret: process.env.JWT_SECRET_KEY });

server.addHook("preHandler", (req, _, next) => {
  // here we are
  req.jwt = server.jwt;
  return next();
});

server.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req?.headers["authorization"]?.split(" ")[1];
    console.log({ token });
    if (!token) {
      return reply.status(401).send({ message: "Authentication required" });
    }
    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);

    req.user = decoded;
  }
);

server.get("/", (request, reply) => {
  reply.code(200).send("Running Up..");
});

for (let schema of [
  ...userSchema,
  ...rechargeSchema,
  ...toolsSchema,
  ...pricingSchema,
  ...paymentSchema,
  ...faqSchema,
  ...commonSchemas,
  ...seoPropsSchema,
]) {
  server.addSchema(schema);
}

server.register(UserRoutes, { prefix: "api/user" });
server.register(RechargeRoutes, { prefix: "api/recharge" });
server.register(CommonRoutes, { prefix: "api/common" });
server.register(ToolsRoutes, { prefix: "api/tools" });
server.register(PricingRoutes, { prefix: "api/pricing" });
server.register(FaqRoutes, { prefix: "api/faq" });
server.register(PaymentRoutes, { prefix: "api/payment" });
server.register(SeoPropsRoutes, { prefix: "api/seoprops" });

server
  .listen({ port: 8080, host: "0.0.0.0" })
  .then(() => console.log(`Process running on http://localhost:8080`))
  .catch((err) => {
    console.log({ err });
  });
