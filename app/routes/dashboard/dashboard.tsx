import { CloudArrowUpIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Swal from "sweetalert2";


export function Dashboard(){
    const today = useMemo(() => new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila"
    }), []);
    
    // Shared / Sent Table States
    const [messages, setMessages] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(today);
    const [sortColumn, setSortColumn] = useState<string>("SentDate");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Pending Table States
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
    const [searchPending, setSearchPending] = useState("");
    const [selectedDatePending, setSelectedDatePending] = useState(today);
    const [sortColumnPending, setSortColumnPending] = useState<string>("SentDate");
    const [sortDirectionPending, setSortDirectionPending] = useState<"asc" | "desc">("desc");
    const [currentPagePending, setCurrentPagePending] = useState(1);
    const pageSizePending = 10;

    // --- 3. LOAD DATA FUNCTIONS (Wrapped in useCallback to prevent infinite loops) ---
    
    const loadData = useCallback(async () => {
        try {
            const response = await axios.post(
                "http://sodium2/SMARTSMS/api/SendSmsApi/getCurrentSmsByStatus",
                { Status: "Sent", ReceiveDate: selectedDate },
                { headers: { "Content-Type": "application/json" } }
            );
            setMessages(response.data || []);
            console.log(response.data);
        } catch (error) {
            console.error("Sent load error", error);
        }
    }, [selectedDate]);

    const loadDataPending = useCallback(async () => {
        try {
            const response = await axios.post(
                "http://sodium2/SMARTSMS/api/SendSmsApi/getCurrentSmsByStatus",
                { Status: "Unsent", ReceiveDate: selectedDatePending },
                { headers: { "Content-Type": "application/json" } }
            );
            setPendingMessages(response.data || []);
        } catch (error) {
            console.error("Pending load error", error);
        }
    }, [selectedDatePending]);

    // --- 4. DATA PROCESSING (Filtering & Sorting) ---

    // Pending Table Logic
    const sortedPendingMessages = useMemo(() => {
        const filtered = pendingMessages.filter((msg) => {
            const term = searchPending.toLowerCase();
            return (
                msg.phoneNumber?.toLowerCase().includes(term) ||
                msg.message?.toLowerCase().includes(term) ||
                msg.systemName?.toLowerCase().includes(term)
            );
        });

        return [...filtered].sort((a, b) => {
            const valA = (a as any)[sortColumnPending] || "";
            const valB = (b as any)[sortColumnPending] || "";

            if (valA < valB) return sortDirectionPending === "asc" ? -1 : 1;
            if (valA > valB) return sortDirectionPending === "asc" ? 1 : -1;
            return 0;
        });
    }, [pendingMessages, searchPending, sortColumnPending, sortDirectionPending]);

    const totalPendingPages = Math.max(1, Math.ceil(sortedPendingMessages.length / pageSizePending));

    const paginatedPendingMessages = useMemo(() => {
        return sortedPendingMessages.slice(
            (currentPagePending - 1) * pageSizePending,
            currentPagePending * pageSizePending
        );
    }, [sortedPendingMessages, currentPagePending]);

    // Sent Table Logic
    const COLUMN_MAP = {
        "Phone Number": "phoneNumber",
        "Message": "message",
        "System Name": "systemName",
        "Status": "status",
        "Sent Date": "sentDate",
        "Process Date": "receiveDate"
    } as const; 

    type ColumnLabel = keyof typeof COLUMN_MAP;

    const sortedMessages = useMemo(() => {
        const filtered = messages.filter((msg) => {
            const term = search.toLowerCase();
            return (
                msg.phoneNumber?.toLowerCase().includes(term) ||
                msg.message?.toLowerCase().includes(term) ||
                msg.systemName?.toLowerCase().includes(term)
            );
        });

        return [...filtered].sort((a, b) => {
            let valA = (a as any)[sortColumn] || "";
            let valB = (b as any)[sortColumn] || "";

            // If sorting by date fields, compare as timestamps
            if (sortColumn === 'sentDate' || sortColumn === 'receiveDate') {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            }

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [messages, search, sortColumn, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedMessages.length / pageSizePending));

    const paginatedMessages = useMemo(() => {
        return sortedMessages.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [sortedMessages, currentPage]);

    // --- 5. EFFECTS (Auto-Refresh & Listeners) ---

    // Initial Load
    useEffect(() => {
        loadData();
        loadDataPending();
    }, [loadData, loadDataPending]);

    // Idle Auto-Refresh Logic
    useEffect(() => {
        let idleTimeout: ReturnType<typeof setTimeout>;
        let refreshInterval: ReturnType<typeof setInterval>;

        const startAutoRefresh = () => {
            refreshInterval = setInterval(() => {
                // We only auto-refresh if we are looking at TODAY'S data
                if (selectedDate === today) loadData();
                if (selectedDatePending === today) loadDataPending();
            }, 3000); // 3 seconds is more stable for IIS than 1 second
        };

        const resetIdleTimer = () => {
            if (refreshInterval) clearInterval(refreshInterval);
            if (idleTimeout) clearTimeout(idleTimeout);

            idleTimeout = setTimeout(startAutoRefresh, 1500); // 1.5s of no activity triggers refresh
        };

        const activityEvents = ["mousemove", "keydown", "scroll", "click"];
        activityEvents.forEach(e => window.addEventListener(e, resetIdleTimer));
        
        resetIdleTimer(); // Initial start

        return () => {
            if (idleTimeout) clearTimeout(idleTimeout);
            if (refreshInterval) clearInterval(refreshInterval);
            activityEvents.forEach(e => window.removeEventListener(e, resetIdleTimer));
        };
    }, [loadData, loadDataPending, selectedDate, selectedDatePending, today]);

    // --- 6. HANDLERS & FORMATTERS ---

    const handleSortPending = (column: string) => {
        if (sortColumnPending === column) {
            setSortDirectionPending(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortColumnPending(column);
            setSortDirectionPending("asc");
        }
    };

    const handleSort = (label: ColumnLabel) => {
        const columnKey = COLUMN_MAP[label];
        
        if (sortColumn === columnKey) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString.split(".")[0]);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleString("en-US", {
            month: "short", day: "2-digit", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true,
            timeZone: "Asia/Manila",
        }).replace(/, (\d{1,2}:\d{2} [AP]M)$/, " $1");
    };
    
    return(
        <>
            <header className="bg-white shadow-sm mt-0 pt-0">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </header>

            <main>
                {/* Pending Message Container */}
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200"> */}
                    <div className="p-3 rounded-lg border border-red-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            {/* Title */}
                            <h2 className="text-xl font-semibold text-red-600">
                                Pending Message: <span className="text-red-900 font-bold">{pendingMessages.length.toLocaleString()}</span>
                            </h2>

                            {/* Date Filter */}
                            <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                                <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700">
                                Filter Date:
                                </label>
                                <input
                                type="date"
                                id="dateFilter"
                                className="px-3 py-1 border rounded-md focus:ring focus:ring-blue-300"
                                value={selectedDatePending} // your state for the date
                                onChange={(e) => setSelectedDatePending(e.target.value)}
                                max={today}
                                />
                            </div>
                        </div>


                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search..."
                            className="mb-4 w-1/2 md:w-1/3 px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
                            value={searchPending}
                            onChange={(e) => setSearchPending(e.target.value)}
                        />

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {["Phone Number", "Message", "System Name", "Status", "Process Date"].map((col) => (
                                            <th
                                                key={col}
                                                onClick={() => handleSortPending(col)}
                                                className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                                            >
                                                {col}
                                                {sortColumnPending === col &&
                                                    (sortDirectionPending === "asc" ? " ▲" : " ▼")}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedPendingMessages.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                No pending messages found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedPendingMessages.map((msg, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.phoneNumber}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.message}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.systemName}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-red-600 font-semibold">
                                                    Sending...
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {formatDate(msg.receiveDate)} 
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                disabled={currentPagePending === 1}
                                onClick={() => setCurrentPagePending((p) => p - 1)}
                            >
                                Previous
                            </button>

                            <span className="text-sm">
                                Page {currentPagePending} of {totalPendingPages}
                            </span>

                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                disabled={currentPagePending === totalPendingPages}
                                onClick={() => setCurrentPagePending((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>


                {/* Sent Message Container */}
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200"> */}
                    <div className="p-3 rounded-lg border border-green-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            {/* Title */}
                            <h2 className="text-xl font-semibold text-green-600">
                                Sent Message: <span className="text-green-900 font-semibold">{messages.length.toLocaleString()}</span>
                            </h2>

                            {/* Date Filter */}
                            <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                                <label htmlFor="dateFilter2" className="text-sm font-medium text-gray-700">
                                Filter Date:
                                </label>
                                <input
                                type="date"
                                id="dateFilter2"
                                className="px-3 py-1 border rounded-md focus:ring focus:ring-blue-300"
                                value={selectedDate} // your state for the date
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={today}
                                />
                            </div>
                        </div>


                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search..."
                            className="mb-4 w-1/2 md:w-1/3 px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {Object.entries(COLUMN_MAP).map(([label, key]) => (
                                            <th
                                                key={label}
                                                onClick={() => handleSort(label as ColumnLabel)}
                                                className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                                            >
                                                {label}
                                                {sortColumn === key && (sortDirection === "asc" ? " ▲" : " ▼")}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedMessages.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                No sent messages found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedMessages.map((msg, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.phoneNumber}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.message}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {msg.systemName}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-green-600 font-semibold">
                                                    {msg.status}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {formatDate(msg.sentDate)} 
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    {formatDate(msg.receiveDate)} 
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Previous
                            </button>

                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}