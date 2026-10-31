import { discordFetch, requireEnv } from "@/lib/discord";
import type { DiscordGuildMember, Match } from "@/types";

const CACHE_TTL = 5 * 60 * 1000;
const PAGE_SIZE = 1000;

let membersCache: { members: DiscordGuildMember[]; fetchedAt: number } | null = null;
let pendingFetch: Promise<DiscordGuildMember[]> | null = null;

async function fetchAllMembers(): Promise<DiscordGuildMember[]> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const members: DiscordGuildMember[] = [];
  let after = "0";

  for (;;) {
    const response = await discordFetch(`/guilds/${guildId}/members?limit=${PAGE_SIZE}&after=${after}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch guild members: ${response.status} ${response.statusText}`);
    }

    const page: DiscordGuildMember[] = await response.json();
    members.push(...page);

    if (page.length < PAGE_SIZE) {
      return members;
    }
    after = page[page.length - 1].user.id;
  }
}

async function getDiscordMembers(): Promise<DiscordGuildMember[]> {
  if (membersCache && Date.now() - membersCache.fetchedAt < CACHE_TTL) {
    return membersCache.members;
  }

  pendingFetch ??= fetchAllMembers()
    .then((members) => {
      membersCache = { members, fetchedAt: Date.now() };
      return members;
    })
    .finally(() => {
      pendingFetch = null;
    });

  try {
    return await pendingFetch;
  } catch (error) {
    if (!membersCache) {
      throw error;
    }
    console.error("Failed to refresh guild members, using stale cache:", error);
    return membersCache.members;
  }
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
