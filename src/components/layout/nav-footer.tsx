'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';
import { ComponentsIcons } from '@/assets';
import { useAuthStore } from '@/store';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';

export function NavProfile() {
  const { isMobile } = useSidebar();
  const { logout } = useAuthStore();
  const { data: user, isLoading } = useCurrentUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-secondary-700  data-[state=open]:text-white"
            >
              {isLoading ? (
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
              ) : (
                <>
                  <div className="grid flex-1 text-left data-[state=open]:text-white text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.first_name}
                    </span>
                    <span className="truncate text-xs ">{user?.email}</span>
                  </div>
                  <ComponentsIcons.ChevronsUpDown className="ml-auto size-4 " />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-white rounded-md space-x-2 space-y-2"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal flex items-center gap-4 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/imgs/logo_c.jpg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback>
                  <User className="h-4 w-4" href="/" />
                </AvatarFallback>
              </Avatar>
              {!isLoading && (
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-black">
                      {user?.first_name}
                    </span>
                    <span className="truncate text-xs text-gray-800">
                      {user?.email}
                    </span>
                  </div>
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="h bg-gray-100" />
            <DropdownMenuGroup>
              <Link href="/profile">
                <DropdownMenuItem className=" hover:text-main text-gray-800">
                  <ComponentsIcons.CircleUserRound />
                  Profile
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/update_password">
                <DropdownMenuItem className=" hover:text-main text-gray-800">
                  <ComponentsIcons.RectangleEllipsis />
                  Change password
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="h bg-gray-100 text-white" />

            <DropdownMenuItem onClick={logout} className="text-gray-800">
              <ComponentsIcons.LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
