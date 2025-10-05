
import "./global.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
          <SidebarProvider>
            {/* Mobile Header - only visible on mobile */}
            <MobileHeader />

            {/* Desktop Layout */}
            <div className="w-full flex">
              {/* Sidebar */}
           
             <div className="hidden lg:block flex-shrink-0">
                <DashboardSidebar />
              </div>
              

              {/* Main content */}
              <div className="flex-1">{children}</div>

              {/* Right column */}
        {/*<div className="hidden mx-4 lg:block flex-shrink-0 w-[320px]">
                <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
                  <Widget widgetData={mockData.widgetData} />
                  <Notifications
                    initialNotifications={mockData.notifications}
                  />
                  <Chat />
                </div>
              </div>*/}
            </div>

            {/* Mobile Chat - floating CTA with drawer */}
            {/*<MobileChat />*/}
          </SidebarProvider>
  );
}
