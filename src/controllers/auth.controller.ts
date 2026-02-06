import { Request, Response } from "express";
import { prisma } from "../index";
import { createClient } from "@supabase/supabase-js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "../validation/auth.validation";
import ErrorHandler from "../utils/errorHandler";
import { z } from "zod";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // For admin operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // For client operations

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Admin client (has service role key - bypasses RLS)
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Public client (for regular operations)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const register = async (req: Request, res: Response) => {
  console.log("📝 Register route hit - Email:", req.body?.email);
  try {
    const { success, data, error } = registerSchema.safeParse(req.body);

    if (!success) {
      const formattedError =
        error.issues?.map((issue: any) => issue.message).join(", ") ||
        "Invalid input data";
      throw new ErrorHandler(
        "Invalid input: " + formattedError,
        400
      );
    }

    const { email, password, fullname } = data;

    if (!email || !password) {
      throw new ErrorHandler("Email and password are required", 400);
    }

    // Register user in Supabase Auth using admin client
    const { data: authData, error: authError } = supabaseAdmin
      ? await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false, // Email confirmation required
          user_metadata: {
            full_name: fullname || email.split("@")[0],
          },
        })
      : await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullname || email.split("@")[0],
            },
          },
        });

    if (authError) {
      throw new ErrorHandler(
        authError.message || "Registration failed",
        400
      );
    }

    if (!authData.user) {
      throw new ErrorHandler("Failed to create user", 500);
    }

    // Ensure the ID is a string
    const userId = String(authData.user.id);
    const userEmail = authData.user.email || email;

    // Sync user to your database using upsert
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userEmail,
        isVerified: authData.user.email_confirmed_at ? true : false,
      },
      create: {
        id: userId,
        email: userEmail,
        isVerified: authData.user.email_confirmed_at ? true : false,
        role: "USER",
      },
      include: { Profile: true },
    });

    // Auto-login user after registration: sign in with the provided credentials
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

    if (sessionError || !sessionData.session) {
      // If auto-login fails, still return user but without session tokens
      console.warn("Auto-login after registration failed:", sessionError);
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please login to continue.",
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
          profile: user.Profile,
        },
      });
    }

    // Registration successful with auto-login
    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        profile: user.Profile,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in,
      },
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    // Ensure proper error handling
    throw new ErrorHandler(
      err instanceof Error ? err.message : "Registration failed",
      500
    );
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("🔐 Login route hit - Email:", req.body?.email);
  const { success, data, error } = loginSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.issues });
  }

  const { email, password } = data;

  // Sign in user with Supabase
  const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return res.status(401).json({ error: authError.message });
  }

  if (!authData.user || !authData.session) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if user exists in Prisma database
  let user = await prisma.user.findUnique({
    where: { id: authData.user.id },
  });

  if (!user) {
    // If not found by Supabase ID, try to find by email to avoid unique email conflicts
    if (authData.user.email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: authData.user.email },
      });

      if (existingByEmail) {
        // Reuse existing user with same email, and update verification / last active
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            isVerified: authData.user.email_confirmed_at ? true : false,
            lastActiveDate: new Date(),
          },
        });
      }
    }
  }

  // If still no user, create a new one
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        isVerified: authData.user.email_confirmed_at ? true : false,
      },
    });
  } else {
    // Update last active date for existing user
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() },
    });
  }

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
    session: authData.session,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  console.log("🔄 Refresh token route hit");
  const { success, data, error } = refreshTokenSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.issues });
  }

  const { refresh_token } = data;

  // Refresh the session with Supabase
  const { data: sessionData, error: refreshError } = await supabaseClient.auth.refreshSession({
    refresh_token,
  });

  if (refreshError || !sessionData.session) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  return res.status(200).json({
    message: "Token refreshed successfully",
    session: sessionData.session,
  });
};

export const logout = async (req: Request, res: Response) => {
  console.log("🚪 Logout route hit - User ID:", req.user?.id || "Unknown");
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const accessToken = authHeader.split(" ")[1];

    // Sign out the user
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  console.log("🔑 Forgot password route hit - Email:", req.body?.email);
  const { success, data, error } = forgotPasswordSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.issues });
  }

  const { email } = data;

  // Send password reset email
  const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL || `${process.env.FRONTEND_URL}/reset-password`,
  });

  if (resetError) {
    return res.status(400).json({ error: resetError.message });
  }

  return res.status(200).json({
    message: "Password reset email sent successfully",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log("🔓 Reset password route hit");
  const { success, data, error } = resetPasswordSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.issues });
  }

  const { access_token, password } = data;

  // Create a Supabase client with the access token
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  });

  // Verify the token is valid
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(access_token);

  if (userError || !user) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Update password using the session
  const { error: updateError } = await supabaseClient.auth.updateUser({
    password: password,
  });

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.status(200).json({
    message: "Password reset successfully",
  });
};

export const syncUser = async (req: Request, res: Response) => {
  console.log("🔄 Sync user route hit - User ID:", req.user?.id || "Unknown");
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get latest user data from Supabase
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const accessToken = authHeader.split(" ")[1];
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data: { user: supabaseUser }, error } = await supabaseClient.auth.getUser(accessToken);

  if (error || !supabaseUser) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Sync user data
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: supabaseUser.email || user.email,
      isVerified: supabaseUser.email_confirmed_at ? true : false,
      lastActiveDate: new Date(),
    },
  });

  return res.status(200).json({
    message: "User synced successfully",
    user: updatedUser,
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  console.log("👤 Get current user route hit - User ID:", req.user?.id || "Unknown");
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get user with profile
  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      Profile: true,
    },
  });

  return res.status(200).json({
    message: "User retrieved successfully",
    user: userWithProfile,
  });
};

export const updateCurrentUser = async (req: Request, res: Response) => {
  console.log("✏️ Update current user route hit - User ID:", req.user?.id || "Unknown");
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { success, data, error } = updateUserSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.issues });
  }

  // Update user in Prisma
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: data.email,
    },
  });

  // Update user metadata in Supabase if needed
  if (data.fullname) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      await supabaseClient.auth.updateUser({
        data: {
          full_name: data.fullname,
        },
      });
    }
  }

  return res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
};
