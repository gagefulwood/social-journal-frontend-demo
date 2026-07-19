import { redirect } from "next/navigation";

export default function LegacyNewExercisePage() {
  redirect("/journals?new=1");
}
