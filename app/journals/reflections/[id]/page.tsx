"use client";

import { useParams } from "next/navigation";

import { ReflectionDetailView } from "@/components/journals/reflections/ReflectionDetailView";

export default function ReflectionDetailPage() {
  const params = useParams<{ id: string }>();
  return <ReflectionDetailView reflectionId={params.id} />;
}
