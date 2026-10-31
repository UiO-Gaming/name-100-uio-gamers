import { verifyUserRole } from "@/lib/discord";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider, { type DiscordProfile } from "next-auth/providers/discord";

const ROLE_RECHECK_INTERVAL = 60 * 60 * 1000;

const roleChecks = new Map<string, { hasRole: boolean; checkedAt: number }>();

async function checkRole(userId: string): Promise<boolean> {
  const hasRole = await verifyUserRole(userId);
  roleChecks.set(userId, { hasRole, checkedAt: Date.now() });
  return hasRole;
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      profile(profile: DiscordProfile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        return await checkRole(user.id);
      } catch (error) {
        console.error("Error verifying user role:", error);
        return false;
      }
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const cached = roleChecks.get(token.sub);
      let hasRole = cached?.hasRole ?? true;

      if (!cached || Date.now() - cached.checkedAt > ROLE_RECHECK_INTERVAL) {
        try {
          hasRole = await checkRole(token.sub);
        } catch (error) {
          console.error("Error re-verifying user role:", error);
        }
      }

      if (!hasRole) {
        throw new Error(`User ${token.sub} no longer has the required role`);
      }
      return token;
    },
  },
  pages: {
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL,
  }),
};
