import Image from "next/image";
import { getProfile } from "@/external/microcms/profile";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { RichText } from "@/shared/components/RichText";
import { PageTitle } from "@/shared/components/PageTitle";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "プロフィール" }]}
      />
      <SidebarLayout>
        <PageTitle>プロフィール</PageTitle>
        {profile.mainImage && (
          <Image
            src={profile.mainImage.url}
            width={profile.mainImage.width}
            height={profile.mainImage.height}
            alt=""
            className="mb-8 w-full rounded-lg"
          />
        )}
        <RichText html={profile.content} />
      </SidebarLayout>
    </>
  );
}
