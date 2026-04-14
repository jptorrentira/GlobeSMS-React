import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from "sweetalert2";


export default function Account(){
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await fetch("https://your-api-url/api/users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchUsers();
    }, []);

    return(
        <>
            <header className="bg-white shadow-sm mt-0 pt-0">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Account</h1>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">User List</h2>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
                                + Add User
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Full Name</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Domain</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">User Name</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Email</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500 text-center">Role</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500 text-center">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-4">Loading users...</td></tr>
                                ) : (
                                    users.map((user) => (
                                    <tr key="" className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-600"></td>
                                        <td className="px-4 py-4 text-sm text-gray-600"></td>
                                        <td className="px-4 py-4 text-sm text-gray-600"></td>
                                        <td className="px-4 py-4 text-sm text-gray-600"></td>
                                        <td className="px-4 py-4 text-sm text-gray-600"></td>
                                        <td className="px-4 py-4 text-center"></td>
                                    </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}