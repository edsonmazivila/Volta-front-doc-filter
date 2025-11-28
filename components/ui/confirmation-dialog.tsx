import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const { i18n } = useLingui();
  const defaultConfirmText = i18n._(msg`Confirm`);
  const defaultCancelText = i18n._(msg`Cancel`);
  const processingText = i18n._(msg`Processing...`);

  const getButtonStyles = () => {
    if (variant === "destructive") {
      return "bg-red-500 hover:bg-red-600";
    }
    return "bg-primary hover:bg-primary/90";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {cancelText ?? defaultCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={getButtonStyles()}
            disabled={isLoading}
          >
            {isLoading ? processingText : (confirmText ?? defaultConfirmText)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
