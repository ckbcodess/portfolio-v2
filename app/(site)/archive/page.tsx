import { Metadata } from "next";
import { getArchiveRows } from "@/lib/content";
import ArchiveClient from "@/components/ArchiveClient";

export const metadata: Metadata = {
  title: "Archive - Ransford Gyasi",
  description: "Some of my work. A visual archive of products, experiments, and engineering projects.",
};

export default async function ArchivePage() {
  const archiveRows = await getArchiveRows();

  return (
    <div className="bg-background min-h-screen w-full flex flex-col items-center">
      <ArchiveClient rows={archiveRows} />
    </div>
  );
}
