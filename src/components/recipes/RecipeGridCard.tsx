import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/recipes/types";
import { recipePhotoUrl } from "@/lib/supabase/client";

export function RecipeGridCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
    >
      <div className="relative aspect-[4/3] w-full bg-white/10">
        {recipe.photo_path ? (
          <Image
            src={recipePhotoUrl(recipe.photo_path)}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/30">No photo</div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium">{recipe.title}</p>
        {recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
