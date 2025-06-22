import { LanguageProvider } from "@/LanguageContext";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthErrorClient from "./AuthErrorClient";

export default async function AuthErrorPage() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to home
  if (session) {
    redirect("/");
  }

  return (
    <LanguageProvider>
      <AuthErrorClient />
    </LanguageProvider>
  );
}
