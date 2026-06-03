/**
 * Redirect Handler Utility
 * Manages secure redirects to bank partner websites with interstitial page
 */

import { toast } from 'sonner';
import { brandConfig } from '@/config/brand.config';
import { clickTracker } from '@/services/clickTracker';

/** Matches any unfilled template placeholder like {click_id} or {user_id} */
const PLACEHOLDER_RE = /\{[^}]+\}/;

const ALLOWED_DOMAINS = [
  'track.techtrack.in',
  'bankkaro.com',
  'platform.bankkaro.com',
  'sbicard.com',
  'hdfcbank.com',
  'axisbank.com',
  'idfcfirstbank.com',
  'icicibank.com',
  'kotak.com',
  'rblbank.com',
  'yesbank.in',
  'indusind.com',
  'hsbc.co.in',
  'americanexpress.com',
  'aubank.in',
  'federalbank.co.in',
  'cashkaro.com',
  'go2joy.in',
  'tectrack.in',
  'techtrack.in',
];

const REDIRECT_ANALYTICS_ENABLED = (process.env.NEXT_PUBLIC_ENABLE_REDIRECT_ANALYTICS || '').toString().toLowerCase() === 'true';

export interface RedirectParams {
  networkUrl?: string;
  bankName: string;
  bankLogo?: string;
  cardName: string;
  cardId?: string | number;
}

/**
 * Opens the redirect interstitial page in a new tab
 * @param params - Redirect parameters including bank and card details
 * @returns Window object of the newly opened tab, or null if blocked
 */
export const openRedirectInterstitial = (params: RedirectParams): Window | null => {
  const { bankName, bankLogo, cardName, cardId } = params;
  const normalizedNetworkUrl = (() => {
    if (!params.networkUrl) return '';
    // Clean placeholder params ({click_id}, {user_id}, etc.) before validation
    const cleaned = cleanUrl(params.networkUrl);
    if (!cleaned) return '';

    // Reject URLs with an obviously empty campaign_id (e.g. campaign_id=&…)
    if (/[?&]campaign_id=(&|$)/.test(cleaned)) {
      console.warn('Redirect handler: Network URL has empty campaign_id — skipping', cleaned);
      return '';
    }

    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol !== 'https:' && !parsed.hostname.includes('localhost')) {
        console.warn('Redirect handler: Network URL must be HTTPS or localhost', cleaned);
        return '';
      }
      return parsed.toString();
    } catch {
      console.warn('Redirect handler: Invalid network URL provided', cleaned);
      return '';
    }
  })();

  // Domain check on API-supplied networkUrls.
  if (normalizedNetworkUrl && !isAllowedDomain(normalizedNetworkUrl)) {
    console.error(
      'Redirect handler: networkUrl is not a valid HTTPS URL — blocked',
      normalizedNetworkUrl
    );
    return null;
  }

  const destinationUrl = normalizedNetworkUrl;

  // Build query parameters for the interstitial page
  const queryParams = new URLSearchParams({
    url: destinationUrl,
    bank: bankName,
    card: cardName,
  });

  if (bankLogo) {
    queryParams.append('logo', bankLogo);
  }

  if (cardId) {
    queryParams.append('cardId', String(cardId));
  }

  // Build the interstitial URL
  const interstitialUrl = `/redirect?${queryParams.toString()}`;

  // Track the click event
  trackRedirectClick({
    cardId,
    cardName,
    bankName,
    targetUrl: destinationUrl || '',
  });

  // Open in new tab - NEVER modify the current page
  try {
    // 'noopener' prevents the new tab from accessing window.opener (stops tabnapping attacks).
    // We intentionally do NOT add 'noreferrer' here because noreferrer implies noopener AND
    // forces window.open to return null even for same-origin URLs, which breaks popup-blocked
    // detection and causes a false "Unable to open" error toast on every click.
    const newWindow = window.open(interstitialUrl, '_blank', 'noopener');

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.warn('Redirect handler: Popup blocked - user needs to allow popups');
      // DO NOT redirect current page - just log and return null
      // The current page stays intact, user can try again or check popup settings
      return null;
    }

    return newWindow;
  } catch (error) {
    console.error('Redirect handler: Failed to open window', error);
    // DO NOT modify current page even on error
    return null;
  }
};

/**
 * Track redirect click events for analytics
 */
const trackRedirectClick = (data: {
  cardId?: string | number;
  cardName: string;
  bankName: string;
  targetUrl: string;
}) => {
  if (!REDIRECT_ANALYTICS_ENABLED) {
    return;
  }

  try {
    // Get click_id if available
    const clickId = clickTracker.getClickId();

    // Use sendBeacon for reliable tracking even if page unloads
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/redirect-click', JSON.stringify({
        event: 'apply_click',
        ...data,
        ...(clickId ? { click_id: clickId } : {}),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }));
    }

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Redirect click tracked:', data, { click_id: clickId });
    }
  } catch (error) {
    console.error('Failed to track redirect click:', error);
  }
};

/**
 * Extract bank name from card data
 */
export const extractBankName = (card: any): string => {
  // banks can be an object {name} or an array [{name}]
  const banks = card?.banks;
  const bankFromBanks = Array.isArray(banks) ? banks[0]?.name : banks?.name;
  return bankFromBanks ||
    card?.bank_name ||
    card?.bankName ||
    card?.name?.split(' ')[0] || // First word of card name as fallback
    'Bank';
};

/**
 * Extract bank logo from card data
 */
export const extractBankLogo = (card: any): string | undefined => {
  const banks = card?.banks;
  const logoFromBanks = Array.isArray(banks) ? banks[0]?.logo : banks?.logo;
  return logoFromBanks ||
    card?.bank_logo ||
    card?.bankLogo ||
    undefined;
};

/**
 * Validate that a URL belongs to an explicitly allowed domain (or subdomain thereof).
 * Must be HTTPS. Subdomains of allowed domains are permitted (e.g. platform.bankkaro.com).
 */
export const isAllowedDomain = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_DOMAINS.some(
      domain =>
        parsed.hostname === domain ||
        parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};

const cleanUrl = (rawUrl: string): string => {
  try {
    // Get partner name from brand config
    const partnerName = brandConfig.name?.toLowerCase() || 'bankkaro';

    // Get click_id if available
    const clickId = clickTracker.getClickId() || '';

    // Replace known placeholders with actual values
    let url = rawUrl.trim()
      .replace('{user_id}', partnerName)  // e.g. 'tide'
      .replace('{click_id}', clickId);    // insert actual click_id

    // Remove any remaining unfilled placeholders
    const parsed = new URL(url);
    const params = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!value.includes('{') && !value.includes('}')) {
        params.append(key, value);
      }
    });
    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
};

/**
 * Convenience helper to open card application flows from raw card objects
 */
export const redirectToCardApplication = async (card: any, overrides: Partial<RedirectParams> = {}): Promise<boolean> => {
  const rawUrl =
    overrides.networkUrl ??
    card?.network_url ??
    card?.cg_network_url ??
    card?.ck_store_url ??
    card?.network_url_2 ??
    card?.card_apply_link ??
    '';

  const url = cleanUrl(rawUrl);

  console.log('FINAL REDIRECT URL:', cleanUrl(rawUrl));

  console.log('REDIRECT URL FOR CARD:', {
    cardName: card.name || card.card_name,
    network_url: card.network_url,
    cg_network_url: card.cg_network_url,
    ck_store_url: card.ck_store_url,
    network_url_2: card.network_url_2,
    finalUrl: url,
  });

  if (
    !url ||
    url.trim() === '' ||
    url === 'null' ||
    url === 'undefined'
  ) {
    toast.error('Application link is not available for this card. Please check back later.');
    return false;
  }

  // Import here to avoid circular dependency
  const { getTrackedLink, trackRedirectToUrl } = await import('@/services/journeyTrack');

  // Get tracked link with exit ID
  const trackedLinkData = await getTrackedLink(url);
  let finalUrl = url;
  let exitId: string | undefined;

  if (trackedLinkData) {
    finalUrl = trackedLinkData.url;
    exitId = trackedLinkData.exitid;
    // Send redirect event with exit ID
    await trackRedirectToUrl(exitId, card?.alias || card?.card_alias);
  }

  const windowRef = openRedirectInterstitial({
    networkUrl: finalUrl,
    bankName: overrides.bankName ?? extractBankName(card),
    bankLogo: overrides.bankLogo ?? extractBankLogo(card),
    cardName: overrides.cardName ?? card?.name ?? 'Credit Card',
    cardId: overrides.cardId ?? card?.id
  });

  return Boolean(windowRef);
};
