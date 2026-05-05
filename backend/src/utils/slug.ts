// ============================================================
// FILE: backend/src/utils/slug.ts
// PURPOSE: A pure utility module for generating URL-safe slugs.
// ============================================================

// WHY import getPrisma here?
//
// Every single route in posts.ts does this:
//   const prisma = getPrisma(c.env);
//
// So the exact TypeScript type of 'prisma' throughout this codebase is:
//   ReturnType<typeof getPrisma>
//
// Our generateUniqueSlug function receives that same 'prisma' object.
// If we annotate it with anything else (PrismaClient, MinimalPrismaClient,
// or 'any'), we either get a TypeScript error or lose type safety entirely.
//
// ReturnType<typeof getPrisma> means: "whatever type getPrisma() returns,
// use THAT — don't define it separately." This is always in sync with the
// actual implementation, no matter how getPrisma changes in the future.
import { getPrisma } from "../db/prisma";
type PrismaClientEdge = ReturnType<typeof getPrisma>;


// ------------------------------------------------------------
// FUNCTION 1: generateSlug(title)
// ------------------------------------------------------------
// This is the core algorithm. It converts any title string into
// a clean, URL-safe slug using a chain of string transformations.
//
// Example:
//   Input:  "Hello, World! (My First Post)"
//   Output: "hello-world-my-first-post"
// ------------------------------------------------------------
export function generateSlug(title: string): string {
  return (
    title
      // Step 1: Lowercase everything.
      // "Hello World" → "hello world"
      // URLs are case-sensitive — a consistent lowercase standard
      // prevents duplicate slugs for the same title in different cases.
      .toLowerCase()

      // Step 2: Replace any sequence of non-alphanumeric characters with a hyphen.
      // The regex /[^a-z0-9]+/g means:
      //   [^a-z0-9] = any character that is NOT a letter or digit
      //   +          = one or more of them in a row (collapse them into ONE hyphen)
      //   g          = global flag — apply this to EVERY match, not just the first
      // "hello, world! (post)" → "hello-world-post-"
      .replace(/[^a-z0-9]+/g, "-")

      // Step 3: Trim any leading or trailing hyphens.
      // The regex /^-+|-+$/g means:
      //   ^-+  = one or more hyphens at the START of the string
      //   |    = OR
      //   -+$  = one or more hyphens at the END of the string
      // "hello-world-post-" → "hello-world-post"
      .replace(/^-+|-+$/g, "")
  );
}

// ------------------------------------------------------------
// FUNCTION 2: generateUniqueSlug(title, prisma)
// ------------------------------------------------------------
// Problem: Two posts can have the same title, so generateSlug()
// alone can produce DUPLICATE slugs. Our DB has `slug @unique`,
// so a duplicate would crash the insert with a DB constraint error.
//
// This function wraps generateSlug() and adds a uniqueness check
// by querying the DB in a loop until it finds a free slug.
//
// Example — if "my-post" already exists:
//   Attempt 1: "my-post"   → found in DB → try next
//   Attempt 2: "my-post-1" → found in DB → try next
//   Attempt 3: "my-post-2" → NOT found   → use this!
//
// Parameters:
//   title  — the raw post title from the user
//   prisma — we need the DB client to check for existing slugs
// ------------------------------------------------------------
export async function generateUniqueSlug(
  title: string,
  // PrismaClientEdge = ReturnType<typeof getPrisma>
  // This is the EXACT same type as 'prisma' in every route.
  // e.g., in posts.ts: const prisma = getPrisma(c.env) → same type.
  prisma: PrismaClientEdge
): Promise<string> {
  // Step 1: Generate the base slug from the title.
  // e.g., "My Post" → "my-post"
  const baseSlug = generateSlug(title);

  // Step 2: Start our first attempt with the base slug itself (no suffix).
  let candidateSlug = baseSlug;

  // Step 3: 'suffix' is the number we append when the slug is taken.
  // It starts at 1 and counts up: "my-post-1", "my-post-2", etc.
  let suffix = 1;

  // Step 4: Loop until we find a slug that doesn't exist in the DB.
  // This is a "do-while" style loop via a while(true) + break pattern.
  while (true) {
    // Query the DB: does any post already have this exact slug?
    const existing = await prisma.post.findUnique({
      where: { slug: candidateSlug },
      // We only need to know IF it exists, not its data.
      // 'select: { id: true }' fetches only the id column — minimal DB work.
      select: { id: true },
    });

    // If 'existing' is null, no post owns this slug — it's free to use!
    if (!existing) {
      break; // Exit the loop. candidateSlug is our winner.
    }

    // If we reach here, the slug IS taken.
    // Build the next candidate by appending the suffix counter.
    // e.g., "my-post" + 1 → "my-post-1"
    candidateSlug = `${baseSlug}-${suffix}`;

    // Increment the suffix for the next loop iteration.
    suffix++;
  }

  // Return the first slug we found that isn't already in the DB.
  return candidateSlug;
}
