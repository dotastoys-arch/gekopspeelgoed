"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/klant/logout", { method: "POST" });
    router.push("/mijn-account/inloggen");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
    >
      Uitloggen
    </button>
  );
}
