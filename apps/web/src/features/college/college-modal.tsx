import { useState } from "react";
import {
  MapPin,
  GraduationCap,
  X,
  CurrencyDollar,
  Users,
  House,
  Info,
  AddressBook,
  Eye,
} from "@phosphor-icons/react";
import { College } from "./types";
import {
  GeneralTab,
  OverviewTab,
  AdmissionsTab,
  AcademicsTab,
  FinancesTab,
  CampusLifeTab,
  ContactTab,
} from "./tabs";

const MODAL_TABS = [
  { id: "general", label: "General", icon: House },
  { id: "overview", label: "Overview", icon: Eye },
  { id: "admissions", label: "Admissions", icon: GraduationCap },
  { id: "academics", label: "Academics", icon: Info },
  { id: "finances", label: "Finances", icon: CurrencyDollar },
  { id: "campus-life", label: "Campus Life", icon: Users },
  { id: "contact", label: "Contact", icon: AddressBook },
] as const;

type ModalTab = (typeof MODAL_TABS)[number]["id"];

// Get selectivity label and color
const getSelectivity = (rate: number) => {
  if (rate < 0.1)
    return { label: "Highly Selective", color: "bg-blue-600 text-white" };
  if (rate < 0.2)
    return { label: "Very Selective", color: "bg-blue-500 text-white" };
  if (rate < 0.4)
    return { label: "Selective", color: "bg-blue-100 text-blue-700" };
  return { label: "Accessible", color: "bg-zinc-100 text-zinc-700" };
};

export function CollegeModal({
  college,
  onClose,
}: {
  college: College;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>("general");

  const name = college.schoolName;
  const location =
    college.schoolCity && college.schoolState
      ? `${college.schoolCity}, ${college.schoolState}`
      : college.schoolState || college.schoolCity || "—";

  const selectivity = college.admissionRate
    ? getSelectivity(college.admissionRate)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <X size={18} className="text-zinc-600" />
        </button>

        <div className="overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 pr-8">
                  {name}
                </h2>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{location}</span>
                </div>
              </div>
              {selectivity && (
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${selectivity.color} whitespace-nowrap`}
                >
                  {selectivity.label}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 sticky top-0 bg-white z-10">
            <div className="flex px-6 gap-1 overflow-x-auto no-scrollbar">
              {MODAL_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" && <GeneralTab college={college} />}
            {activeTab === "overview" && <OverviewTab college={college} />}
            {activeTab === "admissions" && <AdmissionsTab college={college} />}
            {activeTab === "academics" && <AcademicsTab college={college} />}
            {activeTab === "finances" && <FinancesTab college={college} />}
            {activeTab === "campus-life" && <CampusLifeTab college={college} />}
            {activeTab === "contact" && <ContactTab college={college} />}
          </div>
        </div>
      </div>
    </div>
  );
}
