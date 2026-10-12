import type { Metadata } from "next";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getPrivacyPolicy } from "@/external/microcms/privacy-policy";
import { RichText } from "@/shared/components/RichText";
import { PageTitle } from "@/shared/components/PageTitle";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "KAIZEN 技術ブログにおける個人情報とアクセス解析の取り扱いについて。",
};

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
