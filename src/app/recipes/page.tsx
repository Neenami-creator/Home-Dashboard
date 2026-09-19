import { PanelShell } from "@/components/PanelShell";

export default function RecipesPage() {
  return (
    <PanelShell title="Recipes" accent="#ff8a5c">
      <p className="text-white/50">
        A gallery of recipe cards backed by the shared Wardrobe Edit Supabase project, plus a
        passcode-protected upload page, is coming last.
      </p>
    </PanelShell>
  );
}
