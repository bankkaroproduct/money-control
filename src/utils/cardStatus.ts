/**
 * Card status helper — single source of truth for LTF / invite-only / discontinued.
 *
 * Priority (highest first): discontinued > invite_only > lifetime_free.
 * A card can technically be both LTF and discontinued; discontinued wins so we
 * never show an "apply-able" affordance for a card the user cannot source.
 */

export type CardStatus = 'discontinued' | 'invite_only' | 'lifetime_free' | null;

/** True when a fee value represents ₹0 / free. */
const isZeroFee = (value: unknown): boolean => {
  if (value === 0) return true;
  if (value === null || value === undefined) return false;
  const s = String(value).trim().toLowerCase();
  return s === '0' || s === '₹0' || s === 'free' || s === 'lifetime free';
};

/** True only when `sourceable` is explicitly present and falsy. */
const isDiscontinued = (card: any): boolean =>
  card?.sourceable === false || card?.sourceable === 0 || card?.sourceable === 'false';

/** True only when `invite_only` is explicitly present and truthy. */
const isInviteOnly = (card: any): boolean =>
  card?.invite_only === true || card?.invite_only === 1 || card?.invite_only === 'true';

/** True when both joining and annual fees are ₹0 / free. */
const isLifetimeFree = (card: any): boolean => {
  if (!card) return false;
  const annualFree = isZeroFee(card.annual_fee_text) || isZeroFee(card.annual_fee);
  const joiningFree =
    isZeroFee(card.joining_fees) ||
    isZeroFee(card.joining_fee_text) ||
    isZeroFee(card.joining_fee);
  return annualFree && joiningFree;
};

export const getCardStatus = (card: any): CardStatus => {
  if (!card) return null;
  if (isDiscontinued(card)) return 'discontinued';
  if (isInviteOnly(card)) return 'invite_only';
  if (isLifetimeFree(card)) return 'lifetime_free';
  return null;
};

/** Apply Now should be hidden for invite-only and discontinued cards. */
export const isApplyDisabled = (card: any): boolean => {
  const status = getCardStatus(card);
  return status === 'discontinued' || status === 'invite_only';
};

/** Human-readable label for each status (LTF keeps its short form). */
export const CARD_STATUS_LABEL: Record<Exclude<CardStatus, null>, string> = {
  discontinued: 'Discontinued',
  invite_only: 'Invite Only',
  lifetime_free: 'LTF',
};

/** Convenience: label string for a card, or null when no status applies. */
export const getCardStatusLabel = (card: any): string | null => {
  const status = getCardStatus(card);
  return status ? CARD_STATUS_LABEL[status] : null;
};
