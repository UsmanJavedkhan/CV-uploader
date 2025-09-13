// src/components/EducationCard.jsx
import React from "react";
import { Card, CardContent } from "./ui/card";


export default function EducationCard({ fields }) {
  if (!fields?.education) return null;
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800">Education & Certifications</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {fields.education.map((edu, idx) => (
            <li key={idx}>
              <p className="font-medium">{edu.degree || edu}</p>
              <p className="text-slate-500">{edu.institution || ""} {edu.years || ""}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
