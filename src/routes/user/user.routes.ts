import { getUserData, editUser } from "./user.controller";
import { FastifyInstance } from "fastify";
import {
  requestEmail,
  verifyOtp,
  registerUser,
  loginUser,
  googleAuth,
} from "./user.controller";
import { $ref } from "./user.schema";

export const UserRoutes = async (app: FastifyInstance) => {
  app.post(
    "/request-email",
    { schema: { body: $ref("RequestEmailSchema") } },
    requestEmail
  );

  app.post(
    "/verify-otp",
    { schema: { body: $ref("VerifyOtpSchema") } },
    verifyOtp
  );

  app.post(
    "/register",
    { schema: { body: $ref("CreateUserSchema") } },
    registerUser
  );

  app.post("/login", { schema: { body: $ref("LoginUserSchema") } }, loginUser);

  app.post(
    "/google-auth",
    { schema: { body: $ref("GoogleAuthSchema") } },
    googleAuth
  );

  app.get(
    "/user",
    {
      schema: {
        querystring: $ref("GetUserDataQuerySchema"),
      },
    },
    getUserData
  );

  app.put(
    "/user",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("EditUserSchema"),
      },
    },
    editUser
  );
};
