// Store departments in the order you walk through a typical Croatian
// supermarket. The order here IS the sort order of the shopping list.
export const SHOPPING_CATEGORIES = {
  produce: 'Voće i povrće',
  bakery: 'Pekara',
  meat: 'Meso i riba',
  dairy: 'Mliječni proizvodi i jaja',
  pantry: 'Tjestenina, riža, konzerve',
  snacks: 'Grickalice i slatkiši',
  drinks: 'Pića',
  frozen: 'Smrznuto',
  household: 'Kućanstvo i higijena',
  other: 'Ostalo',
} as const;

export const CATEGORY_KEYS = Object.keys(SHOPPING_CATEGORIES);

// Unknown keys (e.g. a category removed later) sort last instead of first.
export const categoryIndex = (key: string) => {
  const index = CATEGORY_KEYS.indexOf(key);
  return index === -1 ? CATEGORY_KEYS.length : index;
};
