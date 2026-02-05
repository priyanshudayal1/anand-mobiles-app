// services/emiService.js

import api from "./api";

/**
 * EMI Service - Fetches EMI offers from backend API
 * Uses Firebase-stored bank data with fallback to default rates
 */

class EMIService {
  // Basic banks info
  banks = [
    {
      id: "hdfc",
      name: "HDFC Bank",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888857.png",
    },
    {
      id: "icici",
      name: "ICICI Bank",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888849.png",
    },
    {
      id: "sbi",
      name: "SBI Card",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888879.png",
    },
    {
      id: "axis",
      name: "Axis Bank",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888840.png",
    },
    {
      id: "kotak",
      name: "Kotak Bank",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888859.png",
    },
    {
      id: "bajaj",
      name: "Bajaj Finserv",
      logo: "https://cdn-icons-png.flaticon.com/512/888/888844.png",
    },
  ];

  // Calculate EMI: P * r * (1 + r)^n / ((1 + r)^n - 1)
  // where P is principal, r is rate per month, n is months
  calculateEMI(principal, ratePerAnnum, months) {
    if (ratePerAnnum === 0) return Math.ceil(principal / months);

    const r = ratePerAnnum / 12 / 100;
    const emi =
      (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.ceil(emi);
  }

  /**
   * Get EMI offers from backend API
   * Falls back to default data if API fails
   * @param {number} price - The product price
   * @returns {Promise<Object>} - EMI offers with bank options
   */
  async getEMIOffers(price) {
    try {
      const response = await api.get("/admin/emi/offers/", {
        params: { price },
      });

      if (response.data && response.data.status === "success") {
        return response.data;
      }

      // Fall back if response is not successful
      return this.getDefaultEMIOffers(price);
    } catch (error) {
      console.warn(
        "Error fetching EMI offers from API, using fallback:",
        error.message,
      );
      // Return fallback data if API fails
      return this.getDefaultEMIOffers(price);
    }
  }

  getDefaultEMIOffers(price) {
    if (!price || price < 3000) {
      return {
        status: "success",
        price: price,
        offers: [],
        total_banks: 0,
        emi_available: false,
        message: "EMI available on orders above ₹3,000",
        min_emi_amount: 3000,
        available_card_types: [],
        available_tabs: [],
      };
    }

    const banksWithTypes = [
      {
        id: "hdfc",
        name: "HDFC Bank",
        card_types: ["credit", "debit"],
        min_amount: 3000,
      },
      {
        id: "icici",
        name: "ICICI Bank",
        card_types: ["credit", "debit"],
        min_amount: 2500,
      },
      {
        id: "sbi",
        name: "SBI Card",
        card_types: ["credit"],
        min_amount: 3000,
      },
      {
        id: "axis",
        name: "Axis Bank",
        card_types: ["credit", "debit"],
        min_amount: 2000,
      },
      {
        id: "kotak",
        name: "Kotak Bank",
        card_types: ["credit", "debit"],
        min_amount: 2500,
      },
      {
        id: "bajaj",
        name: "Bajaj Finserv",
        card_types: ["emi_card"],
        min_amount: 3000,
      },
    ];

    const offers = banksWithTypes
      .filter((bank) => price >= bank.min_amount)
      .map((bank) => {
        const isBajaj = bank.id === "bajaj";
        let options = [];

        if (isBajaj) {
          // Bajaj usually has 3, 6, 9 months No Cost
          options = [
            { tenure_months: 3, interest_rate: 0, is_no_cost: true },
            { tenure_months: 6, interest_rate: 0, is_no_cost: true },
            { tenure_months: 9, interest_rate: 0, is_no_cost: true },
            { tenure_months: 12, interest_rate: 0, is_no_cost: true },
          ];
        } else {
          // Standard Credit Card EMIs
          options = [
            { tenure_months: 3, interest_rate: 0, is_no_cost: price > 10000 },
            { tenure_months: 6, interest_rate: 0, is_no_cost: price > 30000 },
            { tenure_months: 9, interest_rate: 12, is_no_cost: false },
            { tenure_months: 12, interest_rate: 13, is_no_cost: false },
            { tenure_months: 18, interest_rate: 14, is_no_cost: false },
            { tenure_months: 24, interest_rate: 15, is_no_cost: false },
          ];
        }

        // Calculate EMI amounts
        const emiOptions = options.map((opt) => ({
          ...opt,
          emi_amount: this.calculateEMI(
            price,
            opt.is_no_cost ? 0 : opt.interest_rate,
            opt.tenure_months,
          ),
          total_interest:
            this.calculateEMI(
              price,
              opt.is_no_cost ? 0 : opt.interest_rate,
              opt.tenure_months,
            ) *
              opt.tenure_months -
            price,
        }));

        return {
          bank_id: bank.id,
          bank_name: bank.name,
          bank_code: bank.id.toUpperCase(),
          logo_url: this.banks.find((b) => b.id === bank.id)?.logo || "",
          card_types: bank.card_types,
          min_amount: bank.min_amount,
          processing_fee: 0,
          processing_fee_type: "fixed",
          emi_options: emiOptions,
        };
      });

    // Collect available card types from offers
    const availableCardTypes = new Set();
    offers.forEach((offer) => {
      offer.card_types.forEach((type) => availableCardTypes.add(type));
    });

    // Card type metadata with display names (matching backend)
    const cardTypeMetadata = {
      emi_card: {
        id: "emi_card",
        name: "EMI Card",
        label: "EMI Card",
        description: "Pre-approved EMI cards like Bajaj Finserv, ZestMoney",
      },
      debit: {
        id: "debit",
        name: "Debit Card EMI",
        label: "Debit Card EMI",
        description: "EMI on select debit cards",
      },
      credit: {
        id: "credit",
        name: "Credit Card EMI",
        label: "Credit Card EMI",
        description: "Standard credit card EMI options",
      },
    };

    // Build available tabs based on what card types are present
    const availableTabs = [];
    const tabOrder = ["emi_card", "debit", "credit"]; // Preferred display order
    tabOrder.forEach((cardType) => {
      if (availableCardTypes.has(cardType)) {
        availableTabs.push(cardTypeMetadata[cardType]);
      }
    });

    return {
      status: "success",
      price: price,
      offers: offers,
      total_banks: offers.length,
      emi_available: offers.length > 0,
      available_card_types: Array.from(availableCardTypes),
      card_type_metadata: cardTypeMetadata,
      available_tabs: availableTabs,
      source: "fallback",
    };
  }
}

export default new EMIService();
