import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../../utils/Prisma";
import { CreateUser, LoginUser } from "./user.schema";
import bcrypt from "bcrypt";
import { GenerateSixDigitOtp } from "../../utils/GenerateOtp";
import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail, sendForgotPasswordEmail } from "../../utils/EmailService";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Send OTP to email
    await sendOtpEmail(email, otp);

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
        credits: newUser.credits,
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
        credits: user.credits,
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
      idToken: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { idToken, phoneNumber } = req.body;

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return reply.code(400).send({ message: "Invalid Google token" });
    }

    const {
      email,
      given_name: firstName,
      family_name: lastName,
      sub: googleId,
    } = payload;

    if (!email) {
      return reply.code(400).send({ message: "Email not provided by Google" });
    }

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
          firstName: firstName || "Google",
          lastName: lastName || "User",
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
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
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
        credits: true,
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
        credits: true,
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

// Step 8: Forgot Password
export const forgotPassword = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    if (user.signInType === "GOOGLE") {
      return reply.code(400).send({
        message: "This account is linked to Google. Use Google sign-in instead.",
      });
    }

    const otp = GenerateSixDigitOtp();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    await sendForgotPasswordEmail(email, otp);

    return reply.code(200).send({
      message: "Password reset OTP sent to email",
      email,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error processing forgot password request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 9: Reset Password
export const resetPassword = async (
  req: FastifyRequest<{ Body: { email: string; otp: number; password: string } }>,
  reply: FastifyReply
) => {
  try {
    const { email, otp, password } = req.body;

    const otpData = otpStore[email];

    if (!otpData || otpData.otp !== otp || otpData.expiresAt < Date.now()) {
      return reply.code(400).send({
        message: "Invalid or expired OTP",
      });
    }

    delete otpStore[email];

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { hashed_password: hashedPassword },
    });

    return reply.code(200).send({
      message: "Password reset successfully",
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error resetting password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 10: Resend OTP
export const resendOtp = async (
  req: FastifyRequest<{ Body: { email: string; type: "REGISTRATION" | "FORGOT_PASSWORD" } }>,
  reply: FastifyReply
) => {
  try {
    const { email, type } = req.body;

    const otp = GenerateSixDigitOtp();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    if (type === "REGISTRATION") {
      await sendOtpEmail(email, otp);
    } else {
      await sendForgotPasswordEmail(email, otp);
    }

    return reply.code(200).send({
      message: "New OTP sent to email",
      email,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error resending OTP",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Step 11: Change Password (Logged-in)
export const changePassword = async (
  req: FastifyRequest<{ Body: { oldPassword: string; newPassword: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashed_password) {
      return reply.code(404).send({ message: "User not found or using social login" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.hashed_password);
    if (!isMatch) {
      return reply.code(400).send({ message: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { hashed_password: hashedNewPassword },
    });

    return reply.code(200).send({
      message: "Password changed successfully",
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error changing password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
