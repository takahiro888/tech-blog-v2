import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getPrivacyPolicy } from "@/external/microcms/privacy-policy";
import { RichText } from "@/shared/components/RichText";

export default async function PrivacyPolicyPage() {
  const privacyPolicy = await getPrivacyPolicy();
  return (
    <>
      <Breadcrumb
        items={[
          { label: "HOME", href: "/" },
          { label: "プライバシーポリシー" },
        ]}
      />
      <SidebarLayout>
        <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
        <RichText html={privacyPolicy.content} /> 
      </SidebarLayout>
    </>
  );
}
