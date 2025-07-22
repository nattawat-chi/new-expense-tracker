import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: { card: "shadow-lg rounded-xl" },
          variables: {
            colorPrimary: "#6c47ff",
          },
        }}
      />
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2">
        <ArrowLeft /> Back to landing page
      </Link>
    </div>
  );
}
