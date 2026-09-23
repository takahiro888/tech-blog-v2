"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PAGE_SIZE_OPTIONS } from "../lib/filter-articles";

export function PageSizeSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", event.target.value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      表示件数
      <select
        className="select select-bordered select-sm"
        value={value}
        onChange={handleChange}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}件
          </option>
        ))}
      </select>
    </label>
  );
}
