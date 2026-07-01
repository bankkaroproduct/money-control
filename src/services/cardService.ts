import { authManager } from './authManager';

// All card API calls are proxied through /api/proxy to avoid CORS preflight failures
// on the external platform.bankkaro.com domain.
const BASE_URL = '/api/proxy';

export interface SpendingData {
  amazon_spends?: number;
  flipkart_spends?: number;
  other_online_spends?: number;
  other_offline_spends?: number;
  grocery_spends_online?: number;
  online_food_ordering?: number;
  fuel?: number;
  dining_or_going_out?: number;
  flights_annual?: number;
  hotels_annual?: number;
  domestic_lounge_usage_quarterly?: number;
  international_lounge_usage_quarterly?: number;
  mobile_phone_bills?: number;
  electricity_bills?: number;
  water_bills?: number;

  insurance_car_or_bike_annual?: number;
  insurance_health_annual?: number;
  rent?: number;
  school_fees?: number;
  life_insurance?: number;
  offline_grocery?: number;
}

export const cardService = {
  // ── READ operations → GET ──────────────────────────────────────────

  async getInitBundle() {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/init-bundle`,
      { method: 'GET' }
    );
    return response.json();
  },

  async getCardDetails(alias: string) {
    const allCards = await this.getPartnerCards();
    if (allCards.status === 'success' && Array.isArray(allCards.data)) {
      const match = allCards.data.find(
        (c: any) => (c.seo_card_alias || c.card_alias) === alias
      );
      return { status: 'success', data: match || null };
    }
    return allCards;
  },

  async getCardDetailsByAlias(alias: string) {
    return this.getCardDetails(alias);
  },

  async getPartnerCards(signal?: AbortSignal) {
    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/cards`,
      { method: 'GET', signal }
    );
    return response.json();
  },

  async getCardListing(params: {
    slug: string;
    banks_ids: number[];
    card_networks: string[];
    annualFees: string;
    credit_score: string;
    sort_by: string;
    free_cards: string;
    eligiblityPayload: {
      pincode?: string;
      inhandIncome?: string;
      empStatus?: string;
    };
    cardGeniusPayload: any[];
  }, signal?: AbortSignal) {
    const qs = new URLSearchParams();
    if (params.slug)    qs.set('slug',    params.slug);
    if (params.sort_by) qs.set('sort_by', params.sort_by);
    const url = `${BASE_URL}/cardgenius/cards${qs.toString() ? `?${qs}` : ''}`;
    const response = await authManager.makeAuthenticatedRequest(url, {
      method: 'GET',
      signal,
    });
    return response.json();
  },

  // ── WRITE / CALCULATE operations → POST ───────────────────────────

  async calculateCardGenius(spendingData: SpendingData) {
    // The calculate API validates that EVERY spend field is present. Callers often
    // build partial payloads (only the fields they collect), which triggers a 400
    // "<field> is required". Normalize here so all fields default to 0.
    const fullPayload: Required<SpendingData> = {
      amazon_spends: 0,
      flipkart_spends: 0,
      other_online_spends: 0,
      other_offline_spends: 0,
      grocery_spends_online: 0,
      online_food_ordering: 0,
      fuel: 0,
      dining_or_going_out: 0,
      flights_annual: 0,
      hotels_annual: 0,
      domestic_lounge_usage_quarterly: 0,
      international_lounge_usage_quarterly: 0,
      mobile_phone_bills: 0,
      electricity_bills: 0,
      water_bills: 0,
      insurance_car_or_bike_annual: 0,
      insurance_health_annual: 0,
      rent: 0,
      school_fees: 0,
      life_insurance: 0,
      offline_grocery: 0,
      ...spendingData,
    };

    const response = await authManager.makeAuthenticatedRequest(
      `${BASE_URL}/cardgenius/calculate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      }
    );
    return response.json();
  },

  async checkEligibility(params: {
    cardAlias: string;
    pincode: string;
    inhandIncome: string;
    empStatus: 'salaried' | 'self_employed';
  }) {
    const { cardAlias: _, ...eligibilityPayload } = params;
    const response = await fetch(`${BASE_URL}/cg-eligiblity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eligibilityPayload),
    });
    return response.json();
  },
};
