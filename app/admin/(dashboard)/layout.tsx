import { AdminNav } from "@/components/AdminNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pendingOrderCount = await prisma.order.count({ where: { status: "pending_payment" } });

  return (
    <div>
      <AdminNav pendingOrderCount={pendingOrderCount} />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
