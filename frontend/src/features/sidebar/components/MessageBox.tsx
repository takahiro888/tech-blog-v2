import { SIDEBAR_MESSAGE } from "@/shared/lib/constants";

export function MessageBox() {
  return (
    <section className="rounded-lg border border-base-300 p-6 text-center text-sm italic text-base-content/60">
      &ldquo;{SIDEBAR_MESSAGE}&rdquo;
    </section>
  );
}
