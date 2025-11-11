import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các component con cho từng tab
import DashboardTab from "../components/Profile/DashboardTab";
import HealthProfileTab from "../components/Profile/HealthProfileTab";
import AccountTab from "../components/Profile/AccountTab";

// Định nghĩa các tab
type ActiveTab =  'health' | 'account';

const SettingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('health');

    // Hàm render nút tab
    const renderTabButton = (tabName: ActiveTab, label: string) => {
        const isActive = activeTab === tabName;
        
        // Dùng class của Tailwind để thay đổi style
        const activeClasses = 'border-teal-500 text-teal-500';
        const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
        
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-3 font-semibold border-b-2 ${isActive ? activeClasses : inactiveClasses}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex justify-center min-h-screen bg-gray-100 p-4 md:p-8">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl">
                
                {/* 1. Phần điều hướng Tab (Tab Navigation) */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-4">
                        
                        {renderTabButton('health', 'Thông tin Sức khỏe')}
                        {renderTabButton('account', 'Tài khoản')}
                    </nav>
                </div>

                {/* 2. Phần nội dung Tab (Tab Content) */}
                <div className="min-h-[400px]">
                    
                    {activeTab === 'health' && <HealthProfileTab />}
                    {activeTab === 'account' && <AccountTab />}
                </div>

            </div>
        </div>
    );
};

export default SettingPage;