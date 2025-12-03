import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveRecipe = mutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    prepTime: v.optional(v.string()),
    cookTime: v.optional(v.string()),
    servings: v.optional(v.string()),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    nutrition: v.optional(v.object({
      calories: v.optional(v.string()),
      protein: v.optional(v.string()),
      fat: v.optional(v.string()),
      carbs: v.optional(v.string()),
    })),
    tips: v.optional(v.string()),
    generationMeta: v.optional(v.object({
      provider: v.string(),
      model: v.optional(v.string()),
      language: v.optional(v.string()),
    })),
    imageUri: v.optional(v.string()),
    warning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("recipes", {
      userId: user._id,
      clerkId: args.clerkId,
      title: args.title,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      servings: args.servings,
      ingredients: args.ingredients,
      steps: args.steps,
      nutrition: args.nutrition,
      tips: args.tips,
      generationMeta: args.generationMeta,
      imageUri: args.imageUri,
      warning: args.warning,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserRecipes = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .collect();
  },
});

export const getRecipe = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteRecipe = mutation({
  args: { id: v.id("recipes"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe || recipe.clerkId !== args.clerkId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("recipes"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe || recipe.clerkId !== args.clerkId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, {
      isFavorite: !recipe.isFavorite,
      updatedAt: Date.now(),
    });
  },
});
