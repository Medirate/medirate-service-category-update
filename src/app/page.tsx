"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown, LayoutGrid, LayoutList, Search } from "lucide-react";

// State mapping
const stateMap: { [key: string]: string } = {
  ALABAMA: "AL",
  ALASKA: "AK",
  ARIZONA: "AZ",
  ARKANSAS: "AR",
  CALIFORNIA: "CA",
  COLORADO: "CO",
  CONNECTICUT: "CT",
  DELAWARE: "DE",
  FLORIDA: "FL",
  GEORGIA: "GA",
  HAWAII: "HI",
  IDAHO: "ID",
  ILLINOIS: "IL",
  INDIANA: "IN",
  IOWA: "IA",
  KANSAS: "KS",
  KENTUCKY: "KY",
  LOUISIANA: "LA",
  MAINE: "ME",
  MARYLAND: "MD",
  MASSACHUSETTS: "MA",
  MICHIGAN: "MI",
  MINNESOTA: "MN",
  MISSISSIPPI: "MS",
  MISSOURI: "MO",
  MONTANA: "MT",
  NEBRASKA: "NE",
  NEVADA: "NV",
  "NEW HAMPSHIRE": "NH",
  "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM",
  "NEW YORK": "NY",
  "NORTH CAROLINA": "NC",
  "NORTH DAKOTA": "ND",
  OHIO: "OH",
  OKLAHOMA: "OK",
  OREGON: "OR",
  PENNSYLVANIA: "PA",
  "RHODE ISLAND": "RI",
  "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD",
  TENNESSEE: "TN",
  TEXAS: "TX",
  UTAH: "UT",
  VERMONT: "VT",
  VIRGINIA: "VA",
  WASHINGTON: "WA",
  "WEST VIRGINIA": "WV",
  WISCONSIN: "WI",
  WYOMING: "WY",
};

// Include reverse mapping for easier access
const reverseStateMap = Object.fromEntries(
  Object.entries(stateMap).map(([key, value]) => [value, key])
);

// Service Line options
const serviceLines = [
  "ALL PROVIDER TYPES/SERVICE LINES",
  "AMBULANCE/MEDICAL TRANSPORTATION",
  "AMBULATORY SURGERY CENTER",
  "ANESTHESIA",
  "APPLIED BEHAVIORAL ANALYSIS/EARLY INTERVENTION",
  "BEHAVIORAL HEALTH AND/OR SUBSTANCE USE DISORDER TREATMENT",
  "BRAIN INJURY",
  "COMMUNITY HEALTH WORKERS",
  "DENTAL",
  "DIAGNOSTIC IMAGING",
  "DURABLE MEDICAL EQUIPMENT (DME)",
  "FAMILY PLANNING",
  "FQHC/RHC",
  "HOME AND COMMUNITY BASED SERVICES",
  "HOME HEALTH",
  "HOSPICE",
  "HOSPITAL",
  "INTELLECTUAL AND DEVELOPMENTAL DISABILITY (IDD) SERVICES",
  "LABORATORY",
  "MANAGED CARE",
  "MATERNAL HEALTH",
  "MEDICAL SUPPLIES",
  "NURSE",
  "NURSING FACILITY",
  "NUTRITION",
  "PHARMACY",
  "PHYSICIAN",
  "PHYSICIAN ADMINISTERED DRUGS",
  "PRESCRIBED PEDIATRIC EXTENDED CARE (PPEC)",
  "PRESCRIPTION DRUGS",
  "PRIVATE DUTY NURSING",
  "SOCIAL SERVICES",
  "TELEMEDICINE & REMOTE PATIENT MONITORING (RPM)",
  "THERAPY: OT, PT, ST",
  "VISION",
  "GENERAL MEDICAID",
  "340B",
];

interface Alert {
  subject: string;
  announcement_date: string;
  state?: string | null;
  link?: string | null;
  service_lines_impacted?: string | null;
  service_lines_impacted_1?: string | null;
  service_lines_impacted_2?: string | null;
  service_lines_impacted_3?: string | null;
  summary?: string;
}

interface Bill {
  id: number;
  state: string;
  bill_number: string;
  name: string;
  last_action: string | null;
  action_date: string | null;
  sponsor_list: string[] | string | null;
  bill_progress: string | null;
  url: string;
  service_lines_impacted?: string | null;
  service_lines_impacted_1?: string | null;
  service_lines_impacted_2?: string | null;
  service_lines_impacted_3?: string | null;
  ai_summary: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}

function CustomDropdown({ value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="w-full px-4 py-2 bg-[#4682d1] rounded-md text-white focus:outline-none cursor-pointer flex justify-between items-center"
           onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption?.label || placeholder}</span>
        <div className="flex items-center">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="mr-2 hover:text-gray-200 focus:outline-none cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
          )}
          <span>▼</span>
        </div>
      </div>
      {isOpen && (
        <div className="absolute w-full mt-1 bg-[#4682d1] border border-[#4682d1] rounded-md shadow-lg z-50">
          <div className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 cursor-pointer hover:bg-[#004aad] text-white"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
}) {
  return (
    <div className="flex items-center w-full">
      <div className="flex items-center w-full px-4 py-2 bg-[#4682d1] rounded-md">
        <Search size={20} className="text-white mr-2" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none placeholder-white text-white focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SearchableDropdown({ options, value, onChange, placeholder, disabled }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative w-full" ref={ref}>
      <input
        className="border px-2 py-1 rounded w-full cursor-pointer"
        value={value}
        onChange={e => { setSearch(e.target.value); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-2 text-gray-400">No results</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${opt === value ? 'bg-blue-200' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [providerAlerts, setProviderAlerts] = useState<Alert[]>([]);
  const [legislativeUpdates, setLegislativeUpdates] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'announcement_date', direction: 'desc' });
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [activeTable, setActiveTable] = useState<"provider" | "legislative">("provider");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [providerSearch, setProviderSearch] = useState<string>("");
  const [legislativeSearch, setLegislativeSearch] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedServiceLine, setSelectedServiceLine] = useState<string>("");
  const [selectedBillProgress, setSelectedBillProgress] = useState<string>("");
  const [showNoServiceCategoryOnly, setShowNoServiceCategoryOnly] = useState(false);
  const [editingProviderLink, setEditingProviderLink] = useState<string | null>(null);
  const [editingProviderLines, setEditingProviderLines] = useState<string[]>(["", "", "", ""]);
  const [editingBillUrl, setEditingBillUrl] = useState<string | null>(null);
  const [editingBillLinesMap, setEditingBillLinesMap] = useState<{ [url: string]: string[] }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [editingProviderLinkRow, setEditingProviderLinkRow] = useState<string | null>(null);
  const [providerEditRow, setProviderEditRow] = useState<Partial<Alert>>({});
  const [editingBillUrlRow, setEditingBillUrlRow] = useState<string | null>(null);
  const [billEditRow, setBillEditRow] = useState<Partial<Bill>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [providerResponse, legislativeResponse] = await Promise.all([
          fetch('/api/rate-updates'),
          fetch('/api/legislative-updates')
        ]);

        if (!providerResponse.ok || !legislativeResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [providerData, legislativeData] = await Promise.all([
          providerResponse.json(),
          legislativeResponse.json()
        ]);

        setProviderAlerts(providerData);
        setLegislativeUpdates(legislativeData);
      } catch (err) {
        setError('Failed to load updates. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch service categories
    fetch('/api/service-categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setServiceCategories(data.map((row: { categories: string }) => row.categories)))
      .catch(() => setServiceCategories([]));
  }, []);

  const toggleSort = (field: string) => {
    setSortDirection(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const searchInFields = (searchText: string, fields: (string | null | undefined)[]): boolean => {
    const normalizedSearch = searchText.toLowerCase().trim();
    if (!normalizedSearch) return true;
    
    return fields.some(field => 
      field?.toLowerCase().includes(normalizedSearch)
    );
  };

  const sortedProviderAlerts = [...providerAlerts].sort((a, b) => {
    if (sortDirection.field === 'state') {
      if (a.state && b.state) {
        return sortDirection.direction === 'asc' ? a.state.localeCompare(b.state) : b.state.localeCompare(a.state);
      }
    } else if (sortDirection.field === 'announcement_date') {
      const dateA = a.announcement_date ? new Date(a.announcement_date).getTime() : 0;
      const dateB = b.announcement_date ? new Date(b.announcement_date).getTime() : 0;
      return sortDirection.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const sortedLegislativeUpdates = [...legislativeUpdates].sort((a, b) => {
    if (sortDirection.field === 'state') {
      const stateA = a.state || "";
      const stateB = b.state || "";
      return sortDirection.direction === 'asc' ? stateA.localeCompare(stateB) : stateB.localeCompare(stateA);
    } else if (sortDirection.field === 'action_date') {
      const dateA = a.action_date ? new Date(a.action_date).getTime() : 0;
      const dateB = b.action_date ? new Date(b.action_date).getTime() : 0;
      return sortDirection.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const isNoServiceCategory = (lines: (string | null | undefined)[]) =>
    lines.every(line => !line || line === "NULL");

  const filteredProviderAlerts = sortedProviderAlerts.filter((alert) => {
    const matchesSearch = !providerSearch || searchInFields(providerSearch, [
      alert.subject
    ]);
    const matchesState = !selectedState || 
      alert.state === reverseStateMap[selectedState];
    const matchesServiceLine = !selectedServiceLine || 
      [
        alert.service_lines_impacted,
        alert.service_lines_impacted_1,
        alert.service_lines_impacted_2,
        alert.service_lines_impacted_3,
      ].some(line => line?.includes(selectedServiceLine));
    const matchesNoServiceCategory = !showNoServiceCategoryOnly || isNoServiceCategory([
      alert.service_lines_impacted,
      alert.service_lines_impacted_1,
      alert.service_lines_impacted_2,
      alert.service_lines_impacted_3,
    ]);
    return matchesSearch && matchesState && matchesServiceLine && matchesNoServiceCategory;
  });

  const filteredLegislativeUpdates = sortedLegislativeUpdates.filter((bill) => {
    const matchesSearch = !legislativeSearch || searchInFields(legislativeSearch, [
      bill.name,
      bill.bill_number,
      bill.last_action,
      ...(Array.isArray(bill.sponsor_list) ? bill.sponsor_list : [bill.sponsor_list])
    ]);
    const matchesState = !selectedState || 
      bill.state === selectedState;
    const matchesServiceLine = !selectedServiceLine || 
      [
        bill.service_lines_impacted,
        bill.service_lines_impacted_1,
        bill.service_lines_impacted_2,
        bill.service_lines_impacted_3
      ].some(line => line?.includes(selectedServiceLine));
    const matchesBillProgress = !selectedBillProgress || 
      bill.bill_progress?.includes(selectedBillProgress);
    const matchesNoServiceCategory = !showNoServiceCategoryOnly || isNoServiceCategory([
      bill.service_lines_impacted,
      bill.service_lines_impacted_1,
      bill.service_lines_impacted_2,
      bill.service_lines_impacted_3,
    ]);
    return matchesSearch && matchesState && matchesServiceLine && matchesBillProgress && matchesNoServiceCategory;
  });

  // Save handler for provider alerts
  async function saveProviderLines(link: string) {
    setSaveError(null);
    setSaveStatus(null);
    const [l0, l1, l2, l3] = editingProviderLines;
    setProviderAlerts(alerts => alerts.map(a => a.link === link ? { ...a, service_lines_impacted: l0, service_lines_impacted_1: l1, service_lines_impacted_2: l2, service_lines_impacted_3: l3 } : a));
    setEditingProviderLink(null);
    try {
      const res = await fetch("/api/update-service-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "provider_alerts",
          link,
          service_lines_impacted: l0,
          service_lines_impacted_1: l1,
          service_lines_impacted_2: l2,
          service_lines_impacted_3: l3,
        })
      });
      if (!res.ok) throw new Error("Failed to update");
      setSaveStatus('success');
    } catch (e) {
      setSaveError("Failed to save changes. Please try again.");
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }

  // Save handler for legislative updates
  async function saveBillLines(url: string) {
    setSaveError(null);
    const bill = legislativeUpdates.find(b => b.url === url);
    const lines = editingBillLinesMap[url] || ["", "", "", ""];
    console.log('saveBillLines called for url:', url, 'id:', bill?.id, 'lines:', lines);
    console.log('legislativeUpdates before:', legislativeUpdates.map(b => ({ url: b.url, id: b.id, service_lines_impacted: b.service_lines_impacted, service_lines_impacted_1: b.service_lines_impacted_1, service_lines_impacted_2: b.service_lines_impacted_2, service_lines_impacted_3: b.service_lines_impacted_3 })));
    setLegislativeUpdates(bills => {
      const updated = bills.map(b =>
        b.url === url
          ? { ...b, service_lines_impacted: lines[0], service_lines_impacted_1: lines[1], service_lines_impacted_2: lines[2], service_lines_impacted_3: lines[3] }
          : b
      );
      console.log('legislativeUpdates after:', updated.map(b => ({ url: b.url, id: b.id, service_lines_impacted: b.service_lines_impacted, service_lines_impacted_1: b.service_lines_impacted_1, service_lines_impacted_2: b.service_lines_impacted_2, service_lines_impacted_3: b.service_lines_impacted_3 })));
      return updated;
    });
    setEditingBillUrl(null);
    setEditingBillLinesMap(map => { const m = { ...map }; delete m[url]; return m; });
    try {
      const res = await fetch("/api/update-service-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "bills_test_by_dev",
          url,
          service_lines_impacted: lines[0],
          service_lines_impacted_1: lines[1],
          service_lines_impacted_2: lines[2],
          service_lines_impacted_3: lines[3],
        })
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (e) {
      setSaveError("Failed to save changes. Please try again.");
    }
  }

  async function handleAddCategory() {
    setCatError(null);
    if (!newCategory.trim()) return;
    setCatLoading(true);
    try {
      const res = await fetch('/api/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory.trim() })
      });
      if (!res.ok) throw new Error('Failed to add category');
      setServiceCategories(cats => [...cats, newCategory.trim()]);
      setNewCategory("");
    } catch (e) {
      setCatError('Failed to add category');
    } finally {
      setCatLoading(false);
    }
  }

  async function handleDeleteCategory(category: string) {
    setCatError(null);
    setCatLoading(true);
    try {
      const res = await fetch('/api/service-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setServiceCategories(cats => cats.filter(c => c !== category));
    } catch (e) {
      setCatError('Failed to delete category');
    } finally {
      setCatLoading(false);
    }
  }

  async function handleEditCategory(oldCategory: string) {
    setCatError(null);
    if (!editingValue.trim()) return;
    setCatLoading(true);
    try {
      const res = await fetch('/api/service-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCategory, newCategory: editingValue.trim() })
      });
      if (!res.ok) throw new Error('Failed to edit category');
      setServiceCategories(cats => cats.map(c => c === oldCategory ? editingValue.trim() : c));
      setEditingCategory(null);
      setEditingValue("");
    } catch (e) {
      setCatError('Failed to edit category');
    } finally {
      setCatLoading(false);
    }
  }

  // Add delete handler for provider alerts
  async function handleDeleteProviderAlert(link: string | null | undefined) {
    if (!link) return;
    if (!confirm(`Are you sure you want to delete entry with link ${link}?`)) return;
    try {
      const res = await fetch('/api/delete-master-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'provider_alerts', link })
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProviderAlerts(alerts => alerts.filter(a => a.link !== link));
    } catch (e) {
      setSaveError('Failed to delete entry.');
    }
  }

  // Add delete handler for legislative updates
  async function handleDeleteBill(url: string) {
    if (!url) return;
    if (!confirm(`Are you sure you want to delete entry with url ${url}?`)) return;
    try {
      const res = await fetch('/api/delete-master-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'bills_test_by_dev', url })
      });
      if (!res.ok) throw new Error('Failed to delete');
      setLegislativeUpdates(bills => bills.filter(b => b.url !== url));
    } catch (e) {
      setSaveError('Failed to delete entry.');
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Category Update</h1>
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-[#004aad] text-white rounded-md hover:bg-[#003d8c] transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
      {/* Search Bars and Filters Container */}
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#004aad" }}>
        <div className="flex flex-col gap-4">
          {/* Search Bars Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Provider Search */}
            <div className="flex-1 min-w-0">
              <SearchBar
                value={providerSearch}
                onChange={setProviderSearch}
                placeholder="Search Provider Alerts by subject"
              />
    </div>

            {/* Legislative Search */}
            <div className="flex-1 min-w-0">
              <SearchBar
                value={legislativeSearch}
                onChange={setLegislativeSearch}
                placeholder="Search Legislative Updates by Bill Name or Bill Number"
      />
    </div>
  </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <CustomDropdown
                value={selectedState}
                onChange={setSelectedState}
                options={[
                  { value: "", label: "All States" },
                  ...Object.entries(stateMap).map(([name, code]) => ({
                    value: code,
                    label: `${name} [${code}]`
                  }))
                ]}
                placeholder="All States"
              />
            </div>

            <div className="flex-1 min-w-0">
              <CustomDropdown
                value={selectedServiceLine}
                onChange={setSelectedServiceLine}
                options={[
                  { value: "", label: "All Service Lines" },
                  ...serviceLines.map(line => ({
                    value: line,
                    label: line
                  }))
                ]}
                placeholder="All Service Lines"
              />
            </div>

            {activeTable === "legislative" && (
              <div className="flex-1 min-w-0">
                <CustomDropdown
                  value={selectedBillProgress}
                  onChange={setSelectedBillProgress}
                  options={[
                    { value: "", label: "All Bill Progress" },
                    { value: "Introduced", label: "Introduced" },
                    { value: "In Committee", label: "In Committee" },
                    { value: "Passed", label: "Passed" },
                    { value: "Failed", label: "Failed" },
                    { value: "Vetoed", label: "Vetoed" },
                    { value: "Enacted", label: "Enacted" }
                  ]}
                  placeholder="All Bill Progress"
                />
              </div>
            )}
          </div>
          {/* New button for no service category filter */}
          <div className="mt-4">
            <button
              className={`px-4 py-2 rounded font-semibold transition-colors ${showNoServiceCategoryOnly ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-800`}
              onClick={() => setShowNoServiceCategoryOnly(v => !v)}
            >
              {showNoServiceCategoryOnly ? 'Show All Entries' : 'Show Only Entries With No Service Category'}
            </button>
          </div>
        </div>
      </div>

      {/* Layout Toggle Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setLayout("vertical")}
            className={`p-2 rounded-md flex items-center ${
              layout === "vertical" ? "bg-[#004aad] text-white" : "bg-gray-200"
            }`}
            style={{ height: "40px" }}
          >
            <LayoutGrid size={20} className="mr-2" />
            <span>Vertical Layout</span>
          </button>
          <button
            onClick={() => setLayout("horizontal")}
            className={`p-2 rounded-md flex items-center ${
              layout === "horizontal" ? "bg-[#004aad] text-white" : "bg-gray-200"
            }`}
            style={{ height: "40px" }}
          >
            <LayoutList size={20} className="mr-2" />
            <span>Horizontal Layout</span>
          </button>
        </div>

        {/* Table Switch */}
        <div className={`flex items-center space-x-2 ${
          layout === "horizontal" ? "visible" : "invisible"
        }`}>
          <span className="text-sm text-gray-700">Provider Alerts</span>
          <button
            onClick={() =>
              setActiveTable(activeTable === "provider" ? "legislative" : "provider")
            }
            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
            style={{ backgroundColor: "#004aad" }}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                activeTable === "provider" ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">Legislative Updates</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : layout === "vertical" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider Alerts Table */}
          <div>
            <h2 className="text-xl font-semibold text-[#012C61] mb-2">Provider Alerts</h2>
            <div className="border rounded-md max-h-[600px] overflow-y-auto bg-gray-50 shadow-lg">
              <table className="min-w-full bg-white border-collapse">
                <thead className="sticky top-0 bg-white shadow">
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('state')}>
                      State
                      {sortDirection.field === 'state' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('announcement_date')}>
                      Announcement Date
                      {sortDirection.field === 'announcement_date' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Subject</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Service Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviderAlerts.map((alert, index) => {
                    const rowKey = `${alert.link || ''}-${index}`;
                    return (
                      <tr key={rowKey} className="border-b hover:bg-gray-100">
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-32" value={providerEditRow.state ?? alert.state ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, state: e.target.value }))} />
                          ) : (alert.state || "")}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-32" value={providerEditRow.announcement_date ?? alert.announcement_date ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, announcement_date: e.target.value }))} />
                          ) : (alert.announcement_date || "")}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-64" value={providerEditRow.subject ?? alert.subject ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, subject: e.target.value }))} />
                          ) : (
                            <div className="flex items-center">
                              <span>{alert.subject || ""}</span>
                              {alert.link && (
                                <a href={alert.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">[Read More]</a>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <div className="flex flex-col gap-1">
                              {[0,1,2,3].map(i => (
                                <SearchableDropdown
                                  key={i}
                                  options={serviceCategories}
                                  value={(providerEditRow as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? (alert as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? ''}
                                  onChange={v => setProviderEditRow(row => ({ ...row, [`service_lines_impacted${i ? `_${i}` : ''}`]: v }))}
                                  placeholder={`Service Line ${i+1}`}
                                  disabled={catLoading}
                                />
                              ))}
                            </div>
                          ) : (
                            [alert.service_lines_impacted, alert.service_lines_impacted_1, alert.service_lines_impacted_2, alert.service_lines_impacted_3].filter(Boolean).join(", ")
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <>
                              <button className="px-2 py-1 bg-green-600 text-white rounded mr-2" onClick={async () => {
                                setCatLoading(true);
                                setCatError(null);
                                try {
                                  const res = await fetch('/api/update-provider-alert', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ link: alert.link, ...providerEditRow })
                                  });
                                  if (!res.ok) throw new Error('Failed to update');
                                  setProviderAlerts(alerts => alerts.map(a => a.link === alert.link ? { ...a, ...providerEditRow } : a));
                                  setEditingProviderLinkRow(null); setProviderEditRow({});
                                } catch (e) { setCatError('Failed to update'); }
                                setCatLoading(false);
                              }}>Save</button>
                              <button className="px-2 py-1 bg-gray-300 rounded mr-2" onClick={() => { setEditingProviderLinkRow(null); setProviderEditRow({}); }}>Cancel</button>
                              <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteProviderAlert(alert.link)}>Delete</button>
                            </>
                          ) : (
                            <>
                              <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditingProviderLinkRow(rowKey); setProviderEditRow(alert); }}>Edit</button>
                              <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteProviderAlert(alert.link)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legislative Updates Table */}
          <div>
            <h2 className="text-xl font-semibold text-[#012C61] mb-2">Legislative Updates</h2>
            <div className="border rounded-md max-h-[600px] overflow-y-auto bg-gray-50 shadow-lg">
              <table className="min-w-full bg-white border-collapse">
                <thead className="sticky top-0 bg-white shadow">
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('state')}>
                      State
                      {sortDirection.field === 'state' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('action_date')}>
                      Action Date
                      {sortDirection.field === 'action_date' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Bill Number</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Bill Name</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Last Action</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Sponsors</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Progress</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Service Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLegislativeUpdates.map((bill) => (
                    <tr key={bill.url} className="border-b hover:bg-gray-100">
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.state ?? bill.state ?? ''} onChange={e => setBillEditRow(row => ({ ...row, state: e.target.value }))} />
                        ) : (reverseStateMap[bill.state] || bill.state)}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.action_date ?? bill.action_date ?? ''} onChange={e => setBillEditRow(row => ({ ...row, action_date: e.target.value }))} />
                        ) : (bill.action_date ? new Date(bill.action_date).toLocaleDateString() : "")}
                      </td>
                      <td className="p-4 text-sm text-blue-500 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-24" value={billEditRow.bill_number ?? bill.bill_number ?? ''} onChange={e => setBillEditRow(row => ({ ...row, bill_number: e.target.value }))} />
                        ) : (
                          <a href={bill.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{bill.bill_number}</a>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={billEditRow.name ?? bill.name ?? ''} onChange={e => setBillEditRow(row => ({ ...row, name: e.target.value }))} />
                        ) : bill.name}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={billEditRow.last_action ?? bill.last_action ?? ''} onChange={e => setBillEditRow(row => ({ ...row, last_action: e.target.value }))} />
                        ) : bill.last_action}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={Array.isArray(billEditRow.sponsor_list) ? billEditRow.sponsor_list.join(', ') : billEditRow.sponsor_list ?? (Array.isArray(bill.sponsor_list) ? bill.sponsor_list.join(', ') : bill.sponsor_list) ?? ''} onChange={e => setBillEditRow(row => ({ ...row, sponsor_list: e.target.value }))} />
                        ) : (Array.isArray(bill.sponsor_list) ? bill.sponsor_list.join(", ") : bill.sponsor_list || "")}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.bill_progress ?? bill.bill_progress ?? ''} onChange={e => setBillEditRow(row => ({ ...row, bill_progress: e.target.value }))} />
                        ) : bill.bill_progress}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <div className="flex flex-col gap-1">
                            {[0,1,2,3].map(i => (
                              <SearchableDropdown
                                key={i}
                                options={serviceCategories}
                                value={(billEditRow as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? (bill as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? ''}
                                onChange={v => setBillEditRow(row => ({ ...row, [`service_lines_impacted${i ? `_${i}` : ''}`]: v }))}
                                placeholder={`Service Line ${i+1}`}
                                disabled={catLoading}
                              />
                            ))}
                          </div>
                        ) : (
                          [bill.service_lines_impacted, bill.service_lines_impacted_1, bill.service_lines_impacted_2, bill.service_lines_impacted_3].filter(Boolean).join(", ")
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <>
                            <button className="px-2 py-1 bg-green-600 text-white rounded mr-2" onClick={async () => {
                              setCatLoading(true);
                              setCatError(null);
                              try {
                                const res = await fetch('/api/update-bill', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ url: bill.url, ...billEditRow })
                                });
                                if (!res.ok) throw new Error('Failed to update');
                                setLegislativeUpdates(bills => bills.map(b => b.url === bill.url ? { ...b, ...billEditRow } : b));
                                setEditingBillUrlRow(null); setBillEditRow({});
                              } catch (e) { setCatError('Failed to update'); }
                              setCatLoading(false);
                            }}>Save</button>
                            <button className="px-2 py-1 bg-gray-300 rounded mr-2" onClick={() => { setEditingBillUrlRow(null); setBillEditRow({}); }}>Cancel</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteBill(bill.url)}>Delete</button>
                          </>
                        ) : (
                          <>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditingBillUrlRow(bill.url); setBillEditRow(bill); }}>Edit</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteBill(bill.url)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* Table Heading */}
          <h2 className="text-xl font-semibold text-[#012C61] mb-2">
            {activeTable === "provider" ? "Provider Alerts" : "Legislative Updates"}
          </h2>

          {/* Tables Container with Animation */}
          <div className="flex transition-transform duration-300 ease-in-out" style={{
            transform: `translateX(${activeTable === "provider" ? "0%" : "-100%"})`
          }}>
            {/* Provider Alerts Table */}
            <div className="min-w-full border rounded-md max-h-[600px] overflow-y-auto bg-gray-50 shadow-lg relative">
              <table className="min-w-full bg-white border-collapse">
                <thead className="sticky top-0 bg-white shadow">
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('state')}>
                      State
                      {sortDirection.field === 'state' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('announcement_date')}>
                      Announcement Date
                      {sortDirection.field === 'announcement_date' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Subject</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Service Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviderAlerts.map((alert, index) => {
                    const rowKey = `${alert.link || ''}-${index}`;
                    return (
                      <tr key={rowKey} className="border-b hover:bg-gray-100">
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-32" value={providerEditRow.state ?? alert.state ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, state: e.target.value }))} />
                          ) : (alert.state || "")}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-32" value={providerEditRow.announcement_date ?? alert.announcement_date ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, announcement_date: e.target.value }))} />
                          ) : (alert.announcement_date || "")}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <input className="border px-2 py-1 rounded w-64" value={providerEditRow.subject ?? alert.subject ?? ''} onChange={e => setProviderEditRow(row => ({ ...row, subject: e.target.value }))} />
                          ) : (
                            <div className="flex items-center">
                              <span>{alert.subject || ""}</span>
                              {alert.link && (
                                <a href={alert.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">[Read More]</a>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <div className="flex flex-col gap-1">
                              {[0,1,2,3].map(i => (
                                <SearchableDropdown
                                  key={i}
                                  options={serviceCategories}
                                  value={(providerEditRow as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? (alert as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? ''}
                                  onChange={v => setProviderEditRow(row => ({ ...row, [`service_lines_impacted${i ? `_${i}` : ''}`]: v }))}
                                  placeholder={`Service Line ${i+1}`}
                                  disabled={catLoading}
                                />
                              ))}
                            </div>
                          ) : (
                            [alert.service_lines_impacted, alert.service_lines_impacted_1, alert.service_lines_impacted_2, alert.service_lines_impacted_3].filter(Boolean).join(", ")
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-700 border-b">
                          {editingProviderLinkRow === rowKey ? (
                            <>
                              <button className="px-2 py-1 bg-green-600 text-white rounded mr-2" onClick={async () => {
                                setCatLoading(true);
                                setCatError(null);
                                try {
                                  const res = await fetch('/api/update-provider-alert', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ link: alert.link, ...providerEditRow })
                                  });
                                  if (!res.ok) throw new Error('Failed to update');
                                  setProviderAlerts(alerts => alerts.map(a => a.link === alert.link ? { ...a, ...providerEditRow } : a));
                                  setEditingProviderLinkRow(null); setProviderEditRow({});
                                } catch (e) { setCatError('Failed to update'); }
                                setCatLoading(false);
                              }}>Save</button>
                              <button className="px-2 py-1 bg-gray-300 rounded mr-2" onClick={() => { setEditingProviderLinkRow(null); setProviderEditRow({}); }}>Cancel</button>
                              <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteProviderAlert(alert.link)}>Delete</button>
                            </>
                          ) : (
                            <>
                              <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditingProviderLinkRow(rowKey); setProviderEditRow(alert); }}>Edit</button>
                              <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteProviderAlert(alert.link)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legislative Updates Table */}
            <div className="min-w-full border rounded-md max-h-[600px] overflow-y-auto bg-gray-50 shadow-lg relative">
              <table className="min-w-full bg-white border-collapse">
                <thead className="sticky top-0 bg-white shadow">
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('state')}>
                      State
                      {sortDirection.field === 'state' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b cursor-pointer"
                        onClick={() => toggleSort('action_date')}>
                      Action Date
                      {sortDirection.field === 'action_date' && (sortDirection.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Bill Number</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Bill Name</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Last Action</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Sponsors</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Progress</th>
                    <th className="text-left p-4 font-semibold text-sm text-[#012C61] border-b">Service Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLegislativeUpdates.map((bill) => (
                    <tr key={bill.url} className="border-b hover:bg-gray-100">
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.state ?? bill.state ?? ''} onChange={e => setBillEditRow(row => ({ ...row, state: e.target.value }))} />
                        ) : (reverseStateMap[bill.state] || bill.state)}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.action_date ?? bill.action_date ?? ''} onChange={e => setBillEditRow(row => ({ ...row, action_date: e.target.value }))} />
                        ) : (bill.action_date ? new Date(bill.action_date).toLocaleDateString() : "")}
                      </td>
                      <td className="p-4 text-sm text-blue-500 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-24" value={billEditRow.bill_number ?? bill.bill_number ?? ''} onChange={e => setBillEditRow(row => ({ ...row, bill_number: e.target.value }))} />
                        ) : (
                          <a href={bill.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{bill.bill_number}</a>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={billEditRow.name ?? bill.name ?? ''} onChange={e => setBillEditRow(row => ({ ...row, name: e.target.value }))} />
                        ) : bill.name}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={billEditRow.last_action ?? bill.last_action ?? ''} onChange={e => setBillEditRow(row => ({ ...row, last_action: e.target.value }))} />
                        ) : bill.last_action}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-64" value={Array.isArray(billEditRow.sponsor_list) ? billEditRow.sponsor_list.join(', ') : billEditRow.sponsor_list ?? (Array.isArray(bill.sponsor_list) ? bill.sponsor_list.join(', ') : bill.sponsor_list) ?? ''} onChange={e => setBillEditRow(row => ({ ...row, sponsor_list: e.target.value }))} />
                        ) : (Array.isArray(bill.sponsor_list) ? bill.sponsor_list.join(", ") : bill.sponsor_list || "")}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <input className="border px-2 py-1 rounded w-32" value={billEditRow.bill_progress ?? bill.bill_progress ?? ''} onChange={e => setBillEditRow(row => ({ ...row, bill_progress: e.target.value }))} />
                        ) : bill.bill_progress}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <div className="flex flex-col gap-1">
                            {[0,1,2,3].map(i => (
                              <SearchableDropdown
                                key={i}
                                options={serviceCategories}
                                value={(billEditRow as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? (bill as any)[`service_lines_impacted${i ? `_${i}` : ''}`] ?? ''}
                                onChange={v => setBillEditRow(row => ({ ...row, [`service_lines_impacted${i ? `_${i}` : ''}`]: v }))}
                                placeholder={`Service Line ${i+1}`}
                                disabled={catLoading}
                              />
                            ))}
                          </div>
                        ) : (
                          [bill.service_lines_impacted, bill.service_lines_impacted_1, bill.service_lines_impacted_2, bill.service_lines_impacted_3].filter(Boolean).join(", ")
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-700 border-b">
                        {editingBillUrlRow === bill.url ? (
                          <>
                            <button className="px-2 py-1 bg-green-600 text-white rounded mr-2" onClick={async () => {
                              setCatLoading(true);
                              setCatError(null);
                              try {
                                const res = await fetch('/api/update-bill', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ url: bill.url, ...billEditRow })
                                });
                                if (!res.ok) throw new Error('Failed to update');
                                setLegislativeUpdates(bills => bills.map(b => b.url === bill.url ? { ...b, ...billEditRow } : b));
                                setEditingBillUrlRow(null); setBillEditRow({});
                              } catch (e) { setCatError('Failed to update'); }
                              setCatLoading(false);
                            }}>Save</button>
                            <button className="px-2 py-1 bg-gray-300 rounded mr-2" onClick={() => { setEditingBillUrlRow(null); setBillEditRow({}); }}>Cancel</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteBill(bill.url)}>Delete</button>
                          </>
                        ) : (
                          <>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditingBillUrlRow(bill.url); setBillEditRow(bill); }}>Edit</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDeleteBill(bill.url)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </div>
              </div>
      )}

      {/* Popup for AI Summary */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-2">Summary</h3>
            <p className="text-gray-700">{popupContent}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-[#004aad] hover:bg-[#003d8c] text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
                </div>
              </div>
      )}

      {/* Optionally, display saveError if present */}
      {saveError && <div className="text-red-600 font-semibold my-2">{saveError}</div>}

      {/* Animated save status message above the tables */}
      <div
        className={`
          transition-all duration-500 ease-in-out transform
          ${saveStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
          ${saveStatus === 'success' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : ''}
          font-semibold my-2 pointer-events-none select-none h-6 flex items-center justify-center
        `}
      >
        {saveStatus === 'success' && 'Saved successfully!'}
        {saveStatus === 'error' && 'Failed to save changes.'}
          </div>

      {/* Service Categories List Table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Service Categories List</h2>
        <div className="flex items-center gap-2 mb-4">
          <input
            className="border px-2 py-1 rounded w-64"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Add new category"
            disabled={catLoading}
          />
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleAddCategory}
            disabled={catLoading || !newCategory.trim()}
          >
            Add
          </button>
          {catError && <span className="text-red-600 ml-2">{catError}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[300px] border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceCategories.map((cat, idx) => (
                <tr key={cat}>
                  <td className="border border-gray-200 px-4 py-2">
                    {editingCategory === cat ? (
                      <input
                        className="border px-2 py-1 rounded w-64"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        disabled={catLoading}
                      />
                    ) : (
                      cat
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {editingCategory === cat ? (
                      <>
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded mr-2 disabled:opacity-50"
                          onClick={() => handleEditCategory(cat)}
                          disabled={catLoading || !editingValue.trim()}
                        >Save</button>
                        <button
                          className="px-2 py-1 bg-gray-300 rounded"
                          onClick={() => { setEditingCategory(null); setEditingValue(""); }}
                          disabled={catLoading}
                        >Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 disabled:opacity-50"
                          onClick={() => { setEditingCategory(cat); setEditingValue(cat); }}
                          disabled={catLoading}
                        >Edit</button>
                        <button
                          className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={catLoading}
                        >Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}