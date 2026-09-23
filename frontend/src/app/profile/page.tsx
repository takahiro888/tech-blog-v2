import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";

export default function ProfilePage() {
  return (
    <>
    <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "プロフィール" }]} />
    <SidebarLayout>
      <h1 className="text-2xl font-bold">プロフィール</h1>
    </SidebarLayout>
    </>
  );
}
