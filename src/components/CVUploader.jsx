// // src/components/CVUploader.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";

// /**
//  * Connected to your Flask backend:
//  *  - POST /upload  (FormData "file") -> { ok, id, parsed }
//  *    • 409 duplicate -> { ok:false, message, id, parsed }
//  *  - GET  /search?skill=...&name=...&email=... -> { count, results:[{..., raw_text }] }
//  *
//  * Notes:
//  *  - If CORS blocks requests, enable it in Flask:
//  *      from flask_cors import CORS; CORS(app, resources={r"/*": {"origins": "*"}})
//  */
// const NGROK_BASE = "https://23c74133b16e.ngrok-free.app"; // <-- change if your ngrok URL changes
// const USE_MOCK = false;                                    // now talking to your backend
// const UPLOAD_URL = `${NGROK_BASE}/upload`;
// const SEARCH_URL = `${NGROK_BASE}/search`;

// export default function CVUploader() {
//   const [dragActive, setDragActive] = useState(false);
//   const [file, setFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [pending, setPending] = useState(false);

//   const [cvId, setCvId] = useState(null);
//   const [text, setText] = useState("");            // full resume text (from /search raw_text)
//   const [fields, setFields] = useState(null);      // parsed fields from backend

//   // client-side text search
//   const [query, setQuery] = useState("");

//   // server-side candidate search UI
//   const [sName, setSName] = useState("");
//   const [sEmail, setSEmail] = useState("");
//   const [sSkill, setSSkill] = useState("");
//   const [serverResults, setServerResults] = useState(null);
//   const [searching, setSearching] = useState(false);

//   const [error, setError] = useState("");
//   const [info, setInfo] = useState("");
//   const inputRef = useRef(null);

//   // --- Drag & Drop
//   const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
//   const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
//   const onDrop = (e) => {
//     e.preventDefault(); e.stopPropagation(); setDragActive(false);
//     const f = e.dataTransfer.files?.[0];
//     if (f) validateAndSetFile(f);
//   };
//   const onPickFile = (e) => {
//     const f = e.target.files?.[0];
//     if (f) validateAndSetFile(f);
//   };

//   const validateAndSetFile = (f) => {
//     setError(""); setInfo("");
//     const allowed = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "text/plain",
//     ];
//     const isAllowed = allowed.includes(f.type) || /\.(pdf|docx?|txt)$/i.test(f.name);
//     const maxSizeMB = 10;

//     if (!isAllowed) return setError("Unsupported file type. Please upload PDF, DOC, DOCX or TXT.");
//     if (f.size > maxSizeMB * 1024 * 1024) return setError(`File is too large. Max ${maxSizeMB} MB.`);
//     setFile(f);
//   };

//   // --- Upload (connected to Flask)
//   const onUpload = async () => {
//     if (!file) return;
//     setError(""); setInfo(""); setPending(true); setUploadProgress(0);

//     try {
//       if (USE_MOCK) {
//         await simulateProgress(setUploadProgress, 800);
//         const mock = await mockExtract(file);
//         setCvId(mock.id);
//         setText(mock.text);
//         setFields(mock.fields);
//       } else {
//         // show progress bar while uploading (fake until response)
//         const progressTimer = simulateProgress(setUploadProgress, 900);

//         const fd = new FormData();
//         fd.append("file", file);

//         const res = await fetch(UPLOAD_URL, { method: "POST", body: fd });
//         const isDuplicate = res.status === 409;
//         const data = await res.json();

//         // data shape: { ok, id, parsed } or (409) { ok:false, message, id, parsed }
//         const parsed = data.parsed || {};
//         setFields(mapParsed(parsed));
//         setCvId(data.id || null);

//         if (isDuplicate) {
//           setInfo(data.message || "This CV already exists. Loaded existing parsed info.");
//         } else if (data.ok) {
//           setInfo("Upload successful. Parsed fields loaded.");
//         } else {
//           throw new Error(data.error || "Upload failed");
//         }

//         // The upload response doesn't include full raw text.
//         // If we have an email, fetch the candidate via /search to pull raw_text for the viewer.
//         if (parsed.email) {
//           try {
//             const searchRes = await fetch(
//               `${SEARCH_URL}?email=${encodeURIComponent(parsed.email)}`
//             );
//             if (searchRes.ok) {
//               const searchJson = await searchRes.json();
//               const first = searchJson?.results?.[0];
//               if (first?.raw_text) setText(first.raw_text);
//             }
//           } catch (e) {
//             // non-fatal
//             console.warn("Unable to fetch raw_text after upload:", e);
//           }
//         }

//         await progressTimer;
//       }
//     } catch (e) {
//       console.error(e);
//       setError(e.message || "Upload failed. Please try again.");
//     } finally {
//       setPending(false);
//       setUploadProgress(100);
//     }
//   };

//   // --- Client-side search ranges (for HighlightedText)
//   const matches = useMemo(() => {
//     if (!query.trim() || !text) return [];
//     const q = query.trim();
//     const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const regex = new RegExp(safe, "gi");

//     const results = [];
//     let m;
//     const context = 60;
//     while ((m = regex.exec(text)) !== null) {
//       const idx = m.index;
//       const start = Math.max(0, idx - context);
//       const end = Math.min(text.length, idx + m[0].length + context);
//       results.push({ start, end, matchStart: idx, matchEnd: idx + m[0].length });
//       if (m.index === regex.lastIndex) regex.lastIndex++; // prevent zero-length loops
//     }
//     return results;
//   }, [query, text]);

//   // --- Server-side candidates search (your /search)
//   const doServerSearch = async () => {
//     setError(""); setInfo(""); setSearching(true);
//     try {
//       const params = new URLSearchParams();
//       if (sSkill.trim()) params.set("skill", sSkill.trim());
//       if (sName.trim())  params.set("name", sName.trim());
//       if (sEmail.trim()) params.set("email", sEmail.trim());

//       const url = `${SEARCH_URL}${params.toString() ? `?${params.toString()}` : ""}`;
//       const res = await fetch(url);
//       if (!res.ok) {
//         const maybe = await res.json().catch(() => ({}));
//         if (res.status === 404) {
//           setServerResults([]);
//           setInfo(maybe.message || "No data to show");
//           return;
//         }
//         throw new Error(maybe.error || "Search failed");
//       }
//       const data = await res.json();
//       setServerResults(data.results || []);
//     } catch (e) {
//       console.error(e);
//       setError(e.message || "Search failed");
//     } finally {
//       setSearching(false);
//     }
//   };

//   const loadCandidateIntoViewer = (cand) => {
//     // Show the selected candidate’s raw_text and parsed fields in the viewer
//     setCvId(cand.id || null);
//     setText(cand.raw_text || "");
//     setFields({
//       name: cand.name ?? "",
//       email: cand.email ?? "",
//       phone: cand.phone ?? "",
//       location: cand.location ?? "",
//       skills: cand.skills ?? [],
//       education: cand.education ?? [],
//       experience: cand.experience ?? [],
//     });
//     setInfo(`Loaded ${cand.name || "candidate"} into viewer`);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <div className="mx-auto max-w-6xl p-6">
//       <Header />

//       {/* Uploader */}
//       <div
//         onDragOver={onDragOver}
//         onDragLeave={onDragLeave}
//         onDrop={onDrop}
//         className={[
//           "mt-6 rounded-2xl border-2 border-dashed p-8 transition",
//           dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-300 bg-white",
//         ].join(" ")}
//       >
//         <div className="flex flex-col items-center text-center">
//           <div className="i-heroicon-document-arrow-up mb-3 h-10 w-10 text-slate-500" />
//           <h3 className="text-lg font-semibold text-slate-800">Upload a CV</h3>
//           <p className="mt-1 text-sm text-slate-500">PDF, DOC, DOCX or TXT, up to 10MB</p>

//           <div className="mt-4 flex items-center gap-3">
//             <button
//               type="button"
//               onClick={() => inputRef.current?.click()}
//               className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
//             >
//               Choose file
//             </button>
//             <button
//               type="button"
//               onClick={onUpload}
//               disabled={!file || pending}
//               className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             >
//               {pending ? "Uploading…" : "Upload"}
//             </button>
//           </div>

//           <input
//             ref={inputRef}
//             type="file"
//             onChange={onPickFile}
//             className="hidden"
//             accept=".pdf,.doc,.docx,.txt"
//           />

//           {file && (
//             <div className="mt-4 text-sm text-slate-600">
//               Selected: <span className="font-medium text-slate-800">{file.name}</span>
//             </div>
//           )}

//           {(pending || uploadProgress > 0) && (
//             <div className="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
//               <div
//                 className="h-full bg-indigo-500 transition-all"
//                 style={{ width: `${uploadProgress}%` }}
//               />
//             </div>
//           )}

//           {info && (
//             <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
//               {info}
//             </p>
//           )}
//           {error && (
//             <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
//           )}
//         </div>
//       </div>

//       {/* Results & Search */}
//       {(text || fields) && (
//         <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
//           {/* Extracted fields */}
//           <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-1">
//             <h4 className="text-base font-semibold text-slate-800">Extracted Info</h4>
//             <div className="mt-3 space-y-3 text-sm">
//               <Field label="Name" value={fields?.name} />
//               <Field label="Email" value={fields?.email} />
//               <Field label="Phone" value={fields?.phone} />
//               <Field label="Location" value={fields?.location} />
//               <Field
//                 label="Skills"
//                 value={Array.isArray(fields?.skills) ? fields.skills.join(", ") : fields?.skills}
//               />
//               <Field
//                 label="Education"
//                 value={Array.isArray(fields?.education) ? fields.education.join("\n") : fields?.education}
//                 multiline
//               />
//               <Field
//                 label="Experience"
//                 value={Array.isArray(fields?.experience) ? fields.experience.join("\n") : fields?.experience}
//                 multiline
//               />
//             </div>
//           </div>

//           {/* Full text + highlight search */}
//           <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
//             <div className="flex items-center gap-3">
//               <input
//                 type="text"
//                 placeholder="Search in CV text (e.g., React, Laravel, 2023)"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//               />
//               <div className="text-xs text-slate-500">
//                 {query ? `${matches.length} match${matches.length !== 1 ? "es" : ""}` : ""}
//               </div>
//             </div>

//             <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
//               {text ? (
//                 query && matches.length > 0 ? (
//                   <HighlightedText text={text} ranges={matches} />
//                 ) : (
//                   <pre className="whitespace-pre-wrap font-sans text-slate-700">{text}</pre>
//                 )
//               ) : (
//                 <div className="text-slate-500">
//                   Full text not available for this upload. Use the search panel below and load a candidate to view stored text.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {!text && !fields && (
//         <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
//           After upload, parsed fields appear here. Full text shows when found via <span className="font-medium">Search Candidates</span>.
//         </div>
//       )}

//       {/* Server-side search (your /search) */}
//       <div className="mt-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
//         <h4 className="text-base font-semibold text-slate-800">Search Candidates (Server)</h4>
//         <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
//           <input
//             type="text"
//             placeholder="By name"
//             value={sName}
//             onChange={(e) => setSName(e.target.value)}
//             className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <input
//             type="text"
//             placeholder="By email"
//             value={sEmail}
//             onChange={(e) => setSEmail(e.target.value)}
//             className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <input
//             type="text"
//             placeholder="By skill (comma separated)"
//             value={sSkill}
//             onChange={(e) => setSSkill(e.target.value)}
//             className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//           <button
//             type="button"
//             onClick={doServerSearch}
//             disabled={searching}
//             className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             {searching ? "Searching…" : "Search"}
//           </button>
//         </div>

//         {serverResults && (
//           <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
//             {serverResults.length === 0 ? (
//               <div className="text-sm text-slate-500">No candidates found.</div>
//             ) : (
//               serverResults.map((c) => (
//                 <div key={c.id} className="rounded-xl border border-slate-200 p-4">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <div className="text-sm font-semibold text-slate-800">{c.name || "—"}</div>
//                       <div className="text-xs text-slate-500">{c.email || "—"}</div>
//                       <div className="mt-1 text-xs text-slate-500">{c.location || "—"}</div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => loadCandidateIntoViewer(c)}
//                       className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
//                     >
//                       Load
//                     </button>
//                   </div>
//                   {Array.isArray(c.skills) && c.skills.length > 0 && (
//                     <div className="mt-2">
//                       <div className="text-[11px] uppercase tracking-wide text-slate-500">Skills</div>
//                       <div className="mt-1 text-sm text-slate-700 truncate">
//                         {c.skills.join(", ")}
//                       </div>
//                     </div>
//                   )}
//                   {c.raw_text && (
//                     <details className="mt-2">
//                       <summary className="cursor-pointer text-xs text-indigo-600">Preview raw text</summary>
//                       <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200">
//                         {c.raw_text.slice(0, 2000)}
//                         {c.raw_text.length > 2000 ? "…" : ""}
//                       </pre>
//                     </details>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ─────────── Subcomponents & Helpers ─────────── */

// function Header() {
//   return (
//     <div className="flex flex-col gap-2">
//       <h1 className="text-2xl font-bold tracking-tight text-slate-900">CV Uploader</h1>
//       <p className="text-slate-600">
//         Connected to Flask (ngrok). Upload to parse with Gemini and search saved candidates.
//       </p>
//     </div>
//   );
// }

// function Field({ label, value, multiline = false }) {
//   return (
//     <div>
//       <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
//       {value ? (
//         multiline ? (
//           <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-slate-800 ring-1 ring-slate-200">
//             {value}
//           </pre>
//         ) : (
//           <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-800 ring-1 ring-slate-200">
//             {value}
//           </div>
//         )
//       ) : (
//         <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-400 ring-1 ring-dashed ring-slate-200">—</div>
//       )}
//     </div>
//   );
// }

// /** Renders highlighted matches from client-side `query` over `text` */
// function HighlightedText({ text, ranges }) {
//   if (!text) return null;
//   const merged = mergeRanges(ranges);
//   const out = [];
//   let last = 0;

//   merged.forEach((r, i) => {
//     const pre = text.slice(last, r.matchStart);
//     if (pre) out.push(<span key={`pre-${i}`}>{pre}</span>);

//     const mid = text.slice(r.matchStart, r.matchEnd);
//     out.push(
//       <mark key={`mark-${i}`} className="rounded bg-yellow-200 px-0.5 py-0" title="match">
//         {mid}
//       </mark>
//     );

//     last = r.matchEnd;
//   });

//   if (last < text.length) out.push(<span key="tail">{text.slice(last)}</span>);
//   return <pre className="whitespace-pre-wrap font-sans text-slate-800">{out}</pre>;
// }

// function mergeRanges(list) {
//   if (!list?.length) return [];
//   const sorted = [...list].sort((a, b) => a.matchStart - b.matchStart);
//   const res = [sorted[0]];
//   for (let i = 1; i < sorted.length; i++) {
//     const prev = res[res.length - 1];
//     const cur = sorted[i];
//     if (cur.matchStart <= prev.matchEnd) {
//       prev.matchEnd = Math.max(prev.matchEnd, cur.matchEnd);
//       prev.start = Math.min(prev.start, cur.start);
//       prev.end = Math.max(prev.end, cur.end);
//     } else {
//       res.push({ ...cur });
//     }
//   }
//   return res;
// }

// // Map your backend's parsed JSON into the UI "fields" object
// function mapParsed(p = {}) {
//   const skills = Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []);
//   const education = Array.isArray(p.education) ? p.education : (p.education ? [p.education] : []);
//   const experience = Array.isArray(p.experience) ? p.experience : (p.experience ? [p.experience] : []);
//   return {
//     name: p.name ?? "",
//     email: p.email ?? "",
//     phone: p.phone ?? "",
//     location: p.location ?? "",
//     skills,
//     education,
//     experience,
//   };
// }

// // --- mock helpers kept around (unused when USE_MOCK=false) ---
// async function simulateProgress(setter, totalMs = 1200) {
//   let cancelled = false;
//   const promise = (async () => {
//     const steps = 8;
//     for (let i = 1; i <= steps; i++) {
//       if (cancelled) return;
//       await new Promise((r) => setTimeout(r, totalMs / steps));
//       setter(Math.round((i / steps) * 90)); // ~90%; we'll set 100% after upload
//     }
//   })();
//   promise.cancel = () => { cancelled = true; };
//   return promise;
// }

// async function mockExtract(file) {
//   const txt = await readTxtIfPossible(file);
//   const nameGuess = file.name.replace(/\.(pdf|docx?|txt)$/i, "");
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         id: Math.random().toString(36).slice(2),
//         text:
//           txt ||
//           `Demo text for ${file.name}. Connect your backend to show real extracted content.\n\n` +
//             `Skills: React, Tailwind, Laravel, Node.js\n` +
//             `Experience: 3+ years Frontend, 2+ years Fullstack\n` +
//             `Education: BS Computer Science (2022)\n` +
//             `Email: demo@example.com\n` +
//             `Phone: +123456789`,
//         fields: {
//           name: nameGuess,
//           email: "demo@example.com",
//           phone: "+123456789",
//           skills: ["React", "Tailwind", "Laravel", "Node.js"],
//           education: ["BS Computer Science (2022)"],
//           experience: ["Frontend Developer (2022—2024)", "Fullstack Projects"],
//         },
//       });
//     }, 900);
//   });
// }

// function readTxtIfPossible(file) {
//   return new Promise((resolve) => {
//     if (!/\.txt$/i.test(file.name)) return resolve("");
//     const reader = new FileReader();
//     reader.onload = () => resolve(String(reader.result || ""));
//     reader.onerror = () => resolve("");
//     reader.readAsText(file);
//   });
// }




























// src/components/CVUploader.jsx
import React, { useState, useRef } from "react";
import UploadCard from "./UploadCard";
import ProfileCard from "./ProfileCard";
import ExperienceCard from "./ExperienceCard";
import SnapshotCard from "./SnapshotCard";
import SkillsCard from "./SkillsCard";
import EducationCard from "./EducationCard";

const NGROK_BASE = "https://23c74133b16e.ngrok-free.app";
const UPLOAD_URL = `${NGROK_BASE}/upload`;

export default function CVUploader() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 🔹 Start with mock data so frontend always renders
  const [fields, setFields] = useState({
    name: "Muhammad Fahad",
    email: "fahad@email.com",
    phone: "(555) 123-4567",
    location: "New York, USA",
    total_experience: "9 years 4 months",
    skills: ["Python", "TensorFlow", "Docker", "Kubernetes"],
    experience: [
      { title: "Lead AI/ML Engineer", company: "Appsian", years: "2021 – Present" },
      { title: "Senior Data Scientist", company: "Data Insights Corp", years: "2018 – 2021" }
    ],
    education: [
      { degree: "Master’s Degree in Computer Science", institution: "Pace University", years: "2014 – 2016" },
      { degree: "Machine Learning Specialization", institution: "DeepLearning.AI" }
    ]
  });

  const inputRef = useRef(null);

  // File selection
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Upload
  const onUpload = async () => {
    if (!file) return;
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(UPLOAD_URL, { method: "POST", body: fd });
      const data = await res.json();

      if (data.ok) {
        setFields(data.parsed); // replace mock with backend response
      }
    } catch (err) {
      console.error("Upload failed:", err);
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

      {/* Snapshot */}
      <SnapshotCard fields={fields} />

      {/* Skills */}
      <SkillsCard fields={fields} />

      {/* Education */}
      <EducationCard fields={fields} />
    </div>
  );
}
