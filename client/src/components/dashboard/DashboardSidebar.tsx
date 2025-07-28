"use client";
import { Button } from "@/components/ui";
import {
  HomeIcon,
  FileText,
  Clock,
  User,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import binderLogo from "../../../public/binderLogo.png";
import Image from "next/image";

export function DashboardSidebar({ clerkUser }: { clerkUser: any }) {
  const pathname = usePathname();
  const isDashboardPage = pathname === "/dashboard";
  const isTransactionPage = pathname === "/transactions";
  const isBudgetPage = pathname === "/budget";
  const isReportPage = pathname === "/reports";

  return (
    <aside className="w-64 flex flex-col py-8 px-4 gap-4 bg-background border-r shadow-sm">
      <div
        onClick={() => (window.location.href = "/")}
        className="mb-8 text-2xl font-bold tracking-tight text-foreground cursor-pointer"
      >
        <Image
          src={binderLogo}
          alt="Binder Logo"
          width={150}
          height={150}
          className="cursor-pointer"
          priority
        />
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        <Button
          variant="ghost"
          className={`flex items-center gap-3 justify-start text-foreground cursor-pointer ${
            isDashboardPage ? "bg-accent hover:bg-accent/80" : ""
          }`}
          onClick={() => (window.location.href = "/dashboard")}
        >
          <HomeIcon /> Dashboard
        </Button>

        <Button
          variant="ghost"
          className={`flex items-center gap-3 justify-start text-foreground cursor-pointer ${
            isTransactionPage ? "bg-accent hover:bg-accent/80" : ""
          }`}
          onClick={() => (window.location.href = "/transactions")}
        >
          <User /> Transaction
        </Button>

        <Button
          variant="ghost"
          className={`flex items-center gap-3 justify-start text-foreground cursor-pointer ${
            isBudgetPage ? "bg-accent hover:bg-accent/80" : ""
          }`}
          onClick={() => (window.location.href = "/budget")}
        >
          <Clock /> Budget
        </Button>

        <Button
          variant="ghost"
          className={`flex items-center gap-3 justify-start text-foreground cursor-pointer ${
            isReportPage ? "bg-accent hover:bg-accent/80" : ""
          }`}
          onClick={() => (window.location.href = "/reports")}
        >
          <BarChart3 /> Report & Analysis
        </Button>
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-muted-foreground">
            {clerkUser?.fullName?.toUpperCase() ||
              clerkUser?.primaryEmailAddress?.emailAddress ||
              clerkUser?.firstName?.toUpperCase() ||
              clerkUser?.lastName?.toUpperCase() ||
              clerkUser?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
        <div className="flex flex-row justify-center gap-2">
          <Button
            variant="ghost"
            className="flex  items-center gap-2"
            onClick={() => (window.location.href = "/settings")}
            disabled
          >
            <Settings />
            <div className="text-sm font-semibold text-muted-foreground">
              Setting
            </div>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => (window.location.href = "/profile")}
              disabled
            >
              <User />
              <div className="text-sm font-semibold text-muted-foreground">
                Profile
              </div>
            </Button>
          </div>
        </div>

        <SignOutButton redirectUrl="/login">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 cursor-pointer"
          >
            <LogOut /> Logout
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
