import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: "success" | "warning" | "error" | "info";
  badge?: string;
  previewText?: string;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  onClick?: () => void;
}

interface ListViewProps {
  items: ListItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  compact?: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  selectedId,
  onSelect,
  onDelete,
  emptyMessage = "No items found",
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-3">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className={compact ? "p-2 space-y-1" : "p-3 space-y-2"}>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelect) onSelect(item.id);
                if (item.onClick) item.onClick();
              }}
              className={`group border rounded transition-all ${
                selectedId === item.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              } cursor-pointer`}
            >
              <div className={compact ? "p-2" : "p-3"}>
                {/* Title & Badge */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className={compact ? "text-xs font-semibold" : "text-sm font-semibold text-foreground"}>
                    {item.title}
                  </p>
                  {item.badge && (
                    <Badge variant="secondary" className={compact ? "text-[10px] p-0.5" : "text-xs"}>
                      {item.badge}
                    </Badge>
                  )}
                  {item.status && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "success"
                          ? "bg-green-500"
                          : item.status === "warning"
                            ? "bg-yellow-500"
                            : item.status === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                      }`}
                    />
                  )}
                </div>

                {/* Subtitle */}
                {item.subtitle && (
                  <p className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground mb-1`}>
                    {item.subtitle}
                  </p>
                )}

                {/* Preview Text */}
                {item.previewText && (
                  <p className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground line-clamp-2 mb-2`}>
                    {item.previewText}
                  </p>
                )}

                {/* Actions */}
                {(item.actions || onDelete) && (
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.actions?.map((action) => (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${compact ? "" : ""}`}
                        title={action.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                      >
                        {action.icon}
                      </Button>
                    ))}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
