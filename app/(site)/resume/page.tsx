import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResume } from "@/lib/content";
import ResumeClient from "@/components/ResumeClient";

export async function generateMetadata(): Promise<Metadata> {
  const resume = await getResume();
  return {
    title: "Resume - Ransford Gyasi",
    description: resume?.summary,
  };
}

export default async function ResumePage() {
  const resume = await getResume();

  if (!resume) {
    notFound();
  }

  return <ResumeClient resume={resume} />;
}
