"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex bg-main h-screen w-full flex-col items-center justify-center gap-8 px-4">
      <div className="flex items-center gap-1">
        <span className="select-none text-[96px] font-medium leading-none tracking-tighter text-border">
          4
        </span>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <LockKeyhole className="h-7 w-7 text-primary" />
        </div>
        <span className="select-none text-[96px] font-medium leading-none tracking-tighter text-border">
          3
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 text-center text-white">
        <h1 className="text-xl font-medium">Access Restricted</h1>
        <p className="max-w-sm text-sm text-primary-50 leading-relaxed">
          You don&apos;t have permission to view this page. If you believe this
          is a mistake, please reach out to your administrator.
        </p>
      </div>

      <div className="flex gap-2.5">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="text-white"
        >
          Go back
        </Button>
        <Button
          onClick={() => router.push("/")}
          className="border border-white"
        >
          Back to home
        </Button>
      </div>

      <p className="text-xs text-gray-50">Error code 403 — Forbidden</p>
    </div>
  );
}
