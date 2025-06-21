import { authOptions } from "@/api/auth/[...nextauth]/route";
import { LanguageProvider } from "@/LanguageContext";
import { getServerSession } from "next-auth";
import HomeClient from "./components/HomeClient";
import LoginClient from "./components/LoginClient";

export default async function HomePageWithLanguage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <LanguageProvider>
        <LoginClient />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <HomeClient session={session} />
    </LanguageProvider>
  );
}
