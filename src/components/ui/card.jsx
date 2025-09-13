import * as React from "react";

export function Card({ className, ...props }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm ${className || ""}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={`p-4 ${className || ""}`} {...props} />
  );
}
