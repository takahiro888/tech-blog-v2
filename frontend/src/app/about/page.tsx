import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";

export default function AboutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "「天才ブログ」について" }]} />
      <SidebarLayout>
        <h1 className="text-2xl font-bold">「天才ブログ」について</h1>
      </SidebarLayout>
    </>
  );
}
