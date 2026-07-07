/**
 * YGOPRODeck image helpers. No API key required.
 * Docs: https://ygoprodeck.com/api-guide/
 */

const HOST = "https://images.ygoprodeck.com/images";

export function cardArt(cardId: number): string {
  // cropped artwork (no frame) — ideal for banners/tiles
  return `${HOST}/cards_cropped/${cardId}.jpg`;
}

export function cardImage(cardId: number): string {
  // full card
  return `${HOST}/cards/${cardId}.jpg`;
}

export function cardImageSmall(cardId: number): string {
  return `${HOST}/cards_small/${cardId}.jpg`;
}
