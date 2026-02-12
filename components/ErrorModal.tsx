
import React from 'react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] border-red-500/30 animate-slideUp">
        <div className="p-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          
          <h2 className="text-2xl font-heading font-bold mb-2 text-white">Chamber Disruption</h2>
          <p className="text-red-400 text-xs uppercase tracking-widest font-bold mb-6">Protocol Failure Detected</p>
          
          <div className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl mb-8">
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "{message || "The Council session was interrupted by an unknown uplink error."}"
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            Acknowledge & Try Again
          </button>
        </div>
        
        <div className="bg-red-950/20 p-4 border-t border-red-500/10 text-center">
          <p className="text-[10px] text-red-400/60 uppercase tracking-tighter">
            Error Code: COU-ERR-{Math.floor(Math.random() * 9000) + 1000}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
