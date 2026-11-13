'use client';

import { type LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui';
import { Collapsible, CollapsibleTrigger } from '@/components/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavSingleData({
  items,
  title,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  title?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className="text-sm text-main mb-2">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url + '/');

          return (
            <Collapsible key={item.title} asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="rounded-md"
                      isActive={isActive}
                    >
                      {item.icon && <item.icon />}
                      {item.title}
                    </SidebarMenuButton>
                  </Link>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
