import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getDisclaimer } from "@/external/microcms/disclaimer";

export default async function DisclaimerPage() {
  const disclaimer = await getDisclaimer();
  return (
    <>
      <Breadcrumb
        items={[
          { label: "HOME", href: "/" },
          { label: "免責事項" },
        ]}
      />
      <SidebarLayout>
        <h1 className="text-2xl font-bold">免責事項</h1>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: disclaimer.content }}
        />
      </SidebarLayout>
    </>
  );
}
