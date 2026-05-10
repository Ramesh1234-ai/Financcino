/**
 * useAnalytics Hook
 * Track user interactions and generate CTR metrics for landing page
 * 
 * Features:
 * - Track CTA clicks from different sections
 * - Log page visits
 * - Calculate click-through rates
 * - Store events in localStorage for persistence
 */

import { useState, useEffect, useCallback } from 'react';

const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(() => {
    // Load analytics from localStorage on mount
    const stored = localStorage.getItem('financino_analytics');
    return stored ? JSON.parse(stored) : {
      pageVisits: 0,
      ctaClicks: {
        navbar: 0,
        hero: 0,
        featuresSection: 0,
        pricingSection: 0,
      },
      timestamps: [],
    };
  });

  // Save analytics to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('financino_analytics', JSON.stringify(analyticsData));
  }, [analyticsData]);

  /**
   * Track CTA click from specific section
   * @param {string} source - Where the click originated (navbar, hero, features, pricing)
   */
  const trackCTAClick = useCallback((source = 'unknown') => {
    setAnalyticsData((prevData) => ({
      ...prevData,
      ctaClicks: {
        ...prevData.ctaClicks,
        [source]: (prevData.ctaClicks[source] || 0) + 1,
      },
      timestamps: [
        ...prevData.timestamps,
        {
          event: 'cta_click',
          source,
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    // Log to console for debugging
    console.log(`[Analytics] CTA clicked from ${source}`);

    // Optional: Send to analytics service (Google Analytics, Mixpanel, etc.)
    // sendToAnalyticsService({ event: 'cta_click', source });
  }, []);

  /**
   * Track page visit
   */
  const trackPageVisit = useCallback(() => {
    setAnalyticsData((prevData) => ({
      ...prevData,
      pageVisits: prevData.pageVisits + 1,
      timestamps: [
        ...prevData.timestamps,
        {
          event: 'page_visit',
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    console.log('[Analytics] Landing page visited');
  }, []);

  /**
   * Calculate CTR for each section
   * @returns {object} CTR metrics for each section
   */
  const calculateCTR = useCallback(() => {
    if (analyticsData.pageVisits === 0) {
      return {
        navbar: '0%',
        hero: '0%',
        featuresSection: '0%',
        pricingSection: '0%',
        overall: '0%',
      };
    }

    const totalClicks = Object.values(analyticsData.ctaClicks).reduce((a, b) => a + b, 0);

    return {
      navbar: `${((analyticsData.ctaClicks.navbar / analyticsData.pageVisits) * 100).toFixed(2)}%`,
      hero: `${((analyticsData.ctaClicks.hero / analyticsData.pageVisits) * 100).toFixed(2)}%`,
      featuresSection: `${((analyticsData.ctaClicks.featuresSection / analyticsData.pageVisits) * 100).toFixed(2)}%`,
      pricingSection: `${((analyticsData.ctaClicks.pricingSection / analyticsData.pageVisits) * 100).toFixed(2)}%`,
      overall: `${((totalClicks / analyticsData.pageVisits) * 100).toFixed(2)}%`,
    };
  }, [analyticsData]);

  /**
   * Get analytics summary
   * @returns {object} Summary of all analytics data
   */
  const getAnalyticsSummary = useCallback(() => {
    const ctr = calculateCTR();
    return {
      pageVisits: analyticsData.pageVisits,
      totalClicks: Object.values(analyticsData.ctaClicks).reduce((a, b) => a + b, 0),
      ctaBreakdown: analyticsData.ctaClicks,
      ctr,
      recentEvents: analyticsData.timestamps.slice(-10),
    };
  }, [analyticsData, calculateCTR]);

  /**
   * Reset all analytics data
   */
  const resetAnalytics = useCallback(() => {
    setAnalyticsData({
      pageVisits: 0,
      ctaClicks: {
        navbar: 0,
        hero: 0,
        featuresSection: 0,
        pricingSection: 0,
      },
      timestamps: [],
    });
    localStorage.removeItem('financino_analytics');
    console.log('[Analytics] Analytics reset');
  }, []);

  return {
    trackCTAClick,
    trackPageVisit,
    calculateCTR,
    getAnalyticsSummary,
    resetAnalytics,
    analyticsData,
  };
};

export default useAnalytics;
