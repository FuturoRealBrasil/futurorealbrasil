import { ReactNode } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const AppLayout = ({ children, hideMenu }: { children: ReactNode; hideMenu?: boolean }) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideMenu && (
        <div className="fixed top-4 right-4 z-50">
          <HamburgerMenu />
        </div>
      )}
      {children}
    </div>
  );
};

export default AppLayout;
