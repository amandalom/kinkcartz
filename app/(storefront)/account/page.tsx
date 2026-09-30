import { Eyebrow } from "@/components/Eyebrow";
import { KeyIcon } from "@/components/icons";

export default function AccountPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center px-5 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
        <KeyIcon className="h-6 w-6" />
      </span>
      <Eyebrow className="mt-5">Members Only</Eyebrow>
      <h1 className="mt-1 font-display text-2xl text-white">The Sanctum</h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-400">
        Member accounts, order history, and saved pieces live here — not built yet. For now,
        every checkout is a guest checkout; your order confirmation is your only record, so keep
        it somewhere safe.
      </p>
    </main>
  );
}
