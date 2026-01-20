// services/emiService.js

// This mirrors the logic likely found in Ecommerce_FL_React/src/services/emiService.js
// based on the fallback behavior described in EMIOffers.jsx

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

  getDefaultEMIOffers(price) {
    if (!price || price < 3000) return { offers: [] }; // No EMI for small amounts

    return {
      status: "success",
      offers: this.banks.map((bank) => {
        const isBajaj = bank.id === "bajaj";
        let options = [];

        if (isBajaj) {
          // Bajaj usually has 3, 6, 9 months No Cost
          options = [
            { tenure_months: 3, interest_rate: 0, is_no_cost: true },
            { tenure_months: 6, interest_rate: 0, is_no_cost: true },
          ];
        } else {
          // Standard Credit Card EMIs
          options = [
            { tenure_months: 3, interest_rate: 13, is_no_cost: price > 10000 }, // Maybe No Cost for expensive items
            { tenure_months: 6, interest_rate: 14, is_no_cost: price > 30000 },
            { tenure_months: 9, interest_rate: 15, is_no_cost: false },
            { tenure_months: 12, interest_rate: 15, is_no_cost: false },
            { tenure_months: 18, interest_rate: 16, is_no_cost: false },
            { tenure_months: 24, interest_rate: 16, is_no_cost: false },
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
          logo_url: bank.logo,
          emi_options: emiOptions,
        };
      }),
    };
  }
}

export default new EMIService();
