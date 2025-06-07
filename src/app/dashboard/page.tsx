"use client";

import { useEffect, useState, useMemo, useRef, useId } from "react";
import AppLayout from "@/app/components/applayout";
import { FaSpinner, FaExclamationCircle, FaChevronDown, FaFilter } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useData, ServiceData } from "@/context/DataContext";
import CodeDefinitionsIcon from '@/app/components/CodeDefinitionsIcon';
import Select from 'react-select';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Update the useClickOutside hook to use HTMLDivElement
const useClickOutside = (ref: React.RefObject<HTMLDivElement | null>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const FilterNote = ({ step }: { step: number }) => {
  const messages = [
    "Please select a Service Line to begin filtering",
    "Now select a State to continue",
    "Select a Service Code, Service Description, or Fee Schedule Date to complete filtering"
  ];

  // Don't show message if we're past step 3
  if (step > 3) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-700">
        {messages[step - 1]}
      </p>
    </div>
  );
};

export default function Dashboard() {
  // Update useData destructuring to include refreshFilters
  const { data, loading, error, filterOptions, refreshData, refreshFilters } = useData();

  // Filter states
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedServiceCode, setSelectedServiceCode] = useState("");
  const [selectedServiceDescription, setSelectedServiceDescription] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedLocationRegion, setSelectedLocationRegion] = useState("");
  const [selectedModifier, setSelectedModifier] = useState("");
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2017, 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [localError, setLocalError] = useState<string | null>(null);

  // Visibility states for dropdowns
  const [showServiceCategoryDropdown, setShowServiceCategoryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showServiceCodeDropdown, setShowServiceCodeDropdown] = useState(false);
  const [showServiceDescriptionDropdown, setShowServiceDescriptionDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showLocationRegionDropdown, setShowLocationRegionDropdown] = useState(false);
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);

  // Unique filter options
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [serviceCodes, setServiceCodes] = useState<string[]>([]);
  const [serviceDescriptions, setServiceDescriptions] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [locationRegions, setLocationRegions] = useState<string[]>([]);
  const [providerTypes, setProviderTypes] = useState<string[]>([]);
  const [modifiers, setModifiers] = useState<{ value: string; label: string }[]>([]);

  // Calculate dynamic height based on window size
  const [visibleRows, setVisibleRows] = useState(5); // Default to a minimum number of rows

  // Add refs for each dropdown
  const serviceCategoryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const serviceCodeRef = useRef<HTMLDivElement>(null);
  const serviceDescriptionRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const locationRegionRef = useRef<HTMLDivElement>(null);
  const modifierRef = useRef<HTMLDivElement>(null);

  // Use the click-outside hook for each dropdown
  useClickOutside(serviceCategoryRef, () => setShowServiceCategoryDropdown(false));
  useClickOutside(stateRef, () => setShowStateDropdown(false));
  useClickOutside(serviceCodeRef, () => setShowServiceCodeDropdown(false));
  useClickOutside(serviceDescriptionRef, () => setShowServiceDescriptionDropdown(false));
  useClickOutside(programRef, () => setShowProgramDropdown(false));
  useClickOutside(locationRegionRef, () => setShowLocationRegionDropdown(false));
  useClickOutside(modifierRef, () => setShowModifierDropdown(false));

  const areFiltersApplied = selectedState;

  // Add new state for selected year
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Add a state to track the current step
  const [filterStep, setFilterStep] = useState(1);

  // Add Fee Schedule Dates Dropdown
  const [selectedFeeScheduleDate, setSelectedFeeScheduleDate] = useState("");
  const [feeScheduleDates, setFeeScheduleDates] = useState<string[]>([]);

  // Update useEffect to handle initial filter options
  useEffect(() => {
    if (filterOptions?.serviceCategories) {
      // Deduplicate and sort service categories, but do not change case
      const normalizedCategories = Array.from(
        new Set(
          filterOptions.serviceCategories
            .map(cat => cat?.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));
      setServiceCategories(normalizedCategories);
    }
    if (filterOptions?.states) {
      // Deduplicate and sort states, but do not change case
      const normalizedStates = Array.from(
        new Set(
          filterOptions.states
            .map(state => state?.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));
      setStates(normalizedStates);
    }
  }, [filterOptions]);

  // Place this useEffect immediately after all useState declarations
  useEffect(() => {
    if (filterOptions) {
      setServiceCodes(filterOptions.serviceCodes || []);
      setServiceDescriptions(filterOptions.serviceDescriptions || []);
      setPrograms(filterOptions.programs || []);
      setLocationRegions(filterOptions.locationRegions || []);
      setProviderTypes(filterOptions.providerTypes || []);
    }
  }, [filterOptions]);

  // Move the parseDate function here, before filteredData
  const parseDate = (dateString: string | null) => {
    if (!dateString) return null; // Skip null or undefined dates

    if (!isNaN(Number(dateString))) {
      const serialDate = Number(dateString);
      const date = new Date(Date.UTC(1900, 0, serialDate - 1)); // Convert serial date to Date object
      if (isNaN(date.getTime())) {
        return null; // Skip invalid serial dates
      }
      return date;
    }

    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) {
      return null; // Skip invalid date formats
    }

    const month = parseInt(dateParts[0], 10) - 1; // Months are 0-based in JavaScript
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      return null; // Skip invalid date parts
    }

    const date = new Date(Date.UTC(year, month, day));
    if (isNaN(date.getTime())) {
      return null; // Skip invalid dates
    }

    return date;
  };

  // Now the filteredData useMemo hook can safely use parseDate
  const filteredData = useMemo(() => {
    if (!selectedState) return [];
    
    console.log('=== Filtering Data ===');
    console.log('Initial data length:', data.length);

    let filtered = data;

    // Apply additional filters if they are selected
    if (selectedServiceCode) {
      filtered = filtered.filter(item => item.service_code?.trim() === selectedServiceCode.trim());
    }

    if (selectedServiceDescription) {
      filtered = filtered.filter(item => item.service_description?.trim() === selectedServiceDescription.trim());
    }

    if (selectedProgram) {
      filtered = filtered.filter(item => item.program?.trim() === selectedProgram.trim());
    }

    if (selectedLocationRegion) {
      filtered = filtered.filter(item => item.location_region?.trim() === selectedLocationRegion.trim());
    }

    if (selectedProviderType) {
      filtered = filtered.filter(item => item.provider_type?.trim() === selectedProviderType.trim());
    }

      if (selectedModifier) {
        const selectedModifierCode = selectedModifier.split(' - ')[0];
      filtered = filtered.filter(item => 
          (item.modifier_1 && item.modifier_1.split(' - ')[0] === selectedModifierCode) ||
          (item.modifier_2 && item.modifier_2.split(' - ')[0] === selectedModifierCode) ||
          (item.modifier_3 && item.modifier_3.split(' - ')[0] === selectedModifierCode) ||
        (item.modifier_4 && item.modifier_4.split(' - ')[0] === selectedModifierCode)
      );
    }

    // Apply date filters
    filtered = filtered.filter(item => {
      const parsedDate = parseDate(item.rate_effective_date);
      if (!parsedDate) return true;

      if (selectedFeeScheduleDate) {
        const itemDate = parsedDate.toISOString().split('T')[0];
        return itemDate === selectedFeeScheduleDate;
      }

      if (selectedYear) {
        return parsedDate.getFullYear() === selectedYear;
      }

      if (startDate && endDate) {
        return parsedDate >= startDate && parsedDate <= endDate;
      }

      return true;
    });

    return filtered;
  }, [
    data,
    selectedState,
    selectedServiceCode,
    selectedServiceDescription,
    selectedProgram,
    selectedLocationRegion,
    selectedModifier,
    selectedProviderType,
    selectedFeeScheduleDate,
    selectedYear,
    startDate,
    endDate
  ]);

  // Update the sortConfig state initialization
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }[]>([]);

  // Update the handleSort function
  const handleSort = (key: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    setSortConfig(prev => {
      const isCtrlPressed = event.ctrlKey;
      const existingSort = prev.find(sort => sort.key === key);
      const existingIndex = prev.findIndex(sort => sort.key === key);
      
      if (existingSort) {
        // If it's any sort (primary or secondary) and Ctrl isn't pressed
        if (!isCtrlPressed) {
          // If already descending, remove the sort
          if (existingSort.direction === 'desc') {
            return prev.filter(sort => sort.key !== key);
          }
          // Otherwise, toggle direction
          return prev.map((sort, i) => 
            i === existingIndex ? { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' } : sort
          );
        }
        // If Ctrl is pressed and it's a secondary sort, toggle its direction
        if (existingIndex > 0) {
          return prev.map((sort, i) => 
            i === existingIndex ? { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' } : sort
          );
        }
        // Remove if it's a secondary sort with Ctrl pressed
        return prev.filter(sort => sort.key !== key);
      }
      
      // Add new sort
      const newSort = { key, direction: 'asc' as const };
      
      if (isCtrlPressed) {
        return [...prev, newSort];
      }
      
      return [newSort];
    });
    
    // Add animation class
    const header = event.currentTarget;
    header.classList.add('sort-animation');
    setTimeout(() => {
      header.classList.remove('sort-animation');
    }, 200);
  };

  // Update the SortIndicator component
  const SortIndicator = ({ sortKey }: { sortKey: string }) => {
    const sort = sortConfig.find(sort => sort.key === sortKey);
    if (!sort) return null;
    
    return (
      <span className="ml-1 sort-indicator">
        <span className="arrow" style={{ 
          display: 'inline-block',
          transition: 'transform 0.2s ease',
          transform: sort.direction === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)'
        }}>
          ▲
        </span>
        {sortConfig.length > 1 && (
          <sup className="sort-priority">
            {sortConfig.findIndex(s => s.key === sortKey) + 1}
          </sup>
        )}
      </span>
    );
  };

  // Update the sortedData calculation
  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const sort of sortConfig) {
        let valueA: string | number | Date = a[sort.key] || '';
        let valueB: string | number | Date = b[sort.key] || '';
        
        // Handle numeric strings
        if (typeof valueA === 'string' && !isNaN(Number(valueA))) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        }
        
        // Handle dates
        if (sort.key === 'rate_effective_date') {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }
        
        if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 200; // Approximate height of header and other elements
      const rowHeight = 50; // Approximate height of each row
      const maxRows = Math.floor((windowHeight - headerHeight) / rowHeight);
      
      setVisibleRows(maxRows); // Show all rows that fit
    };

    calculateTableHeight(); // Initial calculation

    const handleResize = () => {
      calculateTableHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // Add data analysis
      console.log('=== Data Analysis ===');
      console.log('Total data items:', data.length);
      
      // Check specifically for ABA
      const abaData = data.filter(item => 
        item.service_category?.trim().toUpperCase() === 'APPLIED BEHAVIOR ANALYSIS'
      );
      console.log('ABA entries:', abaData.length);
      if (abaData.length > 0) {
        console.log('Sample ABA entries:', abaData.slice(0, 3));
        console.log('States with ABA:', 
          [...new Set(abaData.map(item => item.state_name?.trim().toUpperCase()))].sort()
        );
      }

      // Check all service categories
      const allCategories = [...new Set(data.map(item => item.service_category?.trim().toUpperCase()))].filter(Boolean);
      console.log('All available service categories:', allCategories);
      
      // Check data for each category
      allCategories.forEach(category => {
        const categoryData = data.filter(item => 
          item.service_category?.trim().toUpperCase() === category
        );
        console.log(`Category "${category}":`, {
          count: categoryData.length,
          sampleStates: [...new Set(categoryData.map(item => item.state_name?.trim().toUpperCase()))].slice(0, 3),
          sampleServiceCodes: [...new Set(categoryData.map(item => item.service_code?.trim()))].slice(0, 3)
        });
      });
      
      extractFilters(data);
    }
  }, [data]);

  useEffect(() => {
    console.log('Total data:', data.length);
    console.log('Filtered data:', filteredData.length);
  }, [data, filteredData]);

  // Update ErrorMessage component to handle null
  const ErrorMessage = ({ error }: { error: string | null }) => {
    if (!error) return null;
    
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
        <div className="flex items-center">
          <FaExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  };

  const extractFilters = (data: ServiceData[]) => {
    // Get service categories
    const categories = data
      .map((item) => item.service_category?.trim())
      .filter((category): category is string => !!category);
    const uniqueCategories = [...new Set(categories)].sort((a, b) => a.localeCompare(b));
    console.log('Available service categories (with string details):', 
      uniqueCategories.map(cat => ({
        category: cat,
        length: cat.length,
        charCodes: Array.from(cat).map(c => c.charCodeAt(0))
      }))
    );
    setServiceCategories(uniqueCategories);

    // Get states
    const states = data
      .map((item) => item.state_name?.trim().toUpperCase())
      .filter((state): state is string => !!state);
    setStates([...new Set(states)].sort((a, b) => a.localeCompare(b)));

    // Get provider types
    const types = data
      .map((item) => item.provider_type?.trim())
      .filter((type): type is string => !!type);
    setProviderTypes([...new Set(types)].sort((a, b) => a.localeCompare(b)));
  };

  const toggleDropdown = (dropdownSetter: React.Dispatch<React.SetStateAction<boolean>>, otherSetters: React.Dispatch<React.SetStateAction<boolean>>[]) => {
    // Close all other dropdowns
    otherSetters.forEach(setter => setter(false));
    // Toggle the current dropdown
    dropdownSetter(prev => !prev);
  };

  const handleServiceCategoryChange = async (category: string) => {
    console.log('=== Service Category Change ===');
    console.log('Selected category:', category);
    
    setSelectedServiceCategory(category);
    setSelectedState("");
    setSelectedServiceCode("");
    setSelectedServiceDescription("");
    setSelectedProgram("");
    setSelectedLocationRegion("");
    setSelectedModifier("");
    setSelectedProviderType("");
    setFilterStep(2);

    // Reset all dependent filter options
    setStates([]);
    setServiceCodes([]);
    setServiceDescriptions([]);
    setPrograms([]);
    setLocationRegions([]);
    setModifiers([]);
    setProviderTypes([]);

    // Get states for this category
    await refreshFilters(category);
    
    // Update states dropdown
    setStates(filterOptions.states);
  };

  // Add a function to extract filter options from data
  const extractFilterOptionsFromData = (data: ServiceData[]) => {
    // Get unique service codes
    const uniqueServiceCodes = [...new Set(data
      .map(item => item.service_code?.trim())
      .filter((code): code is string => typeof code === 'string' && code.length > 0)
    )].sort() as string[];
    setServiceCodes(uniqueServiceCodes);

    // Get unique service descriptions
    const uniqueDescriptions = [...new Set(data
      .map(item => item.service_description?.trim())
      .filter((desc): desc is string => typeof desc === 'string' && desc.length > 0)
    )].sort() as string[];
    setServiceDescriptions(uniqueDescriptions);

    // Get unique programs
    const uniquePrograms = [...new Set(data
      .map(item => item.program?.trim())
      .filter((program): program is string => typeof program === 'string' && program.length > 0)
    )].sort() as string[];
    setPrograms(uniquePrograms);

    // Get unique location regions
    const uniqueRegions = [...new Set(data
      .map(item => item.location_region?.trim())
      .filter((region): region is string => typeof region === 'string' && region.length > 0)
    )].sort() as string[];
    setLocationRegions(uniqueRegions);

    // Get unique provider types
    const uniqueProviderTypes = [...new Set(data
      .map(item => item.provider_type?.trim())
      .filter((type): type is string => typeof type === 'string' && type.length > 0)
    )].sort() as string[];
    setProviderTypes(uniqueProviderTypes);

    // Get unique modifiers
    const allModifiers = data.flatMap(item => {
      const modifiers = [];
      if (item.modifier_1) {
        modifiers.push({
          value: item.modifier_1.trim(),
          details: item.modifier_1_details?.trim() || '',
          fullText: `${item.modifier_1.trim()}${item.modifier_1_details ? ` - ${item.modifier_1_details.trim()}` : ''}`
        });
      }
      if (item.modifier_2) {
        modifiers.push({
          value: item.modifier_2.trim(),
          details: item.modifier_2_details?.trim() || '',
          fullText: `${item.modifier_2.trim()}${item.modifier_2_details ? ` - ${item.modifier_2_details.trim()}` : ''}`
        });
      }
      if (item.modifier_3) {
        modifiers.push({
          value: item.modifier_3.trim(),
          details: item.modifier_3_details?.trim() || '',
          fullText: `${item.modifier_3.trim()}${item.modifier_3_details ? ` - ${item.modifier_3_details.trim()}` : ''}`
        });
      }
      if (item.modifier_4) {
        modifiers.push({
          value: item.modifier_4.trim(),
          details: item.modifier_4_details?.trim() || '',
          fullText: `${item.modifier_4.trim()}${item.modifier_4_details ? ` - ${item.modifier_4_details.trim()}` : ''}`
        });
      }
      return modifiers;
    });

    const uniqueModifiers = [...new Set(allModifiers.map(mod => mod.fullText))].map(fullText => {
      const mod = allModifiers.find(m => m.fullText === fullText);
      return {
        value: fullText,
        label: fullText,
        details: mod?.details || ''
      };
    });
    setModifiers(uniqueModifiers);
  };

  // Update the handleStateChange function
  const handleStateChange = async (state: string) => {
    console.log('=== State Change ===');
    console.log('Selected state:', state);
    
    setSelectedState(state);
    setSelectedServiceCode("");
    setSelectedServiceDescription("");
    setSelectedProgram("");
    setSelectedLocationRegion("");
    setSelectedModifier("");
    setSelectedProviderType("");
    setFilterStep(3);

    // Reset dependent filter options
    setServiceCodes([]);
    setServiceDescriptions([]);
      setPrograms([]);
      setLocationRegions([]);
      setModifiers([]);
    setProviderTypes([]);

    try {
      // Load all data for this category + state combination
      await refreshData({
        serviceCategory: selectedServiceCategory,
        state: state
      });

      // Optionally, extract modifiers from the loaded data
      if (data.length > 0) {
        extractFilterOptionsFromData(data);
      }
    } catch (error) {
      console.error('Error loading state data:', error);
      setLocalError('Failed to load state data. Please try again.');
    }
  };

  const handleServiceCodeChange = async (code: string) => {
    console.log('=== Service Code Change ===');
    console.log('Selected code:', code);
    
    setSelectedServiceCode(code);
    setSelectedServiceDescription("");
    setSelectedProgram("");
    setSelectedLocationRegion("");
    setSelectedModifier("");
    setSelectedProviderType("");
    setFilterStep(4);

    // Reset dependent filter options
    setServiceDescriptions([]);
    setPrograms([]);
    setLocationRegions([]);
    setModifiers([]);
    setProviderTypes([]);

    // Refresh data with new filters
    await refreshData({
      serviceCategory: selectedServiceCategory,
      state: selectedState,
      serviceCode: code
    });

    // Update filter options from the response
    if (filterOptions) {
      setServiceDescriptions(filterOptions.serviceDescriptions);
      setPrograms(filterOptions.programs);
      setLocationRegions(filterOptions.locationRegions);
      setProviderTypes(filterOptions.providerTypes);
    }
  };

  const handleServiceDescriptionChange = async (desc: string) => {
    console.log('=== Service Description Change ===');
    console.log('Selected description:', desc);
    
    setSelectedServiceDescription(desc);
    setSelectedServiceCode("");
    setSelectedProgram("");
    setSelectedLocationRegion("");
    setSelectedModifier("");
    setSelectedProviderType("");
    setFilterStep(4);

    // Reset dependent filter options
    setServiceCodes([]);
    setPrograms([]);
    setLocationRegions([]);
    setModifiers([]);
    setProviderTypes([]);

    // Refresh data with new filters
    await refreshData({
      serviceCategory: selectedServiceCategory,
      state: selectedState,
      serviceDescription: desc
    });

    // Update filter options from the response
    if (filterOptions) {
      setServiceCodes(filterOptions.serviceCodes);
      setPrograms(filterOptions.programs);
      setLocationRegions(filterOptions.locationRegions);
      setProviderTypes(filterOptions.providerTypes);
    }
  };

  const ClearButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="text-xs text-blue-500 hover:underline mt-1"
    >
      Clear
    </button>
  );

  // Update the resetFilters function
  const resetFilters = async () => {
    setSelectedServiceCategory("");
    setSelectedState("");
    setSelectedServiceCode("");
    setSelectedServiceDescription("");
    setSelectedProgram("");
    setSelectedLocationRegion("");
    setSelectedModifier("");
    setSelectedFeeScheduleDate("");
    setStartDate(null);
    setEndDate(null);
    setServiceCodes([]);
    setStates([]);
    setPrograms([]);
    setLocationRegions([]);
    setModifiers([]);
    setFilterStep(1);

    // Reset to initial filter options
    await refreshFilters();
    
    // Update filter options
    setServiceCategories(filterOptions.serviceCategories);
    setStates(filterOptions.states);
  };

  // Update the dropdown selection logic
  const handleDropdownSelection = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, type: string) => {
    setter(value);
    
    // Call the appropriate handler based on the filter type
    switch (type) {
      case 'serviceCategory':
        handleServiceCategoryChange(value);
        break;
      case 'state':
        handleStateChange(value);
        break;
      case 'serviceCode':
        handleServiceCodeChange(value);
        break;
      case 'program':
        // Add program-specific logic if needed
        break;
      case 'locationRegion':
        // Add location/region-specific logic if needed
        break;
      case 'modifier':
        // Add modifier-specific logic if needed
        break;
      default:
        break;
    }
    
    // Close all dropdowns
    setShowServiceCategoryDropdown(false);
    setShowStateDropdown(false);
    setShowServiceCodeDropdown(false);
    setShowServiceDescriptionDropdown(false);
    setShowProgramDropdown(false);
    setShowLocationRegionDropdown(false);
    setShowModifierDropdown(false);
  };

  // Update the handleYearSelect function
  const handleYearSelect = (year: number) => {
    if (selectedYear === year) {
      // If clicking the same year, reset to default date range
      setSelectedYear(null);
      setStartDate(null);
      setEndDate(null);
    } else {
      // Set the selected year and update date range
      setSelectedYear(year);
      setStartDate(new Date(year, 0, 1)); // January 1st of selected year
      setEndDate(new Date(year, 11, 31)); // December 31st of selected year
    }
  };

  // Update the getVisibleColumns function
  const getVisibleColumns = useMemo(() => {
    const columns = {
      state_name: false,
      service_category: false,
      service_code: false,
      service_description: false,
      program: false,
      location_region: false,
      modifier_1: false,
      modifier_2: false,
      modifier_3: false,
      modifier_4: false,
      duration_unit: false,
      rate: false,
      rate_per_hour: false,
      rate_effective_date: false,
      provider_type: false
    };

    if (filteredData.length > 0) {
      filteredData.forEach(item => {
        const rateStr = (item.rate || '').replace('$', '');
        const rate = parseFloat(rateStr);
        const durationUnit = item.duration_unit?.toUpperCase();
        
        if (!isNaN(rate) && 
            (durationUnit === '15 MINUTES' || 
             durationUnit === '30 MINUTES' || 
             durationUnit === 'PER HOUR')) {
          columns.rate_per_hour = true;
        }
        
        Object.keys(columns).forEach((key) => {
          const columnKey = key as keyof typeof columns;
          if (item[columnKey] && item[columnKey] !== '-') {
            columns[columnKey] = true;
          }
        });
      });
    }

    return columns;
  }, [filteredData]);

  // Create a utility function to format text
  const formatText = (text: string | null | undefined) => {
    return text || '-';
  };

  // Inside your Dashboard component, add this before the return statement
  const serviceCategoryId = useId();
  const stateId = useId();
  const serviceCodeId = useId();
  const serviceDescriptionId = useId();
  const programId = useId();
  const locationRegionId = useId();
  const modifierId = useId();

  useEffect(() => {
    if (data.length > 0) {
      // Comment out or remove this line
      // console.log("Raw rate_effective_date values:", data.map(item => item.rate_effective_date));
      extractFeeScheduleDates(data);
    }
  }, [data]);

  const extractFeeScheduleDates = (data: ServiceData[]) => {
    const filteredDates = data
      .filter(item => 
        (!selectedServiceCategory || item.service_category === selectedServiceCategory) &&
        (!selectedState || item.state_name.toUpperCase() === selectedState.toUpperCase()) &&
        (!selectedServiceCode || item.service_code === selectedServiceCode) &&
        (!selectedServiceDescription || item.service_description === selectedServiceDescription)
      )
      .map(item => {
        const parsedDate = parseDate(item.rate_effective_date);
        if (!parsedDate) return null; // Skip invalid dates
        return parsedDate.toISOString().split('T')[0]; // Use ISO format for consistency
      })
      .filter((date): date is string => !!date); // Filter out null values

    // Comment out or remove this line
    // console.log("Extracted Fee Schedule Dates:", filteredDates); // Log the extracted dates
    setFeeScheduleDates([...new Set(filteredDates)].sort((a, b) => a.localeCompare(b)));
  };

  useEffect(() => {
    if (data.length > 0) {
      extractFeeScheduleDates(data);
    }
  }, [data, selectedServiceCategory, selectedState, selectedServiceCode, selectedServiceDescription]);

  // Update the Date Range fields to disable them when a Fee Schedule Date is selected
  const isDateRangeDisabled = !!selectedFeeScheduleDate;

  // Add new state for editing
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<ServiceData>>({});

  // Add save handler
  const handleSave = async (row: ServiceData) => {
    try {
      const res = await fetch('/api/update-master-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: row.id,
          service_category: editRowData.service_category,
          state_name: editRowData.state_name,
          service_code: editRowData.service_code,
          service_description: editRowData.service_description,
          program: editRowData.program,
          location_region: editRowData.location_region,
          provider_type: editRowData.provider_type,
          modifier_1: editRowData.modifier_1,
          rate_effective_date: editRowData.rate_effective_date
        })
      });
      if (!res.ok) throw new Error('Failed to update');
      refreshData();
      setEditingRow(null);
      setEditRowData({});
    } catch (e) {
      setLocalError('Failed to update row');
    }
  };

  // Remove the loading check for authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <AppLayout activeTab="dashboard">
      <CodeDefinitionsIcon />
      <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Error Message */}
        <ErrorMessage error={localError} />

        {/* Heading and Date Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl text-[#012C61] font-lemonMilkRegular uppercase mb-3 sm:mb-0">
            Dashboard
          </h1>
          <div className="flex flex-col items-end">
            {/* Date Range Filter */}
            <div className="flex space-x-4 mb-4" style={{ zIndex: 900 }}>
              <div className="relative">
                <label className="block text-sm font-medium text-[#012C61] mb-2">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 text-gray-700 placeholder-gray-400 ${
                    selectedFeeScheduleDate ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!!selectedFeeScheduleDate}
                  popperClassName="z-[900]" // Adjusted z-index
                  popperModifiers={[
                    {
                      name: 'preventOverflow',
                      options: {
                        rootBoundary: 'viewport',
                        tether: false,
                        altAxis: true,
                      },
                      fn: (state) => state,
                    },
                  ]}
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal"
                />
                {startDate && (
                  <button
                    onClick={() => setStartDate(null)}
                    className="text-xs text-blue-500 hover:underline mt-1"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-[#012C61] mb-2">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 text-gray-700 placeholder-gray-400 ${
                    selectedFeeScheduleDate ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!!selectedFeeScheduleDate}
                  popperClassName="z-[900]" // Adjusted z-index
                  popperModifiers={[
                    {
                      name: 'preventOverflow',
                      options: {
                        rootBoundary: 'viewport',
                        tether: false,
                        altAxis: true,
                      },
                      fn: (state) => state,
                    },
                  ]}
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal"
                />
                {endDate && (
                  <button
                    onClick={() => setEndDate(null)}
                    className="text-xs text-blue-500 hover:underline mt-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {/* Fee Schedule Dates Dropdown */}
            <div className="relative" style={{ zIndex: 800 }}>
              <label className="block text-sm font-medium text-[#012C61] mb-2">Fee Schedule Date</label>
              <Select
                instanceId="feeScheduleDatesId"
                options={feeScheduleDates.map(date => {
                  const dateObj = new Date(date);
                  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                  const day = String(dateObj.getUTCDate()).padStart(2, '0');
                  const year = dateObj.getUTCFullYear();
                  return { value: date, label: `${month}/${day}/${year}` };
                })}
                value={selectedFeeScheduleDate ? { 
                  value: selectedFeeScheduleDate, 
                  label: (() => {
                    const dateObj = new Date(selectedFeeScheduleDate);
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    const year = dateObj.getUTCFullYear();
                    return `${month}/${day}/${year}`;
                  })()
                } : null}
                onChange={(option) => {
                  setSelectedFeeScheduleDate(option?.value || "");
                  if (option?.value) {
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                placeholder="Select Fee Schedule Date"
                isSearchable
                isDisabled={!!startDate || !!endDate}
                className={`react-select-container ${
                  !!startDate || !!endDate ? 'opacity-50' : ''
                }`}
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 800 }), // Adjusted z-index
                }}
              />
              {selectedFeeScheduleDate && (
                <ClearButton onClick={() => setSelectedFeeScheduleDate("")} />
              )}
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() => {
            resetFilters();
            setSelectedYear(null);
          }}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#012C61] text-white rounded-lg hover:bg-blue-800 transition-colors mt-4 sm:mt-0 mb-4"
        >
          Reset All Filters
        </button>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg relative z-40">
          <FilterNote step={filterStep} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Service Category Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Line</label>
              <Select
                instanceId={serviceCategoryId}
                options={serviceCategories.map(category => ({ value: category, label: category }))}
                value={selectedServiceCategory ? { value: selectedServiceCategory, label: selectedServiceCategory } : null}
                onChange={(option) => handleServiceCategoryChange(option?.value || "")}
                placeholder="Select Service Line"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {selectedServiceCategory && (
                <ClearButton onClick={() => handleServiceCategoryChange("")} />
              )}
            </div>

            {/* State Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State</label>
              <Select
                instanceId={stateId}
                // TEMPORARY HACK: Hide CALIFORNIA when BEHAVIORAL HEALTH is selected
                options={
                  (selectedServiceCategory === "BEHAVIORAL HEALTH"
                    ? states.filter(state => state.toUpperCase() !== "CALIFORNIA")
                    : states
                  ).map(state => ({ value: state, label: state }))
                }
                value={selectedState ? { value: selectedState, label: selectedState } : null}
                onChange={(option) => handleStateChange(option?.value || "")}
                placeholder="Select State"
                isSearchable
                isDisabled={!selectedServiceCategory}
                className={`react-select-container ${!selectedServiceCategory ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedState && (
                <ClearButton onClick={() => handleStateChange("")} />
              )}
            </div>

            {/* Service Code Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Code</label>
              <Select
                instanceId={serviceCodeId}
                options={serviceCodes.map(code => ({ value: code, label: code }))}
                value={selectedServiceCode ? { value: selectedServiceCode, label: selectedServiceCode } : null}
                onChange={(option) => {
                  setSelectedServiceCode(option?.value || "");
                  setSelectedServiceDescription("");
                  if (option?.value) {
                    handleServiceCodeChange(option.value);
                  }
                }}
                placeholder="Select Service Code"
                isSearchable
                isDisabled={!selectedState}
                className={`react-select-container ${!selectedState ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedServiceCode && (
                <ClearButton onClick={() => {
                  setSelectedServiceCode("");
                  handleServiceCodeChange("");
                }} />
              )}
            </div>

            {/* Service Description Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Description</label>
              <Select
                instanceId={serviceDescriptionId}
                options={serviceDescriptions.map(desc => ({ value: desc, label: desc }))}
                value={selectedServiceDescription ? { value: selectedServiceDescription, label: selectedServiceDescription } : null}
                onChange={(option) => {
                  setSelectedServiceDescription(option?.value || "");
                  setSelectedServiceCode("");
                  if (option?.value) {
                    handleServiceDescriptionChange(option.value);
                  }
                }}
                placeholder="Select Service Description"
                isSearchable
                isDisabled={!selectedState}
                className={`react-select-container ${!selectedState ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedServiceDescription && (
                <ClearButton onClick={() => {
                  setSelectedServiceDescription("");
                  handleServiceDescriptionChange("");
                }} />
              )}
            </div>

            {/* Program Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Program</label>
              <Select
                instanceId={programId}
                options={programs.map(program => ({ value: program, label: program }))}
                value={selectedProgram ? { value: selectedProgram, label: selectedProgram } : null}
                onChange={(option) => setSelectedProgram(option?.value || "")}
                placeholder="Select Program"
                isSearchable
                isDisabled={!selectedServiceCode && !selectedServiceDescription}
                className={`react-select-container ${!selectedServiceCode && !selectedServiceDescription ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedProgram && (
                <ClearButton onClick={() => setSelectedProgram("")} />
              )}
            </div>

            {/* Location/Region Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location/Region</label>
              <Select
                instanceId={locationRegionId}
                options={locationRegions.map(region => ({ value: region, label: region }))}
                value={selectedLocationRegion ? { value: selectedLocationRegion, label: selectedLocationRegion } : null}
                onChange={(option) => setSelectedLocationRegion(option?.value || "")}
                placeholder="Select Location/Region"
                isSearchable
                isDisabled={!selectedServiceCode && !selectedServiceDescription}
                className={`react-select-container ${!selectedServiceCode && !selectedServiceDescription ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedLocationRegion && (
                <ClearButton onClick={() => setSelectedLocationRegion("")} />
              )}
            </div>

            {/* Modifier Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Modifier</label>
              <Select
                instanceId={modifierId}
                options={modifiers}
                value={selectedModifier ? { value: selectedModifier, label: selectedModifier } : null}
                onChange={(option) => setSelectedModifier(option?.value || "")}
                placeholder="Select Modifier"
                isSearchable
                isDisabled={!selectedServiceCode && !selectedServiceDescription}
                className={`react-select-container ${!selectedServiceCode && !selectedServiceDescription ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedModifier && (
                <ClearButton onClick={() => setSelectedModifier("")} />
              )}
            </div>

            {/* Provider Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Provider Type</label>
              <Select
                instanceId="providerTypeId"
                options={providerTypes.map(type => ({ value: type, label: type }))}
                value={selectedProviderType ? { value: selectedProviderType, label: selectedProviderType } : null}
                onChange={(option) => setSelectedProviderType(option?.value || "")}
                placeholder="Select Provider Type"
                isSearchable
                isDisabled={!selectedServiceCode && !selectedServiceDescription}
                className={`react-select-container ${!selectedServiceCode && !selectedServiceDescription ? 'opacity-50' : ''}`}
                classNamePrefix="react-select"
              />
              {selectedProviderType && (
                <button
                  onClick={() => setSelectedProviderType("")}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sorting Instructions - Show above table when filters aren't applied */}
        {!loading && !areFiltersApplied && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-sm font-semibold text-blue-800">Sorting Instructions</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-1 pl-5 list-disc">
            <li>Click any column header to sort the data</li>
            <li>Click again to toggle between ascending and descending order</li>
            <li>Click a third time to deselect the sort</li>
            <li>Hold <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">Ctrl</kbd> while clicking to apply multiple sort levels</li>
            <li>Sort priority is indicated by numbers next to the sort arrows (1 = primary sort, 2 = secondary sort, etc.)</li>
          </ul>
        </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
            <p className="ml-4 text-gray-600">Loading data...</p>
          </div>
        )}

        {/* Empty State Message */}
        {!loading && !areFiltersApplied && (
          <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <div className="flex justify-center items-center mb-4">
              <FaFilter className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Please select a state to view dashboard data
            </p>
            <p className="text-sm text-gray-500">
              Choose a state to see the dashboard information
            </p>
          </div>
        )}

        {/* Data Table */}
        {!loading && areFiltersApplied && (
          <>
          <div 
            className="rounded-lg shadow-lg bg-white relative z-30 overflow-x-auto"
            style={{ 
              maxHeight: 'calc(100vh - 5.5rem)', 
              overflow: 'auto'
            }}
          >
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-[5.5rem] z-20">
                <tr>
                  {getVisibleColumns.state_name && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('state_name', e)}
                    >
                      State
                      <SortIndicator sortKey="state_name" />
                    </th>
                  )}
                  {getVisibleColumns.service_category && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('service_category', e)}
                    >
                      Service Category
                      <SortIndicator sortKey="service_category" />
                    </th>
                  )}
                  {getVisibleColumns.service_code && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('service_code', e)}
                    >
                      Service Code
                      <SortIndicator sortKey="service_code" />
                    </th>
                  )}
                  {getVisibleColumns.service_description && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('service_description', e)}
                    >
                      Service Description
                      <SortIndicator sortKey="service_description" />
                    </th>
                  )}
                  {getVisibleColumns.duration_unit && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('duration_unit', e)}
                    >
                      Duration Unit
                      <SortIndicator sortKey="duration_unit" />
                    </th>
                  )}
                  {getVisibleColumns.rate && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('rate', e)}
                    >
                      Rate per Base Unit
                      <SortIndicator sortKey="rate" />
                    </th>
                  )}
                  {getVisibleColumns.rate_per_hour && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('rate_per_hour', e)}
                    >
                      Hourly Equivalent Rate
                      <SortIndicator sortKey="rate_per_hour" />
                    </th>
                  )}
                  {getVisibleColumns.rate_effective_date && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('rate_effective_date', e)}
                    >
                      Effective Date
                      <SortIndicator sortKey="rate_effective_date" />
                    </th>
                  )}
                  {getVisibleColumns.modifier_1 && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('modifier_1', e)}
                    >
                      Modifier 1
                      <SortIndicator sortKey="modifier_1" />
                    </th>
                  )}
                  {getVisibleColumns.modifier_2 && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('modifier_2', e)}
                    >
                      Modifier 2
                      <SortIndicator sortKey="modifier_2" />
                    </th>
                  )}
                  {getVisibleColumns.modifier_3 && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('modifier_3', e)}
                    >
                      Modifier 3
                      <SortIndicator sortKey="modifier_3" />
                    </th>
                  )}
                  {getVisibleColumns.modifier_4 && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('modifier_4', e)}
                    >
                      Modifier 4
                      <SortIndicator sortKey="modifier_4" />
                    </th>
                  )}
                  {getVisibleColumns.program && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('program', e)}
                    >
                      Program
                      <SortIndicator sortKey="program" />
                    </th>
                  )}
                  {getVisibleColumns.location_region && (
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={(e) => handleSort('location_region', e)}
                    >
                      Location/Region
                      <SortIndicator sortKey="location_region" />
                    </th>
                  )}
                  {getVisibleColumns.provider_type && (
                      <th
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={(e) => handleSort('provider_type', e)}
                      >
                      Provider Type
                        <SortIndicator sortKey="provider_type" />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <tr key={item.id || index} className="border-b hover:bg-gray-100">
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.service_category ?? item.service_category ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, service_category: e.target.value }))}
                        />
                      ) : item.service_category}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.state ?? item.state ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, state: e.target.value }))}
                        />
                      ) : item.state}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.service_code ?? item.service_code ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, service_code: e.target.value }))}
                        />
                      ) : item.service_code}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-64"
                          value={editRowData.service_description ?? item.service_description ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, service_description: e.target.value }))}
                        />
                      ) : item.service_description}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.program ?? item.program ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, program: e.target.value }))}
                        />
                      ) : item.program}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.location_region ?? item.location_region ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, location_region: e.target.value }))}
                        />
                      ) : item.location_region}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.provider_type ?? item.provider_type ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, provider_type: e.target.value }))}
                        />
                      ) : item.provider_type}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.modifier ?? item.modifier ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, modifier: e.target.value }))}
                        />
                      ) : item.modifier}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editRowData.fee_schedule_date ?? item.fee_schedule_date ?? ''}
                          onChange={e => setEditRowData(data => ({ ...data, fee_schedule_date: e.target.value }))}
                        />
                      ) : item.fee_schedule_date}
                    </td>
                    <td className="p-4 text-sm text-gray-700 border-b">
                      {editingRow === item.id ? (
                        <>
                          <button
                            className="px-2 py-1 bg-green-600 text-white rounded mr-2"
                            onClick={() => handleSave(item)}
                          >
                            Save
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-300 rounded"
                            onClick={() => {
                              setEditingRow(null);
                              setEditRowData({});
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="px-2 py-1 bg-yellow-500 text-white rounded"
                          onClick={() => {
                            if (item.id) {
                              setEditingRow(item.id);
                              setEditRowData(item);
                            }
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {/* Loading State for Initial Load */}
            {loading && !data.length && (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
                <p className="ml-4 text-gray-600">Loading initial data...</p>
              </div>
            )}

            {/* Error Message */}
            {localError && (
              <div className="text-center py-4 text-sm text-red-500">
                {localError}
            </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for select dropdowns */}
      <style jsx>{`
        select {
          appearance: none;
          background-color: white;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233b82f6%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 0.75rem;
        }
        select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        th.sortable {
          cursor: pointer;
          position: relative;
          user-select: none;
          transition: all 0.2s ease;
          padding: 12px 16px;
        }

        th.sortable:hover {
          background-color: #f5f5f5;
          box-shadow: inset 0 -2px 0 #3b82f6;
        }

        th.sortable.active {
          background-color: #e8f0fe;
          font-weight: 600;
          box-shadow: inset 0 -2px 0 #3b82f6;
        }

        .sort-indicator {
          margin-left: 4px;
          font-size: 0.8em;
          color: #666;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
        }

        th.sortable:hover .sort-indicator {
          color: #3b82f6;
        }

        .sort-priority {
          font-size: 0.6em;
          vertical-align: super;
          color: #3b82f6;
          margin-left: 2px;
          font-weight: 500;
          background-color: #e8f0fe;
          padding: 2px 4px;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .arrow {
          transition: transform 0.2s ease;
        }

        .sorted-column {
          background-color: #f8f9fa;
        }

        .sorted-column:hover {
          background-color: #e9ecef;
        }

        .sort-animation {
          animation: sortPulse 0.2s ease;
        }

        @keyframes sortPulse {
          0% { background-color: transparent; }
          50% { background-color: #e8f0fe; }
          100% { background-color: transparent; }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .react-select__menu {
          z-index: 1000;
        }

        .react-datepicker-popper {
          z-index: 1000;
        }

        thead {
          z-index: 50;
          position: sticky;
          top: 0;
        }
      `}</style>
    </AppLayout>
  );
}