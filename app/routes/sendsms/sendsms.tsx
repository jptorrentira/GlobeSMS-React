import { useState } from "react";
import { useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CloudArrowUpIcon, PaperAirplaneIcon, ArrowDownOnSquareIcon } from "@heroicons/react/16/solid";


export default function Sendsms(){
    {/* Select Type */}
    const [type, setType] = useState<"upload" | "manual">("upload");

    {/* Phone number validation */}
    const [message, setMessage] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const validatePhone = (value: string) => {
        // Regex to match Philippine mobile numbers
        const regex = /^(09\d{9}|639\d{9}|\+639\d{9})$/;
        return regex.test(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);

        if (value === "" || validatePhone(value)) {
            setError(""); // no error
        } else {
            setError("Please enter a valid mobile number.");
        }
    };

    const canSend = () => {
        if (type === "manual") {
            return phone !== "" && message !== "" && !error;
        }
        if (type === "upload") {
            return (fileInputRef.current?.files?.length ?? 0) > 0 && message !== ""; // defaults to 0 if undefined
        }
        return false;
    };

    // Download template
    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/template/Mobile Number Template.csv"; // path relative to public folder
        link.download = "mobileNumberTemplate.csv"; // name of the downloaded file
        link.click();
    };

    // Upload file
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState("Select file...");

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const truncateFileName = (name: string, maxLength = 10) => {
        if (name.length <= maxLength) return name;

        const extIndex = name.lastIndexOf(".");
        const ext = extIndex !== -1 ? name.slice(extIndex) : "";
        const base = name.slice(0, extIndex);

        const shortened = base.slice(0, maxLength - ext.length - 3); // room for "..."
        return shortened + "..." + ext;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            alert("Please select a CSV file only.");
            return;
        }

        const shortName = truncateFileName(file.name, 10);
        setFileName(shortName); // update button text
    };

    // Saving csv file
    const handleSaveFile = async () => {
        type SmsItem = {
            Message: string;
            Destination: string;
            SystemName: string;
        };

        type UploadSmsItem = {
            PhoneNumber: string;
            Message: string;
            SystemName: string;
        };

        let messageArray: SmsItem[] = [];
        let uploadMessageArray: UploadSmsItem[] = [];
        const messageTrim = message.trim(); // Get message from textarea

        if(type == "upload"){
            const file = fileInputRef.current?.files?.[0];
            if (!file) {
                Swal.fire("Missing file!", "Please select a CSV file first.", "error");
                return;
            }
            
            // Read CSV content on the client side
            const text = await file.text();           // Read CSV file into string
            let rows = text
                .split("\n")
                .map(row => row.trim())
                .filter(row => row.length > 0)        // Remove empty lines
                .map(row => row.split(","));          // Convert "a,b,c" → ["a","b","c"]
                        
            // Remove first row (header)
            rows = rows.slice(1);
                    
            // Extract ONLY column A (first column)
            const columnA = rows.map(row => row[0]?.trim()).filter(x => x !== "");

            // VALIDATION: must be 10 digits AND start with 9
            const isValidNumber = (num: string) => {
                return /^[9]\d{9}$/.test(num);
            };

            // Create a new array with ONLY valid numbers
            const finalArray = columnA
                .filter(num => isValidNumber(num))   // <-- filter invalid numbers
                .map(num => ({
                    Message: messageTrim,
                    Destination: "0" + num, // add leading 0
                    SystemName: "sms-minesite"
                }));
            messageArray = finalArray;

            // Create a new array
            const uploadFinalArray = columnA
                .map(num => ({
                    PhoneNumber: num,
                    Message: messageTrim,
                    SystemName: "sms-minesite"
                }));
            uploadMessageArray = uploadFinalArray;
                    
        }else if(type == "manual"){
            // Push one message
            messageArray.push({
                Message: messageTrim,
                Destination: phone,
                SystemName: "sms-minesite"
            });
        }

        // SEND AND UPLOAD TO API USING AXIOS
        try {
            // Send message
            const sendResponse = await axios.post(
                "http://sodium2/SMARTSMS/api/SendSmsApi/send",
                messageArray,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Upload message
            if(uploadMessageArray.length > 0){
                const uploadResponse = await axios.post(
                    "http://sodium2/SMARTSMS/api/SendSmsApi/uploadsms",
                    uploadMessageArray,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            Swal.fire("Sending...", "", "info");
        } catch (error) {
            Swal.fire("Error!", "Error sending messages to API.", "error");
        }
    };


    return(
        <>
            <header className="bg-white shadow-sm mt-0 pt-0">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Send SMS</h1>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                        
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">SMS Form</h2>

                        <div className="flex flex-col gap-4">

                            {/* Row – now responsive */}
                            <div className="flex flex-wrap items-center gap-3 w-full">

                                {/* Select Type */}
                                <div className="relative w-full sm:w-40">
                                    <select
                                        value={type}
                                        onChange={(e) => {
                                                        const value = e.target.value as "upload" | "manual";
                                                        setType(value);

                                                        if (value === "upload") {
                                                            // Clear manual input
                                                            setPhone("");
                                                            setError("");
                                                        } else if (value === "manual") {
                                                            // Clear selected CSV file
                                                            setSelectedFile(null);
                                                            setFileName("Select file...");
                                                            if (fileInputRef.current) fileInputRef.current.value = ""; // also clear file input
                                                        }
                                                    }}
                                        className="appearance-none w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 pr-8 
                                                focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="upload">Upload</option>
                                        <option value="manual">Manual</option>
                                    </select>

                                    <svg
                                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Conditional Rendering */}
                                {type === "upload" ? (
                                    <>
                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".csv"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {/* Upload Button */}
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                                        >
                                            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                            {fileName}
                                        </button>

                                        {/* Template Button */}
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
                                        >
                                            <ArrowDownOnSquareIcon className="h-5 w-5 mr-2" />
                                            Template
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Input field */}
                                        <div className="w-full sm:w-auto">
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={handleChange}
                                                placeholder="Input valid number"
                                                className={`inline-flex items-center w-full sm:w-60 border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                                                    error
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                }`}
                                            />
                                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Textarea */}
                            <textarea
                                rows={4}
                                placeholder="Enter message..."
                                onChange={(e) => setMessage(e.target.value)}
                                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                            ></textarea>

                            {/* Send Button */}
                            <button
                                type="button"
                                disabled={!canSend()}
                                onClick={handleSaveFile}
                                className={`inline-flex items-center w-fit px-4 py-2 font-medium rounded-md transition ${
                                    !canSend()
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                <PaperAirplaneIcon className="h-5 w-5 mr-2 text-white -rotate-45" />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}