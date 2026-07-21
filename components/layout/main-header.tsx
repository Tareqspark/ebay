import Link from "next/link";
import type { Session } from "next-auth";
import { Heart, ShoppingBag, User } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartBadge } from "@/components/cart/cart-badge";
import { SignOutItem } from "@/components/layout/sign-out-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function MainHeader({ session }: { session: Session | null }) {
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
        <MobileNav />

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="hidden text-xl font-bold tracking-tight text-foreground sm:inline">
            Baruashop
          </span>
        </Link>

        <SearchBar className="mx-auto max-w-3xl flex-1" />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="hidden h-10 items-center gap-2 px-2 sm:flex">
                  <User className="h-5 w-5" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] text-muted-foreground">
                      {session ? `Hello, ${firstName}` : "Hello, sign in"}
                    </span>
                    <span className="text-xs font-semibold">Account</span>
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {session ? (
                <>
                  <DropdownMenuItem render={<Link href="/account">Account Overview</Link>} />
                  <DropdownMenuItem render={<Link href="/account/orders">Orders</Link>} />
                  <DropdownMenuItem render={<Link href="/account/addresses">Addresses</Link>} />
                  <DropdownMenuItem render={<Link href="/account/wishlist">Wishlist</Link>} />
                  <DropdownMenuSeparator />
                  <SignOutItem />
                </>
              ) : (
                <>
                  <DropdownMenuItem render={<Link href="/account/sign-in">Sign In</Link>} />
                  <DropdownMenuItem render={<Link href="/account/sign-up">Create Account</Link>} />
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/help">Help Center</Link>} />
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={
              <Link href="/account/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            nativeButton={false}
            render={
              <Link href="/cart" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
