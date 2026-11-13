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

export function BillingSidebar({
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
        href="/billing"
      />

      <SidebarContent className="gap-0">
        <NavSingleData items={adminData.navPlans} title="Plan" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
        <NavSingleData items={adminData.navQuotes} title="Quotes" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
        <NavSingleData items={adminData.navInvoices} title="Invoices" />
        <Separator className="mx-2 my-2 h-px bg-gray-200" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
