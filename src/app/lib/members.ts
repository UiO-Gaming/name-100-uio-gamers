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

function memberMatchesInput(member: DiscordGuildMember, normalizedInput: string): boolean {
  return [member.user.username, member.user.global_name, member.nick].some(
    (name) => name?.toLowerCase() === normalizedInput,
  );
}

export async function getPayingMemberCount(): Promise<number> {
  const payingMemberRoleId = requireEnv("DISCORD_REQUIRED_ROLE_ID");
  const members = await getDiscordMembers();
  return members.filter((m) => m.roles.includes(payingMemberRoleId)).length;
}

export async function findDiscordMember(input: string, guessedIds: string[]): Promise<Match> {
  const payingMemberRoleId = requireEnv("DISCORD_REQUIRED_ROLE_ID");
  const normalizedInput = input.toLowerCase().trim();
  const guessed = new Set(guessedIds);

  const candidates = (await getDiscordMembers()).filter((member) => memberMatchesInput(member, normalizedInput));
  const isPaying = (member: DiscordGuildMember) => member.roles.includes(payingMemberRoleId);
  const isUnguessed = (member: DiscordGuildMember) => !guessed.has(member.user.id);

  const member =
    candidates.find((m) => isPaying(m) && isUnguessed(m)) ??
    candidates.find((m) => !isPaying(m) && isUnguessed(m)) ??
    candidates.find(isPaying) ??
    candidates[0];

  if (!member) {
    return { input, name: undefined, description: undefined, correct: false };
  }

  const name = getDisplayName(member);

  if (!isPaying(member)) {
    return {
      id: member.user.id,
      input,
      name,
      description: undefined,
      translationKey: "notPayingMember",
      correct: false,
    };
  }

  return {
    id: member.user.id,
    input,
    name,
    description: name === member.user.username ? undefined : member.user.username,
    correct: true,
  };
}
