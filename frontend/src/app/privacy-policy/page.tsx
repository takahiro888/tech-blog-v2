import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getPrivacyPolicy } from "@/external/microcms/privacy-policy";
import { RichText } from "@/shared/components/RichText";
import { PageTitle } from "@/shared/components/PageTitle";

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
        <PageTitle>プライバシーポリシー</PageTitle>
        <RichText html={privacyPolicy.content} /> 
      </SidebarLayout>
    </>
  );
}
