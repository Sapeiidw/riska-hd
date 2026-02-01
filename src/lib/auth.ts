import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "./db";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "RISKA HD <noreply@resend.dev>",
        to: user.email,
        subject: "Reset Password - RISKA HD",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Reset Password</h2>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk reset password akun RISKA HD Anda.</p>
            <p>Klik tombol di bawah ini untuk reset password:</p>
            <a href="${url}" style="display: inline-block; background: linear-gradient(to right, #0ea5e9, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
            <p>Atau salin link berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p style="color: #999; font-size: 12px; margin-top: 32px;">Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
        `,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      nik: {
        type: "string",
        required: false,
        input: true,
      },
      isActivated: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
});
