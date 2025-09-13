// src/components/UploadCard.jsx
import React from "react";
import { Card, CardContent } from "./ui/card";

import { Button } from "./ui/button";
import { Upload } from "lucide-react";

export default function UploadCard({ file, uploadProgress, inputRef, onPickFile, onUpload }) {
  return (
    <Card className="lg:col-span-1 border-dashed border-2 border-slate-300">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <Upload className="h-10 w-10 text-slate-400" />
        <p className="mt-2 text-sm text-slate-500">Click to upload or drag & drop</p>
        <p className="text-xs text-slate-400">PDF, DOCX, TXT (max 5MB)</p>

        <div className="mt-4 flex gap-3">
          <Button onClick={() => inputRef.current?.click()} className="bg-slate-900 hover:bg-slate-800">
            Choose file
          </Button>
          <Button onClick={onUpload} disabled={!file} className="bg-indigo-600 hover:bg-indigo-500">
            Upload
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          onChange={onPickFile}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />

        {file && <p className="mt-3 text-sm text-slate-700">Selected: {file.name}</p>}

        {uploadProgress > 0 && (
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
