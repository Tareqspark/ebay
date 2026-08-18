import Link from "next/link";
import Image from "next/image";
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
import type { ClientCategory, CategoryTreeNode } from "@/lib/category-utils";

interface MainHeaderProps {
  session: Session | null;
  featuredCategories: ClientCategory[];
  allCategoriesForScope: { slug: string; name: string }[];
  mobileTree: CategoryTreeNode[];
}

export function MainHeader({
  session,
  featuredCategories,
  allCategoriesForScope,
  mobileTree,
}: MainHeaderProps) {
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
        <MobileNav tree={mobileTree} />

        <Link href="/" className="flex shrink-0 items-center" aria-label="Cartebay home">
          {/* The wordmark already contains "Cartebay", so no text label beside
              it. priority: it's above the fold on every page. */}
          <Image
            src="/logo-cartebay.png"
            alt="Cartebay"
            width={445}
            height={147}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <SearchBar
          className="mx-auto hidden flex-1 max-w-3xl sm:block"
          featuredCategories={featuredCategories}
          allCategories={allCategoriesForScope}
        />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:h-10 sm:w-auto sm:items-center sm:gap-2 sm:px-2"
                  nativeButton={false}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden flex-col items-start leading-tight sm:flex">
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
