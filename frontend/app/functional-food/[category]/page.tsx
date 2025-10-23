import { notFound } from "next/navigation";

import {
  FOOD_CATEGORY_CONFIG,
  FOOD_CATEGORY_LIST,
  type FoodCategorySlug,
} from "../categories";
import { FunctionalFoodDashboard } from "@/components/functional-food/dashboard";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function FunctionalFoodCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category)) {
    notFound();
  }

  const config = FOOD_CATEGORY_CONFIG[category];
  return <FunctionalFoodDashboard config={config} />;
}

function isCategory(value: string): value is FoodCategorySlug {
  return FOOD_CATEGORY_LIST.some((item) => item.slug === value);
}
