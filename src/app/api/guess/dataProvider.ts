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

export async function getPayingMemberCount(): Promise<number> {
  const payingMemberRoleId = process.env.DISCORD_REQUIRED_ROLE_ID;
  if (!payingMemberRoleId) {
    throw new Error("Missing DISCORD_REQUIRED_ROLE_ID environment variable");
  }
  const members = await getDiscordMembers();
  return members.filter((m) => m.roles.includes(payingMemberRoleId)).length;
}

export async function findDiscordMember(input: string, guessedIds: string[] = []): Promise<Match> {
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
    const normalizedInput = normalizeInput(input);

    const allMatchingMembers = members.filter((member) => memberMatchesInput(member, normalizedInput));

    if (allMatchingMembers.length === 0) {
      return { input, name: undefined, description: undefined, correct: false };
    }

    const payingMembers = allMatchingMembers.filter((member) => member.roles.includes(payingMemberRoleId));
    const nonPayingMembers = allMatchingMembers.filter((member) => !member.roles.includes(payingMemberRoleId));

    const unguessedPayingMember = payingMembers.find((member) => !guessedIds.includes(member.user.id));

    if (unguessedPayingMember) {
      const displayName = getDisplayName(unguessedPayingMember);
      const username = unguessedPayingMember.user.username;

      return {
        id: unguessedPayingMember.user.id,
        input,
        name: displayName,
        description: displayName === username ? undefined : username,
        correct: true,
      };
    }

    const unguessedNonPayingMember = nonPayingMembers.find((member) => !guessedIds.includes(member.user.id));

    if (unguessedNonPayingMember) {
      return {
        id: unguessedNonPayingMember.user.id,
        input,
        name: getDisplayName(unguessedNonPayingMember),
        description: undefined,
        translationKey: "notPayingMember",
        correct: false,
      };
    }

    // If we are here, all matching members (paying or not) have been guessed.
    // Return the first paying member match to signal a duplicate to the client.
    if (payingMembers.length > 0) {
      const firstPayingMatch = payingMembers[0];
      const displayName = getDisplayName(firstPayingMatch);
      const username = firstPayingMatch.user.username;

      return {
        id: firstPayingMatch.user.id,
        input,
        name: displayName,
        description: displayName === username ? undefined : username,
        correct: true, // It is a correct member, but already guessed.
      };
    }

    // If no paying members matched, return the first non-paying member.
    if (nonPayingMembers.length > 0) {
      const firstNonPayingMatch = nonPayingMembers[0];
      return {
        id: firstNonPayingMatch.user.id,
        input,
        name: getDisplayName(firstNonPayingMatch),
        description: undefined,
        translationKey: "notPayingMember",
        correct: false,
      };
    }

    // Should not be reached if allMatchingMembers.length > 0
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
