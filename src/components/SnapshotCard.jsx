// src/components/SnapshotCard.jsx
import React from "react";
import { Card, CardContent } from "./ui/card";


export default function SnapshotCard({ fields }) {
  if (!fields) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-slate-600">Profile Snapshot</h3>
        <div className="mt-3 rounded-lg bg-indigo-50 text-indigo-800 px-4 py-2 font-medium">
          Total Experience: {fields.total_experience || "—"}
        </div>
      </CardContent>
    </Card>
  );
}
