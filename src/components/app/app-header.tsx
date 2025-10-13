"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/app/icons';
import { Separator } from '@/components/ui/separator';
import { Category, categories } from '@/lib/types';
import { Layers } from 'lucide-react';

interface AppSidebarProps {
  activeCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
}

export function AppSidebar({ activeCategory, onSelectCategory }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <AppLogo className="text-primary w-7 h-7" />
          <span className="text-lg font-semibold">VoRe-Docsphere</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSelectCategory('All')}
              isActive={activeCategory === 'All'}
              tooltip="All"
            >
              <Layers />
              <span>All Reminders</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator className="my-2" />
          {categories.map(({ name, icon: Icon }) => (
            <SidebarMenuItem key={name}>
              <SidebarMenuButton
                onClick={() => onSelectCategory(name)}
                isActive={activeCategory === name}
                tooltip={name}
              >
                <Icon />
                <span>{name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
