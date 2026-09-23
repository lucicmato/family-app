import Anthropic from '@anthropic-ai/sdk';

import { createClient } from '@/lib/supabase/server';
import { CATEGORY_KEYS, SHOPPING_CATEGORIES } from '@/lib/shoppingCategories';

// Tight timeout and no retries: the user is waiting on "Dodaj", and a
// missing category is a much smaller problem than a slow add.
const anthropic = new Anthropic({ timeout: 3000, maxRetries: 0 });

const SYSTEM_PROMPT = `You sort grocery list items (written in Croatian) into supermarket departments.
Reply with exactly one key from this list and nothing else:
${Object.entries(SHOPPING_CATEGORIES)
  .map(([key, label]) => `${key} = ${label}`)
  .join('\n')}`;

// ilike treats % and _ as wildcards; escape them so "100% sok" matches only itself.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/**
 * Reuses the category of a previously added item with the same name before
 * asking the model — repeat purchases (mlijeko, kruh) are the common case, so
 * most adds cost nothing. Never throws: any failure falls back to "other" so
 * adding an item can't be blocked by the AI being down or slow.
 */
export const categorizeItem = async (name: string): Promise<string> => {
  const supabase = await createClient();
  const { data: previous } = await supabase
    .from('shopping_items')
    .select('category')
    .ilike('name', escapeLike(name))
    .neq('category', 'other')
    .limit(1)
    .maybeSingle();

  if (previous) {
    return previous.category;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return 'other';
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: name }],
    });

    const block = response.content[0];
    const answer = block?.type === 'text' ? block.text.trim().toLowerCase() : '';
    return CATEGORY_KEYS.includes(answer) ? answer : 'other';
  } catch (error) {
    console.error('categorizeItem: AI call failed:', error);
    return 'other';
  }
};
