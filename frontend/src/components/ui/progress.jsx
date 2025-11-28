import React from "react";

const Progress = ({ value, className = "", color = "blue", ...props }) => {
  const percentage = Math.min(100, Math.max(0, value || 0));

  const colorClasses = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-green-600",
    orange: "bg-orange-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className={`h-full ${bgColor} transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Progress };

