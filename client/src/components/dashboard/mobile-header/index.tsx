import { SidebarTrigger } from "@/components/ui/sidebar";
import MonkeyIcon from "@/components/icons/monkey";

export function MobileHeader() {
  return (
    <div className="lg:hidden h-header-mobile sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Sidebar Menu */}
        <SidebarTrigger />

        {/* Center: Monkey Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-primary rounded flex items-center justify-center">
              <MonkeyIcon className="size-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Right: Placeholder for future features */}
        <div className="w-10"></div>
      </div>
    </div>
  );
}
