import { Button } from "@/components/ui";
import {
  HomeIcon,
  FileText,
  Clock,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export function DashboardSidebar({ clerkUser }: { clerkUser: any }) {
  return (
    <aside className="w-64 flex flex-col py-8 px-4 gap-4 bg-background border-r shadow-sm">
      <div
        onClick={() => (window.location.href = "/")}
        className="mb-8 text-2xl font-bold tracking-tight text-foreground cursor-pointer"
      >
        ระบบจัดการรายรับ-รายจ่าย
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start text-foreground"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <HomeIcon /> หน้าหลัก
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start text-foreground/70"
          disabled
        >
          <FileText /> รายงาน
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start text-foreground/70"
          disabled
        >
          <Clock /> ประวัติ
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start text-foreground/70"
          disabled
        >
          <User /> โปรไฟล์
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start text-foreground/70"
          disabled
        >
          <Settings /> ตั้งค่า
        </Button>
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          {clerkUser?.fullName ||
            clerkUser?.primaryEmailAddress?.emailAddress ||
            "-"}
        </div>
        <SignOutButton redirectUrl="/login">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <LogOut /> ออกจากระบบ
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
