"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      if (!user) {
        // User ไม่ได้ login ให้ redirect ไปหน้า login
        router.push("/login");
        return;
      }

      // ตรวจสอบ token
      try {
        const token = await getToken();
        if (!token) {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        router.push("/login");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [user, isLoaded, getToken, router]);

  // แสดง loading ขณะตรวจสอบ authentication
  if (!isLoaded || isChecking) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  // ถ้าไม่มี user ให้แสดง loading (จะ redirect ไปหน้า login)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Changing route...</p>
        </div>
      </div>
    );
  }

  // ถ้ามี user และ token ถูกต้องแล้ว ให้แสดง children
  return <>{children}</>;
}
