'use client';

export interface ForbiddenCardProps {
    isHovered?: boolean;
}

export function ForbiddenCard({ isHovered }: ForbiddenCardProps) {
    return (
        <div className="h-[350px] p-8 mx-auto max-w-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div
                className={`w-[88%] h-[72%] border border-gray-200 rounded-md overflow-hidden flex flex-col bg-white shadow-sm transition-all duration-300 ${
                    isHovered ? 'shadow-md ring-1 ring-blue-500/20' : ''
                }`}
            >
                {/* Topbar */}
                <div className="h-[22px] bg-gray-50 border-b border-gray-100 flex items-center gap-1 px-2 shrink-0">
                    <span className="w-[5px] h-[5px] rounded-md bg-red-300" />
                    <span className="w-[5px] h-[5px] rounded-md bg-yellow-300" />
                    <span className="w-[5px] h-[5px] rounded-md bg-green-300" />
                    <span className="flex-1 mx-1.5 bg-white border border-gray-100 rounded text-[7px] text-gray-300 px-1.5 py-0.5 select-none">
                        vietstrix.com/admin
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-5 overflow-hidden">
                    {/* Lock icon circle */}
                    <div className="w-12 h-12 rounded-md bg-red-50 border border-red-100 flex items-center justify-center mb-3">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>

                    {/* Error code */}
                    <p className="text-[7px] uppercase tracking-widest text-gray-300 mb-1">
                        Error 403
                    </p>

                    {/* Title */}
                    <p className="text-[9px] font-semibold text-gray-800 mb-1.5 text-center">
                        You don&apos;t have permission
                    </p>

                    {/* Description */}
                    <p className="text-[7.5px] text-gray-400 text-center leading-relaxed mb-3 px-2">
                        This area is restricted. Contact your admin if you think this is a
                        mistake.
                    </p>

                    {/* Request access button */}
                    <button className="text-[8px] px-3 py-1 rounded bg-red-50 border border-red-100 text-red-400 hover:bg-red-100 transition-colors">
                        Request access
                    </button>
                </div>

                {/* Statusbar */}
                <div className="h-[16px] bg-gray-50 border-t border-gray-100 flex items-center px-2 gap-1 shrink-0">
                    <span className="w-[5px] h-[5px] rounded-md bg-red-300" />
                    <span className="text-[7px] text-gray-300">
                        vietstrix.com · 403 forbidden
                    </span>
                </div>
            </div>
        </div>
    );
}