// src/components/ProfileCard.jsx
import React from "react";
import { Card, CardContent } from "./ui/card";


export default function ProfileCard({ fields }) {
  if (!fields) return null;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <img src="https://i.pravatar.cc/100" alt="profile" className="h-16 w-16 rounded-full" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">{fields.name || "—"}</h2>
          <p className="text-slate-600">{fields.location || "—"}</p>
          <p className="text-slate-500 text-sm">{fields.email || "—"}</p>
          <p className="text-slate-500 text-sm">{fields.phone || "—"}</p>
        </div>
      </CardContent>
      
    </Card>
  );
}
