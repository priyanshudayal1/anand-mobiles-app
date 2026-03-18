// services/bankOfferService.js

import api from "./api";

/**
 * BankOfferService - Fetches bank discount/cashback offers from backend API
 */
class BankOfferService {
  /**
   * Get active bank offers for a given price/product
   * @param {number} price
   * @param {string|null} productId
   */
  static async getBankOffers(price, productId = null) {
    try {
      const params = { price };
      if (productId) params.product_id = productId;
      const response = await api.get("/admin/bank-offers/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching bank offers:", error);
      return this.getDefaultBankOffers(price);
    }
  }

  /**
   * Fallback static bank offers when API is unavailable
   */
  static getDefaultBankOffers(price = 0) {
    const defaults = [
      {
        offer_id: "flipkart-axis-credit",
        bank_name: "Flipkart Axis",
        bank_code: "UTIB",
        logo_url: null,
        offer_title: "₹4,000 off",
        offer_description: "Cashback",
        card_types: ["credit"],
        min_amount: 5000,
        max_amount: 500000,
        is_active: true,
        is_best_value: true,
      },
      {
        offer_id: "kotak-credit",
        bank_name: "Kotak",
        bank_code: "KOTAK",
        logo_url: null,
        offer_title: "₹1,500 off",
        offer_description: "",
        card_types: ["credit"],
        min_amount: 5000,
        max_amount: 500000,
        is_active: true,
        is_best_value: false,
      },
      {
        offer_id: "flipkart-sbi-credit",
        bank_name: "Flipkart SBI",
        bank_code: "SBI",
        logo_url: null,
        offer_title: "₹4,000 off",
        offer_description: "Cashback",
        card_types: ["credit"],
        min_amount: 5000,
        max_amount: 500000,
        is_active: true,
        is_best_value: false,
      },
      {
        offer_id: "flipkart-axis-debit",
        bank_name: "Flipkart Axis",
        bank_code: "UTIB",
        logo_url: null,
        offer_title: "₹750 off",
        offer_description: "Cashback",
        card_types: ["debit"],
        min_amount: 5000,
        max_amount: 500000,
        is_active: true,
        is_best_value: false,
      },
    ];

    const filtered =
      price > 0
        ? defaults.filter((o) => price >= o.min_amount && price <= o.max_amount)
        : defaults;

    return { status: "success", price, offers: filtered, source: "fallback" };
  }
}

export default BankOfferService;
