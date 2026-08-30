"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Wraps pages that require authentication.
 * - Redirects to /login if no token.
 * - Redirects to /chat if admin is required but user is not admin.
 * Shows a full-screen loader while checking.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && user?.role !== "admin") {
      router.replace("/chat");
      return;
    }
    setChecking(false);
  }, [token, user, router, requireAdmin]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
