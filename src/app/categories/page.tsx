import { CategoriesBrowser } from "@/components/categories-browser";
import { PageHeader } from "@/components/page-header";

export default function CategoriesPage() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader
        eyebrow="Categories"
        title="Browse the OmniTools catalog"
        description="Start with a category, then drill into focused tool groups."
      />
      <CategoriesBrowser />
    </div>
  );
}
