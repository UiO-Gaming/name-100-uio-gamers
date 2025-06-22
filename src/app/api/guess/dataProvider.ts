import type { DiscordGuildMember, Match } from "@/types";

interface CacheEntry {
  data: DiscordGuildMember[];
  timestamp: number;
}

// In-memory cache for Discord API responses
let discordMembersCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function getDiscordMembers(): Promise<DiscordGuildMember[]> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    throw new Error("Missing required Discord environment variables");
  }

  // Check if cache is valid
  if (discordMembersCache && Date.now() - discordMembersCache.timestamp < CACHE_TTL) {
    return discordMembersCache.data;
  }

  // Fetch fresh data from Discord API with pagination
  const allMembers: DiscordGuildMember[] = [];
  let after: string | undefined = undefined;
  const limit = 1000; // Maximum allowed by Discord API

  do {
    const url = new URL(`https://discord.com/api/v10/guilds/${guildId}/members`);
    url.searchParams.set("limit", limit.toString());
    if (after) {
      url.searchParams.set("after", after);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guild members: ${response.status} ${response.statusText}`);
    }

    const members: DiscordGuildMember[] = await response.json();
    allMembers.push(...members);

    // Update 'after' for next page (use the last member's user ID)
    if (members.length === limit) {
      after = members[members.length - 1].user.id;
    } else {
      after = undefined; // No more pages
    }
  } while (after);

  // Update cache
  discordMembersCache = {
    data: allMembers,
    timestamp: Date.now(),
  };

  return allMembers;
}

function getDisplayName(member: DiscordGuildMember): string {
  return member.nick || member.user.global_name || member.user.username;
}

function normalizeInput(input: string): string {
  return input.toLowerCase().trim();
}

function memberMatchesInput(member: DiscordGuildMember, normalizedInput: string): boolean {
  const username = member.user.username.toLowerCase();
  const globalName = member.user.global_name?.toLowerCase() || "";
  const nickname = member.nick?.toLowerCase() || "";

  return username === normalizedInput || globalName === normalizedInput || nickname === normalizedInput;
}

export async function findDiscordMember(input: string): Promise<Match> {
  const payingMemberRoleId = process.env.DISCORD_REQUIRED_ROLE_ID;

  if (!payingMemberRoleId) {
    console.error("Missing required Discord environment variables");
    return {
      input,
      name: undefined,
      description: undefined,
      correct: false,
    };
  }

  try {
    const members = await getDiscordMembers();
    const payingMembers = members.filter((member) => member.roles.includes(payingMemberRoleId));
    const normalizedInput = normalizeInput(input);

    // First check if any member matches the input (regardless of role)
    const anyMatchingMember = members.find((member) => memberMatchesInput(member, normalizedInput));

    // If member exists but doesn't have the paying member role
    if (anyMatchingMember && !anyMatchingMember.roles.includes(payingMemberRoleId)) {
      return {
        input,
        name: getDisplayName(anyMatchingMember),
        description: undefined,
        translationKey: "notPayingMember",
        correct: false,
      };
    }

    // Find matching member among paying members
    const matchingMember = payingMembers.find((member) => memberMatchesInput(member, normalizedInput));

    if (matchingMember) {
      const displayName = getDisplayName(matchingMember);
      const username = matchingMember.user.username;

      return {
        input,
        name: displayName,
        description: displayName === username ? undefined : username,
        correct: true,
      };
    }

    return {
      input,
      name: undefined,
      description: undefined,
      correct: false,
    };
  } catch (error) {
    console.error("Error finding Discord member:", error);
    return {
      input,
      name: undefined,
      description: undefined,
      correct: false,
    };
  }
}
