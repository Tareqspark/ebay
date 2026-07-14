import { TopBar } from "@/components/layout/top-bar";
import { MainHeader } from "@/components/layout/main-header";
import { NavMegaMenu } from "@/components/layout/nav-mega-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 shadow-sm">
      <TopBar />
      <MainHeader />
      <NavMegaMenu />
    </header>
  );
}
