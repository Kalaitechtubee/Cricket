import React from "react";

const Loading = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
    <p className="ml-4 text-gray-600">Loading match data...</p>
  </div>
);

export default Loading;