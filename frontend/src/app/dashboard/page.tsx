"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    if (user?.role === "admin") { router.replace("/admin"); }
    else { router.replace("/chat"); }
  }, [token, user, router]);

  return null;
}
