import ReactGA from "react-ga4";
import { brandConfig } from "@/config/brand.config";
import { authManager } from "@/services/authManager";
import { clickTracker } from "@/services/clickTracker";

const PARTNER_NAME = brandConfig.name;

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('bk_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('bk_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return '';
  return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
}

interface JourneyEvent {
  event_name: string;
  metadata?: Record<string, unknown>;
}

async function sendJourneyEvent(event: JourneyEvent): Promise<void> {
  try {
    // Get click_id if available
    const clickId = clickTracker.getClickId();
    const metadata = {
      ...(clickId ? { click_id: clickId } : {}),
      ...event.metadata,
    };

    console.log('📊 Journey Event:', event.event_name, metadata);

    // 1. Send to GA4
    try {
      ReactGA.event(event.event_name, {
        partner_name: PARTNER_NAME,
        device_type: getDeviceType(),
        ...metadata,
      });
      console.log('✅ GA4 event sent:', event.event_name);
    } catch (err) {
      console.error('❌ GA4 error:', err);
    }

    // 2. Send to JT backend with partner-token (backend resolves partner name from token)
    const payload = {
      event_name: event.event_name,
      session_id: getSessionId(),
      device_type: getDeviceType(),
      metadata,
    };

    // Get cached partner token
    let token = '';
    try { token = await authManager.getToken(); } catch (err) {
      console.warn('⚠️ Failed to get auth token:', err);
    }

    if (!token) {
      console.warn('⚠️ No partner token available for JT backend');
    }

    // Call local Next.js proxy (no CORS), which forwards with partner-token server-to-server
    fetch('/api/journey-track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'partner-token': token } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(res => {
        console.log('✅ JT backend response:', res.status);
      })
      .catch(err => {
        console.error('❌ JT backend error:', err);
      });
  } catch (err) {
    console.error('❌ sendJourneyEvent error:', err);
  }
}

// ==================== HOMEPAGE EVENTS ====================

export const trackHomePageView = () =>
  sendJourneyEvent({ event_name: 'home_page_view' });

// ==================== NAVIGATION EVENTS ====================

export const trackNavHomeClicked = (menuItem = 'home') =>
  sendJourneyEvent({ event_name: 'nav_home_clicked', metadata: { menu_item: menuItem } });

export const trackNavDiscoverClicked = (menuItem = 'discover') =>
  sendJourneyEvent({ event_name: 'nav_discover_clicked', metadata: { menu_item: menuItem } });

export const trackNavAboutClicked = (menuItem = 'about') =>
  sendJourneyEvent({ event_name: 'nav_about_clicked', metadata: { menu_item: menuItem } });

export const trackNavToolsDropdownOpened = () =>
  sendJourneyEvent({ event_name: 'nav_tools_dropdown_opened' });

export const trackNavToolSelected = (toolName: string) =>
  sendJourneyEvent({ event_name: 'nav_tool_selected', metadata: { tool_name: toolName } });

export const trackNavBlogsClicked = (menuItem = 'blogs') =>
  sendJourneyEvent({ event_name: 'nav_blogs_clicked', metadata: { menu_item: menuItem } });

export const trackNavSocialsDropdownOpened = () =>
  sendJourneyEvent({ event_name: 'nav_socials_dropdown_opened' });

export const trackNavSocialSelected = (socialPlatform: string) =>
  sendJourneyEvent({ event_name: 'nav_social_selected', metadata: { social_platform: socialPlatform } });

export const trackNavLogoClicked = () =>
  sendJourneyEvent({ event_name: 'nav_logo_clicked' });

// ==================== HERO SECTION EVENTS ====================

export const trackHeroExplorePicksAnchorClicked = (buttonPosition?: string) =>
  sendJourneyEvent({ event_name: 'hero_explore_picks_anchor_clicked', metadata: { button_position: buttonPosition } });

export const trackHeroSearchBarFocused = () =>
  sendJourneyEvent({ event_name: 'hero_search_bar_focused' });

export const trackSearchSubmitted = (searchQuery?: string) =>
  sendJourneyEvent({ event_name: 'search_submitted', metadata: { search_query: searchQuery } });

export const trackSearchQueryTyped = (searchQuery?: string) =>
  sendJourneyEvent({ event_name: 'search_query_typed', metadata: { search_query: searchQuery } });

export const trackHeroExploreAllCardsClicked = (buttonPosition?: string) =>
  sendJourneyEvent({ event_name: 'hero_explore_all_cards_clicked', metadata: { button_position: buttonPosition } });

// ==================== PICKS SECTION EVENTS ====================

export const trackPicksSectionViewed = () =>
  sendJourneyEvent({ event_name: 'picks_section_viewed' });

export const trackPicksTabSelected = (tabName: string) =>
  sendJourneyEvent({ event_name: 'picks_tab_selected', metadata: { tab_name: tabName } });

export const trackPicksCardClicked = (cardAlias?: string, cardName?: string, bank?: string, tabName?: string) =>
  sendJourneyEvent({
    event_name: 'picks_card_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, bank: bank, tab_name: tabName }
  });

export const trackPicksCardDetailsClicked = (cardAlias?: string, cardName?: string, tabName?: string) =>
  sendJourneyEvent({
    event_name: 'picks_card_details_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, tab_name: tabName }
  });

export const trackPicksLoadMoreClicked = (tabName?: string) =>
  sendJourneyEvent({ event_name: 'picks_load_more_clicked', metadata: { tab_name: tabName } });

// ==================== TOOLS SECTION EVENTS ====================

export const trackToolsSectionViewed = () =>
  sendJourneyEvent({ event_name: 'tools_section_viewed' });

export const trackHomepageSuperCardGeniusClicked = (toolName?: string, buttonPosition?: string) =>
  sendJourneyEvent({
    event_name: 'homepage_super_card_genius_clicked',
    metadata: { tool_name: toolName, button_position: buttonPosition }
  });

export const trackHomepageBeatMyCardClicked = (toolName?: string, buttonPosition?: string) =>
  sendJourneyEvent({
    event_name: 'homepage_beat_my_card_clicked',
    metadata: { tool_name: toolName, button_position: buttonPosition }
  });

export const trackHomepageCategoryCardGeniusClicked = (toolName?: string, buttonPosition?: string) =>
  sendJourneyEvent({
    event_name: 'homepage_category_card_genius_clicked',
    metadata: { tool_name: toolName, button_position: buttonPosition }
  });

// ==================== FOOTER SECTION EVENTS ====================

export const trackFooterSectionViewed = () =>
  sendJourneyEvent({ event_name: 'footer_section_viewed' });

export const trackFooterQuickLinkClicked = (linkName: string) =>
  sendJourneyEvent({ event_name: 'footer_quick_link_clicked', metadata: { link_name: linkName } });

export const trackFooterEmailClicked = (email = 'support@moneycontrol.com') =>
  sendJourneyEvent({ event_name: 'footer_email_clicked', metadata: { email } });

export const trackFooterBankKaroLogoClicked = () =>
  sendJourneyEvent({ event_name: 'footer_bankkaro_logo_clicked' });

export const trackFooterPrivacyPolicyClicked = () =>
  sendJourneyEvent({ event_name: 'footer_privacy_policy_clicked' });

export const trackFooterTermsClicked = () =>
  sendJourneyEvent({ event_name: 'footer_terms_clicked' });

// ==================== DISCOVER PAGE EVENTS ====================

export const trackDiscoverPageView = () =>
  sendJourneyEvent({ event_name: 'discover_page_view' });

export const trackDiscoverSearchBarFocused = () =>
  sendJourneyEvent({ event_name: 'discover_search_bar_focused' });

export const trackDiscoverSearchQueryTyped = (searchQuery?: string) =>
  sendJourneyEvent({ event_name: 'discover_search_query_typed', metadata: { search_query: searchQuery } });

export const trackDiscoverSearchSubmitted = (searchQuery?: string) =>
  sendJourneyEvent({ event_name: 'discover_search_submitted', metadata: { search_query: searchQuery } });

// ==================== ELIGIBILITY SECTION EVENTS (Discover) ====================

export const trackEligibilitySectionViewed = () =>
  sendJourneyEvent({ event_name: 'eligibility_section_viewed' });

export const trackEligibilityPincodeFilled = (pincode?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_pincode_filled', metadata: { pincode } });

export const trackEligibilityIncomeFilled = (monthlyIncome?: string | number) =>
  sendJourneyEvent({ event_name: 'eligibility_income_filled', metadata: { monthly_income: monthlyIncome } });

export const trackEligibilityEmploymentSelected = (employmentStatus?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_employment_selected', metadata: { employment_status: employmentStatus } });

export const trackEligibilityDetailsFilled = (pincode?: string, monthlyIncome?: string | number, employmentStatus?: string) =>
  sendJourneyEvent({
    event_name: 'eligibility_details_filled',
    metadata: { pincode, monthly_income: monthlyIncome, employment_status: employmentStatus }
  });

export const trackEligibilityCheckClicked = () =>
  sendJourneyEvent({ event_name: 'eligibility_check_clicked' });

export const trackEligibilityChecked = (pincode?: string, monthlyIncome?: string | number, employmentStatus?: string, eligibleCardsCount?: number) =>
  sendJourneyEvent({
    event_name: 'eligibility_checked',
    metadata: { pincode, monthly_income: monthlyIncome, employment_status: employmentStatus, eligible_cards_count: eligibleCardsCount }
  });

// ==================== FILTER EVENTS ====================

export const trackFilterPanelViewed = () =>
  sendJourneyEvent({ event_name: 'filter_panel_viewed' });

export const trackFilterCategorySelected = (category: string) =>
  sendJourneyEvent({ event_name: 'filter_category_selected', metadata: { category } });

export const trackFilterFeeRangeOpened = () =>
  sendJourneyEvent({ event_name: 'filter_fee_range_opened' });

export const trackFilterFeeRangeSelected = (feeRange?: string) =>
  sendJourneyEvent({ event_name: 'filter_fee_range_selected', metadata: { fee_range: feeRange } });

export const trackFilterNetworkOpened = () =>
  sendJourneyEvent({ event_name: 'filter_network_opened' });

export const trackFilterNetworkSelected = (network?: string) =>
  sendJourneyEvent({ event_name: 'filter_network_selected', metadata: { network } });

export const trackListingFiltersSelected = (filterType?: string, filterValue?: string) =>
  sendJourneyEvent({ event_name: 'listing_filters_selected', metadata: { filter_type: filterType, filter_value: filterValue } });

export const trackFiltersCleared = () =>
  sendJourneyEvent({ event_name: 'filters_cleared' });

export const trackListingClearAllFilters = () =>
  sendJourneyEvent({ event_name: 'listing_clear_all_filters' });

// ==================== LISTING PAGE EVENTS ====================

export const trackListingPageView = (totalCards?: number, displayedCount?: number) =>
  sendJourneyEvent({ event_name: 'listing_page_view', metadata: { total_cards: totalCards, displayed_count: displayedCount } });

export const trackCardClicked = (cardAlias?: string, cardName?: string, bank?: string, position?: number) =>
  sendJourneyEvent({
    event_name: 'card_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, bank: bank, position }
  });

export const trackCardDetailsClicked = (cardAlias?: string, cardName?: string, position?: number) =>
  sendJourneyEvent({
    event_name: 'card_details_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, position }
  });

export const trackListingApplyNowClicked = (cardAlias?: string, source?: string) => {
  console.log('🎯 trackListingApplyNowClicked called:', { cardAlias, source });
  return sendJourneyEvent({ event_name: 'listing_apply_now_clicked', metadata: { card_alias: cardAlias, source } });
};

export const trackListingLoadMoreClicked = () =>
  sendJourneyEvent({ event_name: 'listing_load_more_clicked' });

// ==================== COMPARISON EVENTS ====================

export const trackCompareCardAdded = (cardId?: string, cardName?: string, source?: string) =>
  sendJourneyEvent({ event_name: 'compare_card_added', metadata: { card_id: cardId, card_name: cardName, source } });

export const trackCompareCardRemoved = (cardId?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'compare_card_removed', metadata: { card_id: cardId, card_name: cardName } });

export const trackComparePanelViewed = (cardsCount?: number) =>
  sendJourneyEvent({ event_name: 'compare_panel_viewed', metadata: { cards_count: cardsCount } });

export const trackCompareNowClicked = (cardIds?: string[]) =>
  sendJourneyEvent({ event_name: 'compare_now_clicked', metadata: { card_ids: cardIds } });

// ==================== CARD DETAILS PAGE EVENTS ====================

export const trackCardDetailsPageView = (cardAlias?: string, cardName?: string, bank?: string, source?: string) =>
  sendJourneyEvent({
    event_name: 'card_details_page_view',
    metadata: { card_alias: cardAlias, card_name: cardName, bank: bank, source }
  });

export const trackCardDetailsBackClicked = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'card_details_back_clicked', metadata: { card_alias: cardAlias } });

export const trackCardDetailsBreadcrumbClicked = (linkName?: string, cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'card_details_breadcrumb_clicked', metadata: { link_name: linkName, card_alias: cardAlias } });

export const trackCardDetailsBenefitsViewed = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'card_details_benefits_viewed', metadata: { card_alias: cardAlias } });

export const trackCardDetailsApplyNowClicked = (cardAlias?: string, cardName?: string) => {
  console.log('🎯 trackCardDetailsApplyNowClicked called:', { cardAlias, cardName });
  return sendJourneyEvent({ event_name: 'card_details_apply_now_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });
};

export const trackCardDetailsCheckEligibilityClicked = (cardAlias?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'card_details_check_eligibility_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });

export const trackCardDetailsCompareClicked = (cardAlias?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'card_details_compare_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });

// ==================== ABOUT PAGE EVENTS ====================

export const trackAboutPageView = () =>
  sendJourneyEvent({ event_name: 'about_page_view' });

export const trackAboutSubscribeSectionViewed = () =>
  sendJourneyEvent({ event_name: 'about_subscribe_section_viewed' });

export const trackAboutSubscribeClicked = (destinationUrl?: string) =>
  sendJourneyEvent({ event_name: 'about_subscribe_clicked', metadata: { destination_url: destinationUrl } });

// ==================== TOOLS DROPDOWN EVENTS ====================

export const trackToolsDropdownOpened = () =>
  sendJourneyEvent({ event_name: 'tools_dropdown_opened' });

export const trackToolSelected = (toolName: string) =>
  sendJourneyEvent({ event_name: 'tool_selected', metadata: { tool_name: toolName } });

// ==================== SUPER CARD GENIUS (SCG) EVENTS ====================

export const trackScgPageView = (source?: string) =>
  sendJourneyEvent({ event_name: 'scg_page_view', metadata: { source } });

export const trackScgFormStarted = () =>
  sendJourneyEvent({ event_name: 'scg_form_started' });

export const trackScgSpendsFilled = (spends?: object) =>
  sendJourneyEvent({ event_name: 'scg_spends_filled', metadata: { spends } });

export const trackScgCalculateClicked = () =>
  sendJourneyEvent({ event_name: 'scg_calculate_clicked' });

export const trackScgResultsView = (resultsCount?: number, topCard?: string) =>
  sendJourneyEvent({ event_name: 'scg_results_view', metadata: { results_count: resultsCount, top_card: topCard } });

export const trackScgResultCardClicked = (cardAlias?: string, cardName?: string, position?: number) =>
  sendJourneyEvent({
    event_name: 'scg_result_card_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, position }
  });

export const trackScgApplyNowClicked = (recommendedCard?: string, cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'scg_apply_now_clicked', metadata: { recommended_card: recommendedCard, card_alias: cardAlias } });

export const trackScgCompareClicked = (cardAlias?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'scg_compare_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });

export const trackScgResetClicked = () =>
  sendJourneyEvent({ event_name: 'scg_reset_clicked' });

// ==================== CATEGORY CARD GENIUS (CCG) EVENTS ====================

export const trackCcgPageView = (source?: string) =>
  sendJourneyEvent({ event_name: 'ccg_page_view', metadata: { source } });

export const trackCcgCategorySelected = (category: string) =>
  sendJourneyEvent({ event_name: 'ccg_category_selected', metadata: { category } });

export const trackCcgSpendsFilled = (category?: string, spends?: object) =>
  sendJourneyEvent({ event_name: 'ccg_spends_filled', metadata: { category, spends } });

export const trackCcgCalculateClicked = (category?: string) =>
  sendJourneyEvent({ event_name: 'ccg_calculate_clicked', metadata: { category } });

export const trackCcgResultsView = (category?: string, resultsCount?: number, topCard?: string) =>
  sendJourneyEvent({
    event_name: 'ccg_results_view',
    metadata: { category, results_count: resultsCount, top_card: topCard }
  });

export const trackCcgResultCardClicked = (cardAlias?: string, cardName?: string, category?: string, position?: number) =>
  sendJourneyEvent({
    event_name: 'ccg_result_card_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, category, position }
  });

export const trackCcgApplyNowClicked = (recommendedCard?: string, cardAlias?: string, category?: string) => {
  console.log('🎯 trackCcgApplyNowClicked called:', { recommendedCard, cardAlias, category });
  return sendJourneyEvent({
    event_name: 'ccg_apply_now_clicked',
    metadata: { recommended_card: recommendedCard, card_alias: cardAlias, category }
  });
};

export const trackCcgCompareClicked = (cardAlias?: string, cardName?: string, category?: string) =>
  sendJourneyEvent({
    event_name: 'ccg_compare_clicked',
    metadata: { card_alias: cardAlias, card_name: cardName, category }
  });

export const trackCcgResetClicked = () =>
  sendJourneyEvent({ event_name: 'ccg_reset_clicked' });

// ==================== BEAT MY CARD (BMC) EVENTS ====================

export const trackBmcPageView = (source?: string) =>
  sendJourneyEvent({ event_name: 'bmc_page_view', metadata: { source } });

export const trackBmcCardSelected = (cardName?: string, cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'bmc_card_selected', metadata: { card_name: cardName, card_alias: cardAlias } });

export const trackBmcSpendsFilled = (spends?: object) =>
  sendJourneyEvent({ event_name: 'bmc_spends_filled', metadata: { spends } });

export const trackBmcRevealCardClicked = (currentCard?: string) =>
  sendJourneyEvent({ event_name: 'bmc_reveal_card_clicked', metadata: { current_card: currentCard } });

export const trackBmcResultsView = (currentCard?: string, recommendedCard?: string, savings?: number) =>
  sendJourneyEvent({
    event_name: 'bmc_results_view',
    metadata: { current_card: currentCard, recommended_card: recommendedCard, savings }
  });

export const trackBmcResultCardClicked = (cardAlias?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'bmc_result_card_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });

export const trackBmcApplyNowClicked = (recommendedCard?: string, cardAlias?: string, currentCard?: string) => {
  console.log('🎯 trackBmcApplyNowClicked called:', { recommendedCard, cardAlias, currentCard });
  return sendJourneyEvent({
    event_name: 'bmc_apply_now_clicked',
    metadata: { recommended_card: recommendedCard, card_alias: cardAlias, current_card: currentCard }
  });
};

export const trackBmcCompareClicked = (cardAlias?: string, cardName?: string) =>
  sendJourneyEvent({ event_name: 'bmc_compare_clicked', metadata: { card_alias: cardAlias, card_name: cardName } });

export const trackBmcResetClicked = () =>
  sendJourneyEvent({ event_name: 'bmc_reset_clicked' });

// ==================== ELIGIBILITY MODAL EVENTS ====================

export const trackEligibilityModalOpened = (cardAlias?: string, cardName?: string, source?: string) =>
  sendJourneyEvent({
    event_name: 'eligibility_modal_opened',
    metadata: { card_alias: cardAlias, card_name: cardName, source }
  });

export const trackEligibilityModalPincodeFilled = (pincode?: string, cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_pincode_filled', metadata: { pincode, card_alias: cardAlias } });

export const trackEligibilityModalIncomeFilled = (monthlyIncome?: string | number, cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_income_filled', metadata: { monthly_income: monthlyIncome, card_alias: cardAlias } });

export const trackEligibilityModalEmploymentSelected = (employmentStatus?: string, cardAlias?: string) =>
  sendJourneyEvent({
    event_name: 'eligibility_modal_employment_selected',
    metadata: { employment_status: employmentStatus, card_alias: cardAlias }
  });

export const trackEligibilityModalDetailsFilled = (pincode?: string, monthlyIncome?: string | number, employmentStatus?: string, cardAlias?: string) =>
  sendJourneyEvent({
    event_name: 'eligibility_modal_details_filled',
    metadata: { pincode, monthly_income: monthlyIncome, employment_status: employmentStatus, card_alias: cardAlias }
  });

export const trackEligibilityModalCheckClicked = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_check_clicked', metadata: { card_alias: cardAlias } });

export const trackEligibilityModalCancelClicked = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_cancel_clicked', metadata: { card_alias: cardAlias } });

export const trackEligibilityModalClosed = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_closed', metadata: { card_alias: cardAlias } });

export const trackEligibilityModalSubmitted = (cardAlias?: string, pincode?: string, monthlyIncome?: string | number, employmentStatus?: string, eligible?: boolean) =>
  sendJourneyEvent({
    event_name: 'eligibility_modal_submitted',
    metadata: { card_alias: cardAlias, pincode, monthly_income: monthlyIncome, employment_status: employmentStatus, eligible }
  });

export const trackEligibilityModalPassed = (cardAlias?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_passed', metadata: { card_alias: cardAlias } });

export const trackEligibilityModalFailed = (cardAlias?: string, reason?: string) =>
  sendJourneyEvent({ event_name: 'eligibility_modal_failed', metadata: { card_alias: cardAlias, reason } });

// ==================== REDIRECT EVENTS ====================

export const trackApplyRedirect = (cardAlias?: string, source?: string) =>
  sendJourneyEvent({ event_name: 'apply_redirect', metadata: { card_alias: cardAlias, source } });

export const trackRedirectToUrl = (exitId: string, cardAlias?: string) => {
  console.log('🎯 trackRedirectToUrl called:', { exitId, cardAlias });
  return sendJourneyEvent({ event_name: 'redirect_to_url', metadata: { exit_id: exitId, card_alias: cardAlias } });
};

// ==================== INITIALIZATION & HELPERS ====================

// Initialize journey tracking on app load - captures click_id from URL
export const initializeJourneyTracking = (): void => {
  if (typeof window === 'undefined') return;
  clickTracker.getClickIdFromUrl();
};

// Get tracked link for redirects (e.g., bank apply URLs) - returns { url, exitid } or null
export const getTrackedLink = async (targetUrl: string): Promise<{ url: string; exitid: string } | null> => {
  return clickTracker.getTrackedLink(targetUrl);
};

// Manually set click_id (e.g., from parent window postMessage)
export const setClickId = (clickId: string): void => {
  clickTracker.setClickId(clickId);
};

// Get current click_id
export const getClickId = (): string | null => {
  return clickTracker.getClickId();
};
