"use client";

import { signIn } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

export default function LoginButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => signIn("discord")}
      className="flex cursor-pointer items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-white"
    >
      <FaDiscord />
      {text}
    </button>
  );
}
