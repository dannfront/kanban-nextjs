import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // requireEmailVerification: false — no email service configured yet
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  // Session expires after 1 day. updateAge matches expiresIn to avoid
  // mid-session refresh churn. Cookie cache serves sessions from the
  // cookie for 5 minutes before a DB round-trip is needed.
  session: {
    expiresIn: 86400,
    updateAge: 86400,
    cookieCache: {
      enabled: true,
      maxAge: 300,
      strategy: "compact",
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },

  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : ["http://localhost:3000"],

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
    backgroundTasks: {
      handler: (promise: Promise<unknown>) => {
        // In serverless (Vercel), use waitUntil from next/server
        // In dev/Node, the promise runs to completion naturally
        if (typeof (globalThis as any).waitUntil === "function") {
          (globalThis as any).waitUntil(promise);
        }
      },
    },
  },
});
