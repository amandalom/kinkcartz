import { getPaymentSettings } from "@/lib/payment-settings";
import { updatePaymentSettings } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getPaymentSettings();

  const field =
    "w-full rounded-lg border border-white/10 bg-surface2 px-4 py-3 text-sm text-white placeholder:text-zinc-500";
  const label = "text-xs uppercase tracking-wide text-zinc-500";

  return (
    <div>
      <h1 className="font-display text-2xl text-white">Payment settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Customers pick one of these at checkout. Bitcoin&apos;s address shows immediately; the
        others are revealed to the customer via the magic link emailed after they place an order.
      </p>

      <form action={updatePaymentSettings} className="mt-8 max-w-2xl space-y-8">
        <fieldset className="space-y-3 rounded-xl border border-white/10 p-5">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="bitcoinEnabled" defaultChecked={settings.bitcoinEnabled} />
            Bitcoin
          </label>
          <div className="space-y-1.5">
            <label className={label}>Bitcoin address</label>
            <input
              name="bitcoinAddress"
              placeholder="bc1q..."
              defaultValue={settings.bitcoinAddress ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-white/10 p-5">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="cashappEnabled" defaultChecked={settings.cashappEnabled} />
            Cash App
          </label>
          <div className="space-y-1.5">
            <label className={label}>Cashtag</label>
            <input
              name="cashappHandle"
              placeholder="$yourcashtag"
              defaultValue={settings.cashappHandle ?? ""}
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Account name shown on Cash App</label>
            <input
              name="cashappAccountName"
              placeholder="Name on the account"
              defaultValue={settings.cashappAccountName ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-white/10 p-5">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="paypalEnabled" defaultChecked={settings.paypalEnabled} />
            PayPal
          </label>
          <div className="space-y-1.5">
            <label className={label}>PayPal.me link or email</label>
            <input
              name="paypalHandle"
              placeholder="paypal.me/yourhandle"
              defaultValue={settings.paypalHandle ?? ""}
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Account name shown on PayPal</label>
            <input
              name="paypalAccountName"
              placeholder="Name on the account"
              defaultValue={settings.paypalAccountName ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-white/10 p-5">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="venmoEnabled" defaultChecked={settings.venmoEnabled} />
            Venmo
          </label>
          <div className="space-y-1.5">
            <label className={label}>Venmo handle</label>
            <input
              name="venmoHandle"
              placeholder="@yourhandle"
              defaultValue={settings.venmoHandle ?? ""}
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Account name shown on Venmo</label>
            <input
              name="venmoAccountName"
              placeholder="Name on the account"
              defaultValue={settings.venmoAccountName ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-white/10 p-5">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="zelleEnabled" defaultChecked={settings.zelleEnabled} />
            Zelle
          </label>
          <div className="space-y-1.5">
            <label className={label}>Zelle email or phone</label>
            <input
              name="zelleHandle"
              placeholder="you@example.com"
              defaultValue={settings.zelleHandle ?? ""}
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Account name shown on Zelle</label>
            <input
              name="zelleAccountName"
              placeholder="Name on the account"
              defaultValue={settings.zelleAccountName ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90"
        >
          Save payment settings
        </button>
      </form>
    </div>
  );
}
