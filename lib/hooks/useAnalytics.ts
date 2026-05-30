'use client';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
  }
}

function safeGtag(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, params);
    }
  } catch { /* silent */ }
}

function safeFbq(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params);
    }
  } catch { /* silent */ }
}

export function useAnalytics() {
  return {
    trackWorkflowViewed(workflow: { id: string; title: string; tool: string; category: string }) {
      safeGtag('workflow_viewed', {
        workflow_id: workflow.id,
        workflow_title: workflow.title,
        tool: workflow.tool,
        category: workflow.category,
      });
      safeFbq('ViewContent', {
        content_type: 'workflow',
        content_id: workflow.id,
        content_name: workflow.title,
      });
    },

    trackWorkflowSearched(query: string, resultsCount: number) {
      safeGtag('workflow_searched', { search_term: query, results_count: resultsCount });
      safeFbq('Search', { search_string: query });
    },

    trackExpertContactClicked(source: string) {
      safeGtag('expert_contact_clicked', { source });
      safeFbq('Lead', { content_name: 'expert_contact', source });
    },

    trackNewsletterSubscribed() {
      safeGtag('newsletter_subscribed');
      safeFbq('Subscribe');
    },

    trackChatOpened() {
      safeGtag('chat_opened');
    },

    trackChatLeadCaptured(email: string) {
      safeGtag('chat_lead_captured', { has_email: !!email });
      safeFbq('Lead', { content_name: 'chat_email_capture' });
    },

    trackAgencySignup() {
      safeGtag('agency_signup_started');
      safeFbq('InitiateCheckout', { content_name: 'agency_registration' });
    },

    track(event: string, params?: Record<string, unknown>) {
      safeGtag(event, params);
    },
  };
}
