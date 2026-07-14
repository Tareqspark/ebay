import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function MainHeader() {
  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
        <MobileNav />

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="hidden text-xl font-bold tracking-tight text-foreground sm:inline">
            Meridian
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
                    <span className="text-[11px] text-muted-foreground">Hello, sign in</span>
                    <span className="text-xs font-semibold">Account</span>
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/account">Sign In</Link>} />
              <DropdownMenuItem render={<Link href="/account/orders">Orders</Link>} />
              <DropdownMenuItem render={<Link href="/account/wishlist">Wishlist</Link>} />
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
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  0
                </span>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
