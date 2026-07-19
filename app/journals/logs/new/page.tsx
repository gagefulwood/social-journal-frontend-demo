import { redirect } from "next/navigation";

export default function LegacyNewLogPage() {
  redirect("/journals?new=1");
}
