"use client";

import { signOut } from "next-auth/react";
import { CiLogout } from "react-icons/ci";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()} className="rounded-lg bg-red-500 p-2 text-white" aria-label="Logout">
      <CiLogout size={24} />
    </button>
  );
}
