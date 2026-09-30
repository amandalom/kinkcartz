import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="pb-24">{children}</div>
      <CartDrawer />
      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
        <p>18+ only. Discreet packaging & billing on every order.</p>
        <p className="mt-1">© {new Date().getFullYear()} kinkcartz</p>
      </footer>
      <BottomNav />
    </>
  );
}
