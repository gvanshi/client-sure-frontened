"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Filter,
  Calendar,
  ArrowLeft,
  Mail,
  Linkedin,
  Instagram,
  Facebook,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmailComposer, { EmailData } from "@/components/EmailComposer";
import Axios from "@/utils/Axios";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

interface Lead {
  id: string;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  city?: string;
  country?: string;
  category?: string;
  facebookLink?: string;
  websiteLink?: string;
  googleMapLink?: string;
  instagram?: string;
  addressStreet?: string;
  lastVerifiedAt?: string;
  isAccessedByUser: boolean;
  createdAt: string;
  updatedAt?: string;
  accessedAt?: string;
}

function AccessedLeadsContent() {
  const router = useRouter();
  const [accessedLeads, setAccessedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedEmailLeads, setSelectedEmailLeads] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDefaultType, setEmailDefaultType] = useState<
    "bulk" | "category" | "city" | "country" | "selected"
  >("bulk");
  const [hoveredPhone, setHoveredPhone] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<"all" | "current" | "custom">(
    "all",
  );
  const [customStartPage, setCustomStartPage] = useState(1);
  const [customEndPage, setCustomEndPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const loadAccessedLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10", // Reduced limit as requested
        sortBy,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedCountry) params.append("country", selectedCountry);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await Axios.get(`/leads/accessed?${params.toString()}`);
      setAccessedLeads(response.data.leads);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error loading accessed leads:", error);
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Backend server is not running. Please start the server.");
      } else {
        toast.error("Failed to load leads");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportLead = async (leadId: string) => {
    try {
      const response = await Axios.post(
        "/auth/leads/export",
        { leadId },
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `lead_${leadId}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Lead data exported successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to export lead data");
    }
  };

  const handleBulkExport = async () => {
    if (exportType === "custom") {
      if (customStartPage < 1 || customEndPage < 1) {
        toast.error("Page numbers must be greater than 0");
        return;
      }
      if (customStartPage > customEndPage) {
        toast.error("Start page must be less than or equal to end page");
        return;
      }
      if (customEndPage > totalPages) {
        toast.error(`End page cannot exceed total pages (${totalPages})`);
        return;
      }
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      // Add filters
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedCountry) params.append("country", selectedCountry);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // Add export type specific parameters
      if (exportType === "all") {
        params.append("exportAll", "true");
      } else if (exportType === "current") {
        params.append("page", page.toString());
        params.append("limit", "10");
      } else if (exportType === "custom") {
        params.append("startPage", customStartPage.toString());
        params.append("endPage", customEndPage.toString());
        params.append("limit", "10");
      }

      const response = await Axios.post(
        "/leads/bulk-export",
        { filters: Object.fromEntries(params) },
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      let filename = "accessed_leads_";
      if (exportType === "all") filename += "all";
      else if (exportType === "current") filename += `page_${page}`;
      else filename += `pages_${customStartPage}_to_${customEndPage}`;
      filename += `_${Date.now()}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Leads exported successfully!");
      setShowExportModal(false);
    } catch (error: any) {
      console.error("Export error:", error);
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Backend server is not running. Please start the server.");
      } else {
        toast.error(error.response?.data?.error || "Failed to export leads");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async (data: EmailData) => {
    try {
      if (data.type === "category" && !data.category) {
        toast.error("Please select a category");
        return;
      }
      if (data.type === "city" && !data.city) {
        toast.error("Please select a city");
        return;
      }
      if (data.type === "country" && !data.country) {
        toast.error("Please select a country");
        return;
      }
      if (
        data.type === "selected" &&
        (!data.leadIds || data.leadIds.length === 0)
      ) {
        toast.error("Please select at least one lead");
        return;
      }

      const payload: any = {
        subject: data.subject,
        message: data.message,
        type: data.type,
      };

      if (data.category) payload.category = data.category;
      if (data.city) payload.city = data.city;
      if (data.country) payload.country = data.country;
      if (data.leadIds) payload.leadIds = data.leadIds;
      if (data.cc) payload.cc = data.cc;
      if (data.bcc) payload.bcc = data.bcc;

      const response = await Axios.post("/leads/send-email", payload);
      toast.success(response.data.message || "Emails sent successfully");
      setSelectedEmailLeads([]);
      setShowEmailModal(false);
    } catch (error: any) {
      console.error("Email sending error:", error);
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Backend server is not running. Please start the server.");
      } else {
        toast.error(
          error.response?.data?.error ||
            error.message ||
            "Failed to send emails",
        );
      }
    }
  };

  const handleSelectEmailLead = (id: string) => {
    setSelectedEmailLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id],
    );
  };

  // Reload when any filter changes
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedCategory,
    selectedCity,
    selectedCountry,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    loadAccessedLeads();
  }, [
    page,
    searchTerm,
    selectedCategory,
    selectedCity,
    selectedCountry,
    startDate,
    endDate,
    sortBy,
  ]);

  const cities = Array.from(
    new Set(accessedLeads.map((l) => l.city).filter(Boolean)),
  ) as string[];
  const countries = Array.from(
    new Set(accessedLeads.map((l) => l.country).filter(Boolean)),
  ) as string[];
  const categories = Array.from(
    new Set(accessedLeads.map((l) => l.category).filter(Boolean)),
  ) as string[];

  // Use accessedLeads directly as backend now handles filtering
  const filteredLeads = accessedLeads;

  return (
    <div className="w-full px-2 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Accessed Leads
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all your unlocked leads
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
          {/* <button
            onClick={() => {
              setEmailDefaultType("bulk");
              setShowEmailModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button> */}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accessed leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap w-full">
            <div className="flex items-center gap-2 mb-1 md:mb-0">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="md:hidden text-sm font-medium text-gray-700">
                Filters
              </span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto font-medium"
              >
                <option value="latest">Latest Added</option>
                <option value="default">Default</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0">
              <div className="hidden md:block">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto"
                  placeholder="Start Date"
                />
                <span className="hidden md:inline text-gray-500 text-sm">
                  to
                </span>
                <span className="md:hidden text-center text-gray-500 text-sm">
                  to
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 w-full md:w-auto"
                  placeholder="End Date"
                />
              </div>
            </div>

            {(selectedCountry ||
              selectedCategory ||
              selectedCity ||
              startDate ||
              endDate) && (
              <button
                onClick={() => {
                  setSelectedCity("");
                  setSelectedCountry("");
                  setSelectedCategory("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 mt-2 md:mt-0 w-full md:w-auto text-center"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading accessed leads...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hidden md:block">
            <div className="w-full">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      SELECT
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      LEAD ID
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      NAME
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      CATEGORY
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      COUNTRY
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      CITY
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      PHONE
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      ACCESS DATE
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide min-w-40">
                      SOCIAL LINKS
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-2 py-8 text-center text-sm text-gray-500"
                      >
                        No accessed leads found
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selectedEmailLeads.includes(lead.id)}
                            onChange={() => handleSelectEmailLead(lead.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 font-semibold">
                          {lead.leadId}
                        </td>
                        <td
                          className="px-3 py-3 text-sm font-semibold text-gray-900"
                          title={lead.name}
                        >
                          <div className="max-w-[120px] truncate">
                            {lead.name}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 font-medium">
                          <div className="max-w-[100px] truncate">
                            {lead.category || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 font-medium">
                          <div className="max-w-[80px] truncate">
                            {lead.country || "-"}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 font-medium">
                          <div className="max-w-[80px] truncate">
                            {lead.city || "-"}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 font-medium relative">
                          <div
                            className="max-w-[100px] truncate cursor-pointer"
                            onMouseEnter={() => setHoveredPhone(lead.id)}
                            onMouseLeave={() => setHoveredPhone(null)}
                          >
                            {lead.phone || "-"}
                          </div>
                          {hoveredPhone === lead.id && lead.phone && (
                            <div className="absolute z-50 bg-white text-black px-3 py-2 rounded shadow-lg border border-gray-300 whitespace-nowrap left-0 top-full mt-1">
                              <div className="font-bold text-sm">
                                {lead.phone}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-700 font-medium">
                          <div
                            className="max-w-[120px] truncate"
                            title={
                              lead.accessedAt
                                ? formatDateTime(lead.accessedAt)
                                : "-"
                            }
                          >
                            {formatDate(lead.accessedAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {lead.websiteLink && (
                              <a
                                href={lead.websiteLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Website"
                              >
                                <Globe className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
                              </a>
                            )}
                            {lead.linkedin && (
                              <a
                                href={lead.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-5 h-5 text-blue-700 hover:text-blue-900 cursor-pointer" />
                              </a>
                            )}
                            {lead.facebookLink && (
                              <a
                                href={lead.facebookLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                              >
                                <Facebook className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
                              </a>
                            )}
                            {lead.instagram && (
                              <a
                                href={
                                  lead.instagram.startsWith("http")
                                    ? lead.instagram
                                    : `https://instagram.com/${lead.instagram.replace("@", "")}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                              >
                                <Instagram className="w-5 h-5 text-pink-600 hover:text-pink-800 cursor-pointer" />
                              </a>
                            )}
                            {lead.googleMapLink && (
                              <a
                                href={lead.googleMapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Google Maps"
                              >
                                <MapPin className="w-5 h-5 text-green-600 hover:text-green-800 cursor-pointer" />
                              </a>
                            )}
                            {!lead.websiteLink &&
                              !lead.linkedin &&
                              !lead.facebookLink &&
                              !lead.instagram &&
                              !lead.googleMapLink && (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleExportLead(lead.id)}
                                className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                No accessed leads found
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedEmailLeads.includes(lead.id)}
                        onChange={() => handleSelectEmailLead(lead.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{lead.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {lead.leadId}
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            {lead.category || "No Category"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Location
                      </p>
                      <p className="font-medium text-gray-900 truncate">
                        {lead.city && lead.country
                          ? `${lead.city}, ${lead.country}`
                          : lead.city || lead.country || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Access Date
                      </p>
                      <p className="font-medium text-gray-900">
                        {lead.accessedAt ? formatDate(lead.accessedAt) : "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 uppercase">Contact</p>
                      <p className="font-medium text-gray-900">
                        {lead.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3">
                      {lead.websiteLink && (
                        <a
                          href={lead.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Website"
                        >
                          <Globe className="w-5 h-5 text-blue-600" />
                        </a>
                      )}
                      {lead.linkedin && (
                        <a
                          href={lead.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-5 h-5 text-blue-700" />
                        </a>
                      )}
                      {lead.facebookLink && (
                        <a
                          href={lead.facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Facebook"
                        >
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </a>
                      )}
                      {lead.instagram && (
                        <a
                          href={
                            lead.instagram.startsWith("http")
                              ? lead.instagram
                              : `https://instagram.com/${lead.instagram.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instagram"
                        >
                          <Instagram className="w-5 h-5 text-pink-600" />
                        </a>
                      )}
                      {lead.googleMapLink && (
                        <a
                          href={lead.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Google Maps"
                        >
                          <MapPin className="w-5 h-5 text-green-600" />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportLead(lead.id)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmailLeads([lead.id]);
                          setEmailDefaultType("selected");
                          setShowEmailModal(true);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                title="First Page"
              >
                <span className="hidden md:inline">First</span>
                <span className="md:hidden">
                  <ChevronsLeft className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                title="Previous Page"
              >
                <span className="hidden md:inline">Previous</span>
                <span className="md:hidden">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </button>

              <span className="text-sm text-gray-700 px-2 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                title="Next Page"
              >
                <span className="hidden md:inline">Next</span>
                <span className="md:hidden">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center min-w-[40px]"
                title="Last Page"
              >
                <span className="hidden md:inline">Last</span>
                <span className="md:hidden">
                  <ChevronsRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Export Leads
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Choose export option:</p>

              {/* Export All Option */}
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === "all"}
                  onChange={(e) =>
                    setExportType(
                      e.target.value as "all" | "current" | "custom",
                    )
                  }
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Export All Leads
                  </div>
                  <div className="text-sm text-gray-500">
                    Export all leads from the database (not just current page)
                  </div>
                </div>
              </label>

              {/* Export Current Page Option */}
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="current"
                  checked={exportType === "current"}
                  onChange={(e) =>
                    setExportType(
                      e.target.value as "all" | "current" | "custom",
                    )
                  }
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Export Current Page
                  </div>
                  <div className="text-sm text-gray-500">
                    Export only the leads on page {page}
                  </div>
                </div>
              </label>

              {/* Export Custom Pages Option */}
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="custom"
                  checked={exportType === "custom"}
                  onChange={(e) =>
                    setExportType(
                      e.target.value as "all" | "current" | "custom",
                    )
                  }
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Export Custom Page Range
                  </div>
                  <div className="text-sm text-gray-500">
                    Export leads from specific page range
                  </div>
                </div>
              </label>

              {/* Custom Page Range Inputs */}
              {exportType === "custom" && (
                <div className="ml-7 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={customStartPage}
                        onChange={(e) =>
                          setCustomStartPage(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-black rounded-lg text-black text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={customEndPage}
                        onChange={(e) =>
                          setCustomEndPage(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border text-black border-black rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Total pages available: {totalPages}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkExport}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer */}
      {showEmailModal && (
        <EmailComposer
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEmailLeads([]);
          }}
          onSend={handleSendEmail}
          categories={categories}
          cities={cities}
          countries={countries}
          selectedLeads={selectedEmailLeads}
          defaultType={emailDefaultType}
        />
      )}
    </div>
  );
}

export default function AccessedLeadsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading accessed leads...</p>
            </div>
          </div>
        }
      >
        <AccessedLeadsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
