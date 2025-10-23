import { notFound } from "next/navigation";

import { BARCODE_CONFIG } from "../config";
import { BarcodeDashboard } from "@/components/barcodes/dashboard";

type Props = {
  params: Promise<{ process: string }>;
};

export default async function BarcodeProcessPage({ params }: Props) {
  const { process } = await params;
  if (process !== "overview") {
    notFound();
  }

  return <BarcodeDashboard config={BARCODE_CONFIG} />;
}
