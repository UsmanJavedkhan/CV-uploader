// src/components/SkillsCard.jsx
import React from "react";
import { Card, CardContent } from "./ui/card";


export default function SkillsCard({ fields }) {
  if (!fields?.skills) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-slate-600">Skills Cloud</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {fields.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
