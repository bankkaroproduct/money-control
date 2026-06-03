import { authManager } from "@/services/authManager";

class ClickTracker {
  private clickId: string | null = null;

  // Extract click_id from URL query parameters
  getClickIdFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const clickId = params.get('click_id') || params.get('clickId') || params.get('cid');

    if (clickId) {
      sessionStorage.setItem('bk_click_id', clickId);
      this.clickId = clickId;
    }

    return this.clickId || sessionStorage.getItem('bk_click_id');
  }

  // Get stored click_id
  getClickId(): string | null {
    if (this.clickId) return this.clickId;

    if (typeof window === 'undefined') return null;

    this.clickId = sessionStorage.getItem('bk_click_id');
    return this.clickId;
  }

  // Get tracked link with exit ID
  async getTrackedLink(targetUrl: string): Promise<{ url: string; exitid: string } | null> {
    try {
      console.log('🔗 getTrackedLink called with URL:', targetUrl);
      const token = await authManager.getToken();
      console.log('🔑 Got auth token:', token ? 'YES' : 'NO');

      const response = await fetch('https://platform.bankkaro.com/partner/get-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'partner-token': token,
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        console.warn('❌ Failed to get tracked link:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('📡 API Response data:', data);
      const trackedUrl = data.data?.url;
      const exitid = data.data?.exitid;

      if (!trackedUrl || !exitid) {
        console.warn('❌ Invalid response from get-link API - missing url or exitid');
        return null;
      }

      console.log('✅ Got tracked link:', { url: trackedUrl, exitid });
      return { url: trackedUrl, exitid };
    } catch (error) {
      console.error('❌ Error getting tracked link:', error);
      return null;
    }
  }

  // Set click_id manually (if received from parent/referring site)
  setClickId(clickId: string): void {
    this.clickId = clickId;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bk_click_id', clickId);
    }
  }

  // Clear click_id (on logout or session end)
  clearClickId(): void {
    this.clickId = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bk_click_id');
    }
  }
}

export const clickTracker = new ClickTracker();
