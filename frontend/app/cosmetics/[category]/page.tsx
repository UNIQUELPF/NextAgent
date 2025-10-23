import { notFound } from "next/navigation";

import {
  DISINFECTANT_CONFIG,
  DISINFECTANT_LIST,
  type DisinfectantSlug,
} from "../config";
import { DisinfectantDashboard } from "@/components/cosmetics/disinfectant-dashboard";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function DisinfectantCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category)) {
    notFound();
  }

  const config = DISINFECTANT_CONFIG[category];
  return <DisinfectantDashboard config={config} />;
}

function isCategory(value: string): value is DisinfectantSlug {
  return DISINFECTANT_LIST.some((item) => item.slug === value);
}
