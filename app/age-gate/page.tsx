import { Suspense } from "react";
import { AgeGateForm } from "@/components/AgeGateForm";

export default function AgeGatePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Suspense fallback={null}>
        <AgeGateForm />
      </Suspense>
    </main>
  );
}
