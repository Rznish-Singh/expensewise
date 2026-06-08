import { getCategoryMeta } from "@/lib/utils";
import { type ExpenseCategory } from "@/types";

interface CategoryTagProps {
  category: ExpenseCategory;
  showEmoji?: boolean;
}

export function CategoryTag({ category, showEmoji = true }: CategoryTagProps) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: meta.bgColor, color: meta.textColor }}
    >
      {showEmoji && <span>{meta.emoji}</span>}
      {meta.label.split(" ")[0]}
    </span>
  );
}
