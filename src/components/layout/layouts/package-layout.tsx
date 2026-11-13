'use client';

import React from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui';
import type { LayoutProps } from '@/types';
import { PackageSidebar } from '../side/package.sidebar';

const PackageLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-full w-full">
            <SidebarProvider
                style={
                    {
                        '--sidebar-width': '16rem',
                    } as React.CSSProperties
                }
            >
                <PackageSidebar className="left-16" />
                <SidebarInset>
                    <main className="flex-1 mb-16 pt-16 bg-gray-50">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
};

export default PackageLayout;
