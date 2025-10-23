import { redirect } from "next/navigation";

export default function BarcodeIndex() {
  redirect("/barcodes/overview");
}
