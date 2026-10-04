import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { getDisclaimer } from "@/external/microcms/disclaimer";
import { RichText } from "@/shared/components/RichText";
import { PageTitle } from "@/shared/components/PageTitle";

export default async function DisclaimerPage() {
  const disclaimer = await getDisclaimer();
  return (
    <>
      <Breadcrumb
        items={[
          { label: "HOME", href: "/" },
          { label: "免責事項" },
        ]}
      />
      <SidebarLayout>
        <PageTitle>免責事項</PageTitle>
        <RichText html={disclaimer.content} /> 
      </SidebarLayout>
    </>
  );
}
