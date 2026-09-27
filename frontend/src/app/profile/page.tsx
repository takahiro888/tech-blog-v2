import Image from "next/image";
import { getProfile } from "@/external/microcms/profile";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "プロフィール" }]}
      />
      <SidebarLayout>
        <h1 className="mb-6 border-b border-base-300 pb-4 text-3xl font-bold">
          プロフィール
        </h1>
        {profile.mainImage && (
          <Image
            src={profile.mainImage.url}
            width={profile.mainImage.width}
            height={profile.mainImage.height}
            alt=""
            className="mb-8 w-full rounded-lg"
          />
        )}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: profile.content }}
        />
      </SidebarLayout>
    </>
  );
}
