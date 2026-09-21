import Image from "next/image";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import type { Recipe } from "@/lib/recipes/types";
import { recipePhotoUrl } from "@/lib/supabase/client";

export function RecipeGridCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-[var(--surface-2)]">
        {recipe.photo_path ? (
          <Image
            src={recipePhotoUrl(recipe.photo_path)}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-tertiary)]">
            <ChefHat size={28} strokeWidth={1.6} />
          </div>
        )}
      </div>
      <div className="pt-3">
        <p className="font-display text-[19px] font-normal leading-snug transition-colors group-hover:text-[var(--accent-recipes)]">
          {recipe.title}
        </p>
        {recipe.tags.length > 0 && (
          <p className="mt-1 truncate text-[14px] text-[var(--text-secondary)]">
            {recipe.tags.slice(0, 3).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
