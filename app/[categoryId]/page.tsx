import { AppShell } from "@/components/app-shell";
import { categories, loadKeywords } from "@/lib/data-loader";

export async function generateStaticParams() {
  return categories.map((cat) => ({ categoryId: cat.id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const keywordsMap = await loadKeywords(categoryId);

  return (
    <AppShell
      keywordsMap={keywordsMap}
      initialViewMode="category"
      initialCategoryId={categoryId}
    />
  );
}
