import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';

const EMICalculator = ({ propertyPrice, propertyPriceStr }) => {
  // Extract numerical value from price string like "₹ 45.5 Lac" or "₹ 1.2 Cr"
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toLowerCase().replace(/[^0-9.a-z]/g, '');
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return 0;
    
    if (cleanStr.includes('cr')) return num * 10000000;
    if (cleanStr.includes('lac') || cleanStr.includes('lakh') || cleanStr.endsWith('l')) return num * 100000;
    if (cleanStr.includes('k')) return num * 1000;
    return num;
  };

  const resolvedPropertyPrice = Number(propertyPrice) > 0
    ? Number(propertyPrice)
    : parsePrice(propertyPriceStr);

  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(15);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculations = useMemo(() => {
    const downPayment = (resolvedPropertyPrice * downPaymentPct) / 100;
    const principal = resolvedPropertyPrice - downPayment;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    let emi = 0;
    let totalInterest = 0;
    let totalPayment = 0;

    if (principal > 0 && monthlyRate > 0 && totalMonths > 0) {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
      totalPayment = emi * totalMonths;
      totalInterest = totalPayment - principal;
    }

    return {
      principal,
      downPayment,
      emi,
      totalInterest,
      totalPayment
    };
  }, [resolvedPropertyPrice, downPaymentPct, interestRate, tenureYears]);

  return (
    <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm lg:p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-text">EMI Calculator</h2>
          <p className="text-sm font-medium text-muted">Estimate your monthly plot loan payments</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-text">Down Payment ({downPaymentPct}%)</label>
              <span className="text-sm font-extrabold text-primary">{formatCurrency(calculations.downPayment)}</span>
            </div>
            <input 
              type="range" 
              min="10" max="90" step="5"
              value={downPaymentPct} 
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-text">Interest Rate (p.a)</label>
              <span className="text-sm font-extrabold text-primary">{interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="5" max="15" step="0.1"
              value={interestRate} 
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-text">Loan Tenure</label>
              <span className="text-sm font-extrabold text-primary">{tenureYears} Years</span>
            </div>
            <input 
              type="range" 
              min="1" max="30" step="1"
              value={tenureYears} 
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl bg-surface p-6 flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-muted mb-2">Your Monthly EMI</p>
            <p className="text-4xl font-extrabold text-primary">{formatCurrency(calculations.emi)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted">Property Value</span>
              <span className="font-extrabold text-text">{formatCurrency(resolvedPropertyPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted">Down Payment</span>
              <span className="font-extrabold text-text">{formatCurrency(calculations.downPayment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted">Loan Amount</span>
              <span className="font-extrabold text-text">{formatCurrency(calculations.principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-muted">Total Interest</span>
              <span className="font-extrabold text-text">{formatCurrency(calculations.totalInterest)}</span>
            </div>
            <div className="h-px w-full bg-border my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-text">Total Payable</span>
              <span className="font-extrabold text-text">{formatCurrency(calculations.totalPayment)}</span>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-border">
            <div 
              className="bg-primary" 
              style={{ width: `${(calculations.principal / calculations.totalPayment) * 100}%` }}
              title="Loan Amount"
            ></div>
            <div 
              className="bg-secondary" 
              style={{ width: `${(calculations.totalInterest / calculations.totalPayment) * 100}%` }}
              title="Interest"
            ></div>
          </div>
          <div className="mt-3 flex justify-center gap-4 text-xs font-bold text-muted">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary"></span> Loan Amount</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary"></span> Interest</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EMICalculator;
