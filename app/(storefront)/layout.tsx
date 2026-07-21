import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </CartProvider>
  );
}
