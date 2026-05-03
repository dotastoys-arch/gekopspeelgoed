"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-xs text-white/50 hover:text-white/80 transition-colors"
    >
      Uitloggen
    </button>
  );
}
