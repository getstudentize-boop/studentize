import { College } from "../types";
import { CollapsibleSection, StatCard } from "../components";

export function FinancesTab({ college }: { college: College }) {
  const pellGrantRate = college.pellGrantRate
    ? college.pellGrantRate.toFixed(1)
    : null;
  const federalLoanRate = college.federalLoanRate
    ? college.federalLoanRate.toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Tuition & Costs */}
      {college.tuitionOutOfState && (
        <CollapsibleSection title="Tuition & Costs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Tuition (Out of State)"
              value={`$${college.tuitionOutOfState.toLocaleString()}`}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Family Income */}
      {(college.medianFamilyIncome || college.avgFamilyIncome) && (
        <CollapsibleSection title="Family Income">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {college.medianFamilyIncome && (
              <StatCard
                label="Median Family Income"
                value={`$${college.medianFamilyIncome.toLocaleString()}`}
              />
            )}
            {college.avgFamilyIncome && (
              <StatCard
                label="Average Family Income"
                value={`$${college.avgFamilyIncome.toLocaleString()}`}
              />
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Financial Aid & Debt */}
      {(pellGrantRate ||
        federalLoanRate ||
        college.medianDebt ||
        college.plusLoanDebtMedian) && (
        <CollapsibleSection title="Financial Aid & Debt">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pellGrantRate && (
              <StatCard label="Pell Grant Rate" value={`${pellGrantRate}%`} />
            )}
            {federalLoanRate && (
              <StatCard label="Federal Loan Rate" value={`${federalLoanRate}%`} />
            )}
            {college.medianDebt && (
              <StatCard
                label="Median Student Debt"
                value={`$${college.medianDebt.toLocaleString()}`}
              />
            )}
            {college.plusLoanDebtMedian && (
              <StatCard
                label="Plus Loan Debt (Median)"
                value={`$${college.plusLoanDebtMedian.toLocaleString()}`}
              />
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Cost of Living */}
      {college.costOfLiving && (
        <CollapsibleSection title="Cost of Living">
          <div className="border border-zinc-200 rounded-lg p-4 bg-white">
            <p className="text-sm text-zinc-700 leading-relaxed">
              {college.costOfLiving}
            </p>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
