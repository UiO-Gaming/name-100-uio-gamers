interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  roles: string[];
  joined_at: string;
}

export async function verifyUserRole(userId: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const requiredRoleId = process.env.DISCORD_REQUIRED_ROLE_ID;

  if (!guildId || !requiredRoleId) {
    console.error("Missing DISCORD_GUILD_ID or DISCORD_REQUIRED_ROLE_ID environment variables");
    return false;
  }

  try {
    // Get the bot token from the Discord application
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error("Missing DISCORD_BOT_TOKEN environment variable");
      return false;
    }

    // Fetch the user's guild member information
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // User is not a member of the guild
        console.log(`User ${userId} is not a member of guild ${guildId}`);
        return false;
      }
      if (response.status === 403) {
        console.error("Bot does not have permission to view guild members");
        return false;
      }
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    const member: DiscordGuildMember = await response.json();

    // Check if the user has the required role
    const hasRole = member.roles.includes(requiredRoleId);
    console.log(`User ${userId} has role ${requiredRoleId}: ${hasRole}`);

    return hasRole;
  } catch (error) {
    console.error("Error verifying user role:", error);
    return false;
  }
}
