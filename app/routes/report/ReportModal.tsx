import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila"
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const loadData = useCallback(async () => {
      try {
          const response = await axios.post(
              "http://sodium2/SMARTSMS/api/SendSmsApi/getCurrentSmsByStatus",
              { FromDate: fromDate, ToDate: toDate },
              { headers: { "Content-Type": "application/json" } }
          );
          setMessages(response.data || []);
      } catch (error) {
          console.error("Sent load error", error);
      }
  }, [fromDate, toDate]);
  
  // Initial Load
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
      <div className="relative w-full max-w-md p-4 mx-auto my-6 z-51">
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
              
              {/* Date Filter Section */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Filter Report Period
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fromDate" className="text-sm font-medium text-gray-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      id="fromDate"
                      value={fromDate} // Link this to your state
                      onChange={(e) => setFromDate(e.target.value)}
                      className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="toDate" className="text-sm font-medium text-gray-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      id="toDate"
                      value={toDate} // Link this to your state
                      onChange={(e) => setToDate(e.target.value)}
                      className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary (Optional) */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Total SMS</p>
                  <p className="text-xl font-bold text-blue-900">2,840</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-semibold uppercase">Delivered</p>
                  <p className="text-xl font-bold text-green-900">2,812</p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
            <button
              className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all duration-150"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="bg-blue-600 text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all duration-150"
              type="button"
              onClick={() => window.print()}
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;