import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import XLSX from 'xlsx-js-style';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SmsStats {
  sentCount: number;
  unsentCount: number;
  grandTotal: number;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila"
  });

  const [stats, setStats] = useState<SmsStats>({
    sentCount: 0,
    unsentCount: 0,
    grandTotal: 0
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [messageType, setMessageType] = useState<"Sent" | "Unsent">("Sent");

  const loadData = useCallback(async () => {
      try {
          const response = await axios.post(
              "http://sodium2/SMARTSMS/api/SendSmsApi/getRangeMessageByStatus",
              { 
                FromDate: fromDate, 
                ToDate: toDate, 
                Status: messageType
              },
              { headers: { "Content-Type": "application/json" } }
          );
          setMessages(response.data.messages || []);
          setStats(response.data.stats);
      } catch (error) {
          // console.error("Sent load error", error);
      }
  }, [fromDate, toDate, messageType]);


  const handleExportExcel = () => {
    if (messages.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Map data with dynamic "Date" column
    const dataToExport = messages.map(msg => {
      const isSent = msg.status?.toLowerCase() === "sent";
      const sentDateOnly = msg.sentDate ? msg.sentDate.split('T')[0] : "N/A";
      const receiveDateOnly = msg.receiveDate ? msg.receiveDate.split('T')[0] : "N/A";

      return {
        "Date": isSent ? sentDateOnly : receiveDateOnly,
        "Recipient": msg.phoneNumber,
        "Message Content": msg.message,
        "Status": msg.status
      };
    });

    // 2. Create the Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { 
      header: ["Date", "Recipient", "Message Content", "Status"] 
    });

    // 3. ENHANCEMENT: BOLD HEADERS & BACKGROUND
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:D1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"; // Targets the first row (A1, B1, etc.)
      if (!worksheet[address]) continue;

      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { fgColor: { rgb: "059669" } }, // Emerald-600 background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // 4. ENHANCEMENT: 100% WIDTH (AUTO-FIT)
    // We calculate the width of the longest string in each column
    const colWidths = ["Date", "Recipient", "Message Content", "Status"].map(key => {
      // Get the length of the longest value in this column
      const maxChar = Math.max(
        key.length, // Check header length
        ...dataToExport.map(row => row[key as keyof typeof row]?.toString().length || 0)
      );
      return { wch: maxChar + 4 }; // Add a little padding (4 chars)
    });
    worksheet['!cols'] = colWidths;

    // 5. Create the Workbook and Download
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SMS Report");

    const fileName = `SMS_Report_${messageType}_${fromDate}_To_${toDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  

  useEffect(() => {
    loadData();
  }, [loadData]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content Box */}
      <div className="relative w-full max-w-xl p-4 mx-auto my-6 z-51">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-xl outline-none focus:outline-none">
          
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
            <h3 className="text-xl font-semibold text-gray-800 italic">
              SMS Report
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto bg-gray-50/50">
            <div className="space-y-6">
              
              {/* Date & Filter Section */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Report Filters
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* From Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fromDate" className="text-sm text-center font-medium text-gray-700">From Date</label>
                    <input
                      type="date"
                      id="fromDate"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="toDate" className="text-sm text-center font-medium text-gray-700">To Date</label>
                    <input
                      type="date"
                      id="toDate"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Message Type Select */}
                  <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1">
                    <label htmlFor="msgType" className="text-sm text-center font-medium text-gray-700">Type</label>
                    <div className="relative">
                      <select
                        id="msgType"
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value as "Sent" | "Unsent")}
                        className="block w-full text-center px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="Sent">Sent</option>
                        <option value="Unsent">Unsent</option>
                      </select>
                      {/* Custom Chevron Arrow for Select */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary (Optional) */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-semibold uppercase">Sent</p>
                  <p className="text-xl font-bold text-green-900">{stats.sentCount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs text-red-600 font-semibold uppercase">Unsent</p>
                  <p className="text-xl font-bold text-red-900">{stats.unsentCount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Total SMS</p>
                  <p className="text-xl font-bold text-blue-900">{stats.grandTotal.toLocaleString()}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
           {/* Close Button */}
            <button
              className="flex items-center gap-2 bg-slate-500 text-white active:bg-slate-600 font-bold uppercase text-xs px-6 py-3 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 outline-none focus:outline-none mr-1 mb-1 transition-all duration-150"
              type="button"
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>

            {/* Export Excel Button */}
            <button
              className={`flex items-center gap-2 font-bold uppercase text-xs px-6 py-3 rounded-lg shadow outline-none focus:outline-none mr-1 mb-1 transition-all duration-150
                ${messages.length > 0 
                  ? "bg-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:bg-emerald-700" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              type="button"
              onClick={async () => {await loadData(); handleExportExcel();}}
              disabled={messages.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;