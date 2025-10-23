import { notFound } from "next/navigation";

import {
  PROCESS_CONFIG,
  PROCESS_LIST,
  type ProcessSlug,
} from "../config";
import { ProcessDashboard } from "@/components/ip-services/process-dashboard";

type Props = {
  params: Promise<{ process: string }>;
};

export default async function ProcessPage({ params }: Props) {
  const { process } = await params;
  if (!isProcessSlug(process)) {
    notFound();
  }

  const config = PROCESS_CONFIG[process];
  return <ProcessDashboard config={config} />;
}

function isProcessSlug(value: string): value is ProcessSlug {
  return PROCESS_LIST.some((item) => item.slug === value);
}
