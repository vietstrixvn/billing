'use client';

import * as React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarRail,
    SidebarHeaderCustom,
    SidebarHeader,
} from '../../ui/sidebar';
import { adminData } from '@/libs';
import { Separator } from '@/components/ui';

import { ComponentsIcons } from '@/assets';
import { NavSingleData } from '../nav/single.nav';

export function MainSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            collapsible="icon"
            {...props}
        >
            <SidebarHeader />

            <SidebarContent className="gap-0">
                <NavSingleData items={adminData.navServiceItem} title="Service" />
                <Separator className="mx-2 my-2 h-px bg-gray-200" />
                <NavSingleData
                    items={adminData.navSubscriptions}
                    title="Subscriptions"
                />
                <Separator className="mx-2 my-2 h-px bg-gray-200" />
                <NavSingleData items={adminData.navPlans} title="Plan" />
                <Separator className="mx-2 my-2 h-px bg-gray-200" />
                <NavSingleData items={adminData.navQuotes} title="Quotes" />
                <Separator className="mx-2 my-2 h-px bg-gray-200" />
                <NavSingleData items={adminData.navInvoices} title="Invoices" />
                <Separator className="mx-2 my-2 h-px bg-gray-200" />
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
