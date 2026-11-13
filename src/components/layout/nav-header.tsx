"use client";

import { Search, User, ChevronDown } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { ComponentsIcons, Icons } from "@/assets";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { UserAvatar } from "@/components/customs/avatar.custom";

export default function TopNavAdmin() {
  const { logout } = useAuthStore();
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between h-full px-4 lg:px-6">
      <div className="flex items-center space-x-4 w-full max-w-md">
      </div>

      <div className="flex items-center space-x-2">
        {/* Mobile Search */}
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Search className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 p-2"
                disabled={isLoading}
              >
                <div className="text-right">
                  <span className="font-bold text-sm block">
                    {isLoading
                      ? "Loading..."
                      : `${user?.first_name || ""} ${user?.last_name || ""}`}
                  </span>
                  <Badge className="bg-green-200 text-green-600 text-xs">
                    {user?.roles?.[0] || "user"}
                  </Badge>
                </div>
                <UserAvatar url={user?.avatar_url || "/icons/logo.svg"} />
                <ChevronDown className="hidden lg:block h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-md border-none space-y-2 p-4"
            >
              <DropdownMenuLabel className="text-black">
                My Account
              </DropdownMenuLabel>
              {/* <DropdownMenuSeparator className="h bg-gray-400 " />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="hover:text-main h-8 text-gray-800"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem> */}
              <DropdownMenuSeparator className="h bg-gray-400" />
              <DropdownMenuItem
                className="hover:bg-main-100 hover:text-main   h-8 text-center text-gray-800"
                onClick={logout}
              >
                <Icons.LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
