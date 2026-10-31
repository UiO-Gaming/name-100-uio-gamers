# Name 100 UiO Gamers

Inspired by the "[name 100 women challenge](https://knowyourmeme.com/memes/name-100-women-challenge)", this project is the same concept but limited to members of UiO Gaming, regardless of gender.

## Setup

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under **OAuth2**, add `<NEXTAUTH_URL>/api/auth/callback/discord` as a redirect URL.
3. Under **Bot**, create a bot, enable the **Server Members Intent**, and invite it to the UiO Gaming server. The bot only needs to be a member of the server; no extra permissions are required.
4. Copy `env.example` to `.env` and fill in the values:

| Variable                   | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `DISCORD_CLIENT_ID`        | OAuth2 client ID of the Discord application                           |
| `DISCORD_CLIENT_SECRET`    | OAuth2 client secret of the Discord application                       |
| `DISCORD_BOT_TOKEN`        | Token of the bot user                                                 |
| `DISCORD_GUILD_ID`         | ID of the UiO Gaming Discord server                                   |
| `DISCORD_REQUIRED_ROLE_ID` | ID of the paying member role, required to log in and counted as valid |
| `NEXTAUTH_SECRET`          | Random secret used to sign sessions, e.g. `openssl rand -base64 32`   |
| `NEXTAUTH_URL`             | Public URL of the site, e.g. `http://localhost:3000`                  |

## Development

```
npm install
npm run dev
```

starts a development server on http://localhost:3000. See the Next.js documentation for more details.

Run `npm run lint` to lint the project.

## Deployment

The app is deployed with Docker Compose, which reads the environment variables from `.env`:

```
docker compose up -d --build
```

Pushing to `main` deploys automatically through the GitHub Actions workflow in `.github/workflows/deploy.yml`.
