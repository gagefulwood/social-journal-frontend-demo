"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { journalApi } from "@/lib/api/journalApi";
import type { ApiId } from "@/types/api";

export function DeleteReflectionAction({
  reflectionId,
}: {
  reflectionId: ApiId;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function deleteReflection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDeleting(true);
    try {
      await journalApi.removeReflection(reflectionId);
      toast.success("Reflection deleted");
      router.push("/journals");
      router.refresh();
    } catch {
      toast.error("The reflection could not be deleted. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2 className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this reflection?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the reflection and its journal links. Facts
            or observations already carried forward remain on their contacts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={(event) => void deleteReflection(event)}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleting ? "Deleting…" : "Delete reflection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
