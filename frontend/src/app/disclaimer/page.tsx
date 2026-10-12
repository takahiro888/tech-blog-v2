import type { Metadata } from "next";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getDisclaimer } from "@/external/microcms/disclaimer";
import { RichText } from "@/shared/components/RichText";
import { PageTitle } from "@/shared/components/PageTitle";

export const metadata: Metadata = {
  title: "免責事項",
  description:
    "KAIZEN 技術ブログに掲載している情報の正確性や、リンク先・著作権の扱いについて。",
};

export default async function DisclaimerPage() {
  const disclaimer = await getDisclaimer();
  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "免責事項" }]}
      />
      <SidebarLayout>
        <PageTitle>免責事項</PageTitle>
        <RichText html={disclaimer.content} />
      </SidebarLayout>
    </>
  );
}
