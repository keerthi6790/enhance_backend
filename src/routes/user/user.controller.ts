import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../../utils/Prisma";
import { CreateUser, LoginUser } from "./user.schema";
import bcrypt from "bcrypt";
import { GenerateSixDigitOtp } from "../../utils/GenerateOtp";

interface OtpStore {
  [email: string]: { otp: number; expiresAt: number };
}

const otpStore: OtpStore = {};

// Step 1: Request email for login/registration
export const requestEmail = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User exists - return existing user flow
      return reply.code(200).send({
        message: "User exists",
        userExists: true,
        email,
      });
    }

    // New user - generate OTP for email verification
    const otp = GenerateSixDigitOtp();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // TODO: Send OTP to email (implement email service)
    console.log(`OTP for ${email}: ${otp}`);

    return reply.code(200).send({
      message: "OTP sent to email",
      userExists: false,
      email,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error processing request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 2: Verify OTP for registration
export const verifyOtp = async (
  req: FastifyRequest<{ Body: { email: string; otp: number } }>,
  reply: FastifyReply
) => {
  try {
    const { email, otp } = req.body;

    const otpData = otpStore[email];

    if (!otpData) {
      return reply.code(400).send({
        message: "OTP not found or expired",
      });
    }

    if (otpData.otp !== otp) {
      return reply.code(400).send({
        message: "Invalid OTP",
      });
    }

    if (otpData.expiresAt < Date.now()) {
      delete otpStore[email];
      return reply.code(400).send({
        message: "OTP expired",
      });
    }

    // OTP verified successfully
    delete otpStore[email];

    return reply.code(200).send({
      message: "OTP verified successfully",
      email,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error verifying OTP",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 3: Register new user (normal flow)
export const registerUser = async (
  req: FastifyRequest<{ Body: CreateUser }>,
  reply: FastifyReply
) => {
  try {
    const { email, firstName, lastName, phoneNumber, hashed_password } =
      req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.code(400).send({
        message: "Email already registered",
      });
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (hashed_password) {
      hashedPassword = await bcrypt.hash(hashed_password, 10);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        hashed_password: hashedPassword,
        signInType: "NORMAL",
      },
    });

    // Generate JWT token
    const token = req.server.jwt.sign({
      id: newUser.id,
      email: newUser.email,
    });

    return reply.code(201).send({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error registering user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 4: Login user (normal flow)
export const loginUser = async (
  req: FastifyRequest<{ Body: LoginUser }>,
  reply: FastifyReply
) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(401).send({
        message: "Invalid credentials",
      });
    }

    // Check if user signed up with Google
    if (user.signInType === "GOOGLE") {
      return reply.code(400).send({
        message:
          "This account is linked to Google. Use Google sign-in instead.",
      });
    }

    // Verify password
    if (!user.hashed_password) {
      return reply.code(400).send({
        message: "Password not set for this account",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (!isPasswordValid) {
      return reply.code(500).send({
        message: "Password not matched",
      });
    }

    // Generate JWT token
    const token = req.server.jwt.sign({
      id: user.id,
      email: user.email,
    });

    return reply.code(200).send({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error during login",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 5: Google Sign-In/Sign-Up
export const googleAuth = async (
  req: FastifyRequest<{
    Body: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { email, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // User exists - just generate token
      if (user.signInType !== "GOOGLE") {
        return reply.code(400).send({
          message: "This email is already registered with normal sign-up",
        });
      }
    } else {
      // Create new user with Google sign-in
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          hashed_password: null,
          signInType: "GOOGLE",
        },
      });
    }

    // Generate JWT token
    const token = req.server.jwt.sign({
      id: user.id,
      email: user.email,
    });

    return reply.code(user ? 200 : 201).send({
      message: user ? "Login successful" : "User created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error during Google authentication",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 6: Get user data by id or email
export const getUserData = async (
  req: FastifyRequest<{ Querystring: { id?: string; email?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id, email } = req.query;
    if (!id && !email) {
      return reply.code(400).send({ message: "User id or email required" });
    }
    const user = await prisma.user.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        signInType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }
    return reply.code(200).send({ user });
  } catch (error) {
    reply.code(500).send({
      message: "Error fetching user data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 7: Edit user data (protected route - email not editable)
export const editUser = async (
  req: FastifyRequest<{
    Body: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string | null;
      hashed_password?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    // Check if user is authenticated
    await req.jwtVerify();
    const userId = (req.user as any).id;

    if (!userId) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    const { firstName, lastName, phoneNumber, hashed_password } = req.body;

    // Prepare update data (email is not editable)
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (hashed_password !== undefined) {
      updateData.hashed_password = await bcrypt.hash(hashed_password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return reply.code(400).send({ message: "No fields to update" });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        signInType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return reply.code(200).send({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.name === "UnauthorizedError") {
      return reply.code(401).send({ message: "Unauthorized" });
    }
    reply.code(500).send({
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
