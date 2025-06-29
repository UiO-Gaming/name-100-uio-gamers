"use client";

import { signOut } from "next-auth/react";
import { CiLogout } from "react-icons/ci";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="cursor-pointer rounded-lg bg-red-500 p-2 text-white duration-300 hover:bg-white hover:text-red-500"
      aria-label="Logout"
    >
      <CiLogout size={24} />
    </button>
  );
}
