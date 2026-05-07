import {
  Award,
  BarChart3,
  FileText,
  FolderOpen,
  MousePointerClick,
  Search,
  Share2,
  ShoppingCart,
  Video,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  MousePointerClick,
  FileText,
  Share2,
  ShoppingCart,
  BarChart3,
  Award,
  Video,
};

export function getIcon(
  name?: string,
): React.ComponentType<{ className?: string }> {
  if (name && iconMap[name]) return iconMap[name];
  return FolderOpen;
}
