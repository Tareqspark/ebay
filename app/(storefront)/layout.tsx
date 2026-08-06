import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { BannerSlot } from "@/components/storefront/banner-slot";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        {/* Above the sticky header on purpose — a promo strip pinned to the
            viewport would permanently eat vertical space on every page. */}
        <BannerSlot placement="top-bar" />
        <Header session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </CartProvider>
  );
}
