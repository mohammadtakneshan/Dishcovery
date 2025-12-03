import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.object({
      provider: v.string(),
      model: v.string(),
      language: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  recipes: defineTable({
    userId: v.id("users"),
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
    isFavorite: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_favorites", ["userId", "isFavorite"]),
});
