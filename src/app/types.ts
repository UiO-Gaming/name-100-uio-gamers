export interface Match {
  id?: string;
  input: string;
  name: string | undefined;
  description: string | undefined;
  translationKey?: string;
  correct: boolean;
}

export interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    global_name: string | null;
    discriminator: string;
    avatar: string | null;
  };
  nick: string | null;
  roles: string[];
  joined_at: string;
}
