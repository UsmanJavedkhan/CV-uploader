import * as React from "react";

export function Button({ className, children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
