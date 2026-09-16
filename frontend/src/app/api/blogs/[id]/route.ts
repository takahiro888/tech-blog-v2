import { getBlogDetail } from "@/external/microcms/blogs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const blog = await getBlogDetail(id);
    return Response.json(blog);
  } catch {
    return Response.json({ message: "記事が見つかりません" }, { status: 404 });
  }
}
