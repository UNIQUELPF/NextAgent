import { notFound } from "next/navigation";

import {
  SECTOR_CONFIG,
  SECTOR_LIST,
  type SectorSlug,
} from "../categories";
import { SectorDashboard } from "@/components/executive-standards/sector-dashboard";

type Props = {
  params: Promise<{ sector: string }>;
};

export default async function SectorPage({ params }: Props) {
  const { sector } = await params;
  if (!isSectorSlug(sector)) {
    notFound();
  }

  const config = SECTOR_CONFIG[sector];
  return <SectorDashboard config={config} />;
}

function isSectorSlug(value: string): value is SectorSlug {
  return SECTOR_LIST.some((item) => item.slug === value);
}
