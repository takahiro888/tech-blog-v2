import type { Metadata } from "next";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import Image from "next/image";
import { RichText } from "@/shared/components/RichText";
import { getAbout } from "@/external/microcms/about";
import { PageTitle } from "@/shared/components/PageTitle";

export const metadata: Metadata = {
  title: "このブログについて",
  description:
    "KAIZEN 技術ブログのコンセプトと、扱っているテーマを紹介します。",
};

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "このブログについて" }]}
      />
      <SidebarLayout>
        <PageTitle>このブログについて</PageTitle>
        {about.mainImage && (
          <Image
            src={about.mainImage.url}
            width={about.mainImage.width}
            height={about.mainImage.height}
            alt=""
            className="mb-8 w-full rounded-lg"
          />
        )}
        <RichText html={about.content} />
      </SidebarLayout>
    </>
  );
}
