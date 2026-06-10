import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactOverviewErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ContactOverviewErrorState({
  message,
  onRetry,
}: ContactOverviewErrorStateProps) {
  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-4 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Unable to load recent moments</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
