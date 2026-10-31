import type { DiscordGuildMember } from "@/types";

const DISCORD_API_URL = "https://discord.com/api/v10";
const MAX_ATTEMPTS = 3;
const MAX_RETRY_DELAY_SECONDS = 10;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

export async function discordFetch(path: string): Promise<Response> {
  const botToken = requireEnv("DISCORD_BOT_TOKEN");

  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${DISCORD_API_URL}${path}`, {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (response.status !== 429 || attempt === MAX_ATTEMPTS) {
      return response;
    }

    const retryAfter = Math.min(Number(response.headers.get("retry-after")) || 1, MAX_RETRY_DELAY_SECONDS);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
  }
}

export async function verifyUserRole(userId: string): Promise<boolean> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const requiredRoleId = requireEnv("DISCORD_REQUIRED_ROLE_ID");

  const response = await discordFetch(`/guilds/${guildId}/members/${userId}`);

  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch guild member ${userId}: ${response.status} ${response.statusText}`);
  }

  const member: DiscordGuildMember = await response.json();
  return member.roles.includes(requiredRoleId);
}
