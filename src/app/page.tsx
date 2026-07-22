import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata = {
  title: "Kanban Board",
  description: "Kanban project management tool",
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/kanban-dashboard");
  }

  redirect("/auth/login");
}
