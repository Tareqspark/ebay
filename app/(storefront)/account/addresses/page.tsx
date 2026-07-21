import type { Metadata } from "next";
import { AccountTabs } from "@/components/account/account-tabs";
import { AddressBook } from "@/components/account/address-book";
import { getAddressesForCurrentUser } from "@/lib/address-actions";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AccountAddressesPage() {
  const addresses = await getAddressesForCurrentUser();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
      </div>
      <AccountTabs />
      <AddressBook addresses={addresses} />
    </div>
  );
}
