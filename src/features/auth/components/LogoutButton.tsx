"use client";

import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth-client";
import { messages, useNotify } from "@/lib/notifications";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const notify = useNotify();
  const router = useRouter();

  async function onclick() {
    const { error } = await signOut();

    if (error) {
      notify.error(messages.signout.error);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      onClick={onclick}
      variant="secondary"
      size="xs"
      className="mx-4 mb-6 mt-3"
    >
      Log Out
    </Button>
  );
}
