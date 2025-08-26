import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ValidationProps {
    validateForm: () => string[];
    showErrors: boolean;
    setShowErrors: React.Dispatch<React.SetStateAction<boolean>>;
}

const Validation: React.FC<ValidationProps> = ({ validateForm, showErrors, setShowErrors }) => {
    const errors = validateForm();
    const isValid = errors.length === 0;

    return (
        <div className={`lg:col-span-3 bg-white rounded-lg shadow-lg border-l-4 ${isValid ? 'border-green-500' : 'border-red-500'} p-6 transition-all duration-300 ease-in-out hover:shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isValid ? (
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Validation Status</h2>
                </div>
                <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    {showErrors ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {showErrors && (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {isValid ? (
                        <div className="text-center py-6">
                            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto" />
                            <p className="text-lg font-semibold text-green-600 mt-3">All Checks Passed!</p>
                            <p className="text-sm text-gray-500">The form is valid and ready to submit.</p>
                        </div>
                    ) : (
                        errors.map((error, index) => (
                            <div key={index} className="flex items-start bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Validation;