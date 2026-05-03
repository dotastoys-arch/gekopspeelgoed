import { getSession } from "./session";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/login");
  }
}
