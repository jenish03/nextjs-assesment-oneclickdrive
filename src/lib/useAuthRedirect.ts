"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function useAuthRedirect({
  requireAuth,
  redirectTo,
}: {
  requireAuth: boolean;
  redirectTo: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = Cookies.get("auth_token") === "authenticated";
    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
    }
    if (!requireAuth && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [requireAuth, redirectTo, router]);
}
