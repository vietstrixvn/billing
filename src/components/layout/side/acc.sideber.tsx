'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarHeaderCustom,
} from '../../ui/sidebar';
import { adminData } from '@/libs';
import { Separator } from '@/components/ui';

import { ComponentsIcons } from '@/assets';
import { NavSingleData } from '../nav/single.nav';

export function AccountingSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="top-16 h-[calc(100vh-4rem)]"
      style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}
      {...props}
    >
      <SidebarHeaderCustom
        title="Billing"
        logo={<ComponentsIcons.Shapes className="h-8 w-8 text-main shrink-0" />}
        href="/accounting"
      />

      <SidebarContent className="gap-0">
        <NavSingleData items={adminData.navJournal} title="Journal Entries" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
        <NavSingleData items={adminData.navReport} title="Reports" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
        <NavSingleData items={adminData.navExchange} title="Exchange Rates" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
        <NavSingleData items={adminData.navAccSetting} title="Settings" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
