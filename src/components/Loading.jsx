import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin border-t-blue-500"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <div className="w-8 h-8 border-4 border-gray-700 rounded-full animate-spin border-b-blue-500"></div>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-400 animate-pulse">
        Loading match details...
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Please wait while we fetch the latest data
      </p>
    </div>
  );
};

export default Loading;