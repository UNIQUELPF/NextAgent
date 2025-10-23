import { notFound } from "next/navigation";

import {
  CATEGORY_CONFIG,
  CATEGORY_LIST,
  type CategorySlug,
} from "../categories";
import { CategoryDashboard } from "@/components/copyright/category-dashboard";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!category || !isCategorySlug(category)) {
    notFound();
  }

  const config = CATEGORY_CONFIG[category];
  return <CategoryDashboard config={config} />;
}

function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_LIST.some((item) => item.slug === value);
}
