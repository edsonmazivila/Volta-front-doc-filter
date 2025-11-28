"use client";
import type { DocumentListItem } from "@/lib/services/documents";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface DocumentCardProps {
  document: DocumentListItem;
  onEdit?: (document: DocumentListItem) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function DocumentCard({
  document,
  onEdit,
  onDelete,
  onView,
}: DocumentCardProps) {
  const { i18n } = useLingui();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "uploaded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  const formattedDate = document.createdAt
    ? format(parseISO(document.createdAt), "MMM d, yyyy")
    : i18n._(msg`Unknown date`);

  const displayType = document.type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground truncate mb-1">
            {document.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{displayType}</p>

          <div className="flex items-center gap-2 mb-3">
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>

          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(document.id)}
                className="flex-1"
                title={i18n._(msg`View document`)}
              >
                <Eye className="h-3 w-3 mr-1" />
                {i18n._(msg`View`)}
              </Button>
            )}
            {onEdit && document.canEdit !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(document)}
                className="flex-1"
                title={i18n._(msg`Edit document`)}
              >
                <Edit className="h-3 w-3 mr-1" />
                {i18n._(msg`Edit`)}
              </Button>
            )}
            {onDelete && document.canEdit !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title={i18n._(msg`Delete document`)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
