"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface SearchAndFilterProps {
  agencySlug: string;
}

export default function SearchAndFilter({ agencySlug }: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current filter values from URL
  const search = searchParams.get("search") || "";
  const transmission = searchParams.get("transmission") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const minSeats = searchParams.get("minSeats") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "price-asc";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [localSearch, setLocalSearch] = useState(search);
  const [localTransmission, setLocalTransmission] = useState(transmission);
  const [localFuelType, setLocalFuelType] = useState(fuelType);
  const [localMinSeats, setLocalMinSeats] = useState(minSeats);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  // Sync local state with URL params
  useEffect(() => {
    setLocalSearch(search);
    setLocalTransmission(transmission);
    setLocalFuelType(fuelType);
    setLocalMinSeats(minSeats);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSortBy(sortBy);
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [search, transmission, fuelType, minSeats, minPrice, maxPrice, sortBy, startDate, endDate, searchParams]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (localSearch) params.set("search", localSearch);
    if (localTransmission) params.set("transmission", localTransmission);
    if (localFuelType) params.set("fuelType", localFuelType);
    if (localMinSeats) params.set("minSeats", localMinSeats);
    if (localMinPrice) params.set("minPrice", localMinPrice);
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    if (localSortBy && localSortBy !== "price-asc") params.set("sortBy", localSortBy);
    if (localStartDate) params.set("startDate", localStartDate);
    if (localEndDate) params.set("endDate", localEndDate);

    router.push(`/${agencySlug}?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocalTransmission("");
    setLocalFuelType("");
    setLocalMinSeats("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSortBy("price-asc");
    setLocalStartDate("");
    setLocalEndDate("");
    router.push(`/${agencySlug}`);
  };

  const hasActiveFilters = 
    search || transmission || fuelType || minSeats || minPrice || maxPrice || 
    (sortBy && sortBy !== "price-asc") || startDate || endDate;

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by make, model, or year..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters();
              }
            }}
            className="input pr-12"
          />
          <button
            onClick={updateFilters}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Transmission Filter */}
            <div>
              <label className="label">Transmission</label>
              <select
                value={localTransmission}
                onChange={(e) => setLocalTransmission(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div>
              <label className="label">Fuel Type</label>
              <select
                value={localFuelType}
                onChange={(e) => setLocalFuelType(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Min Seats Filter */}
            <div>
              <label className="label">Min Seats</label>
              <select
                value={localMinSeats}
                onChange={(e) => setLocalMinSeats(e.target.value)}
                className="input"
              >
                <option value="">Any</option>
                <option value="2">2+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="7">7+</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="label">Sort By</label>
              <select
                value={localSortBy}
                onChange={(e) => setLocalSortBy(e.target.value)}
                className="input"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest</option>
                <option value="year-asc">Year: Oldest</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="label">Price Range (per day)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min price"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max price"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="input"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Availability Dates */}
          <div>
            <label className="label">Check Availability</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="input"
                  min={localStartDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button onClick={clearFilters} className="btn-secondary">
              Clear
            </button>
            <button onClick={updateFilters} className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

