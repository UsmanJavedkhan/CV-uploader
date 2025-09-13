// src/components/ExperienceCard.jsx
import React from "react";

import { Card, CardContent } from "./ui/card";


export default function ExperienceCard({ fields }) {
  if (!fields?.experience) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800">Experience</h3>
        <div className="mt-4 space-y-4">
          {fields.experience.map((exp, idx) => (
            <div key={idx}>
              <p className="font-medium">{exp.title || exp}</p>
              <p className="text-sm text-slate-500">
                {exp.company || ""} {exp.years || ""}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
