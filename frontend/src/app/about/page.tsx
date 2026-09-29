import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import Image from "next/image";
import { getAbout } from "@/external/microcms/about";

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "このブログについて" }]}
      />
      <SidebarLayout>
        <h1 className="text-2xl font-bold">このブログについて</h1>
        {about.mainImage && (
          <Image
            src={about.mainImage.url}
            width={about.mainImage.width}
            height={about.mainImage.height}
            alt=""
            className="mb-8 w-full rounded-lg"
          />
        )}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: about.content }}
        />
      </SidebarLayout>
    </>
  );
}
