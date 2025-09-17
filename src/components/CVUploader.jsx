


// import React, { useState, useRef } from "react";
// import UploadCard from "./UploadCard";
// import ProfileCard from "./ProfileCard";
// import ExperienceCard from "./ExperienceCard";
// import SnapshotCard from "./SnapshotCard";
// import SkillsCard from "./SkillsCard";
// import EducationCard from "./EducationCard";

// const NGROK_BASE = "https://4d561016c317.ngrok-free.app"; // update if ngrok changes
// const UPLOAD_URL = `${NGROK_BASE}/upload`;

// // 🔹 Normalize backend response -> frontend fields
// function mapParsed(p = {}) {
//   return {
//     name: p.name ?? p.Name ?? "",
//     email: p.email ?? p.Email ?? "",
//     phone: p.phone ?? p.Phone ?? "",
//     location: p.location ?? p.Location ?? "",
//     skills: p.skills ?? [],
//     education: p.education ?? [],
//     experience: p.experience ?? [],
//     total_experience: p.total_experience ?? "", // optional if backend sends
//   };
// }

// export default function CVUploader() {
//   const [file, setFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Default mock data for first render
//   const [fields, setFields] = useState({
//     name: "Muhammad Fahad",
//     email: "fahad@email.com",
//     phone: "(555) 123-4567",
//     location: "New York, USA",
//     total_experience: "9 years 4 months",
//     skills: ["Python", "TensorFlow", "Docker", "Kubernetes"],
//     experience: [
//       { title: "Lead AI/ML Engineer", company: "Appsian", years: "2021 – Present" },
//       { title: "Senior Data Scientist", company: "Data Insights Corp", years: "2018 – 2021" }
//     ],
//     education: [
//       { degree: "Master’s Degree in Computer Science", institution: "Pace University", years: "2014 – 2016" },
//       { degree: "Machine Learning Specialization", institution: "DeepLearning.AI" }
//     ]
//   });

//   const inputRef = useRef(null);
 
//   // File selection
  
//   const onPickFile = (e) => {
//     const f = e.target.files?.[0];
//     if (f) setFile(f);
//   };

//   // Upload handler
//   const onUpload = async () => {
//     if (!file) return;
//     setUploadProgress(0);

//     const fd = new FormData();
//     fd.append("file", file);

//     try {
//       const res = await fetch(UPLOAD_URL, { method: "POST", body: fd });

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Upload Response:", data);

//       if (data.ok) {
//         setFields(mapParsed(data.parsed)); // ✅ Normalize backend -> frontend
//       } else {
//         alert(data.message || "Upload failed");
//       }
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("Upload failed. Check backend or ngrok tunnel.");
//     }

//     setUploadProgress(100);
//   };

//   return (
//     <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Upload Card */}
//       <UploadCard
//         file={file}
//         uploadProgress={uploadProgress}
//         inputRef={inputRef}
//         onPickFile={onPickFile}
//         onUpload={onUpload}
//       />

//       {/* Profile + Experience */}
//       <div className="lg:col-span-2 space-y-6">
//         <ProfileCard fields={fields} />
//         <ExperienceCard fields={fields} />
//       </div>

//       {/* Snapshot + Skills */}
//       <div className="lg:col-span-1 space-y-6">
//         <SnapshotCard fields={fields} />
//         <SkillsCard fields={fields} />
//       </div>

//       {/* Education */}
//       <EducationCard fields={fields} />
//     </div>
//   );
// }



import React, { useState, useRef } from "react";
import UploadCard from "./UploadCard";
import ProfileCard from "./ProfileCard";
import ExperienceCard from "./ExperienceCard";
import SnapshotCard from "./SnapshotCard";
import SkillsCard from "./SkillsCard";
import EducationCard from "./EducationCard";

const NGROK_BASE = "https://4d561016c317.ngrok-free.app"; // update if ngrok changes
const UPLOAD_URL = `${NGROK_BASE}/upload`;

// 🔹 Normalize backend response -> frontend fields
function mapParsed(p = {}) {
  return {
    name: p.name ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    location: p.location ?? "",
    skills: p.skills ?? [],
    education: (p.education || []).map((e) => ({
      degree: e.degree || "",
      institution: e.institution || "",
      years: e.years || "",
    })),
    experience: (p.experience || []).map((e) => ({
      title: e.role || "",
      company: e.company || "",
      years: e.duration || [e.start, e.end].filter(Boolean).join(" – "),
    })),
    total_experience: p.total_experience?.formatted || "",
    semantic: p.semantic || {}, // fallback if backend includes semantic later
  };
}

export default function CVUploader() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Default mock data for first render
  const [fields, setFields] = useState({
    name: "Muhammad Fahad",
    email: "fahad@email.com",
    phone: "(555) 123-4567",
    location: "New York, USA",
    total_experience: "9 years 4 months",
    skills: ["Python", "TensorFlow", "Docker", "Kubernetes"],
    experience: [
      {
        title: "Lead AI/ML Engineer",
        company: "Appsian",
        years: "2021 – Present",
      },
      {
        title: "Senior Data Scientist",
        company: "Data Insights Corp",
        years: "2018 – 2021",
      },
    ],
    education: [
      {
        degree: "Master’s Degree in Computer Science",
        institution: "Pace University",
        years: "2014 – 2016",
      },
      { degree: "Machine Learning Specialization", institution: "DeepLearning.AI" },
    ],
    semantic: {
      summary: "This is a short sample professional summary",
      domain: "IT",
      role_category: "Developer",
      strengths: ["Problem-solving", "Teamwork"],
      weaknesses: ["Perfectionism"],
    },
  });

  const inputRef = useRef(null);

  // File selection
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Upload handler
  const onUpload = async () => {
    if (!file) return;
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(UPLOAD_URL, { method: "POST", body: fd });

      // 🔹 Handle duplicate resumes (409 Conflict)
      if (res.status === 409) {
        const data = await res.json();
        alert(data.message || "This CV already exists in the database!");
        if (data.parsed || data.candidate) {
          const normalized = mapParsed(data.parsed || data.candidate);
          setFields(normalized);
        }
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Upload Response:", data);

      if (data.candidate) {
        const normalized = mapParsed(data.candidate);
        setFields(normalized);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check backend or ngrok tunnel.");
    }

    setUploadProgress(100);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload Card */}
      <UploadCard
        file={file}
        uploadProgress={uploadProgress}
        inputRef={inputRef}
        onPickFile={onPickFile}
        onUpload={onUpload}
      />

      {/* Profile + Experience */}
      <div className="lg:col-span-2 space-y-6">
        <ProfileCard fields={fields} />
        <ExperienceCard fields={fields} />
      </div>

      {/* Snapshot + Skills */}
      <div className="lg:col-span-1 space-y-6">
        <SnapshotCard fields={fields} />
        <SkillsCard fields={fields} />
      </div>

      {/* Education */}
      <EducationCard fields={fields} />
    </div>
  );
}
