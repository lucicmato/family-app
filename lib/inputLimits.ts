// Single source for both the form's maxLength (UX) and the Server Action
// check (the actual boundary — Server Actions are public POST endpoints, so
// the browser's maxLength is trivially bypassed). The shopping name also goes
// to the Anthropic API, where an unbounded input is an unbounded bill.
export const INPUT_LIMITS = {
  taskTitle: 200,
  shoppingName: 100,
  shoppingNote: 200,
} as const;
