import { redirect } from "next/navigation";

export default function LegacyNewReflectionPage() {
  redirect("/journals?new=1");
}
