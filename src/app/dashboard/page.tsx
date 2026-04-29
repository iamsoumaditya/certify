"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { flushSync } from "react-dom";
import {
  CERTIFICATE_HEIGHT,
  CERTIFICATE_WIDTH,
  Certificate,
} from "@/components/Certificate";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [courseName, setCourseName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [courseLength, setCourseLength] = useState("");
  const [studentName, setStudentName] = useState("");
  const [captureMeta, setCaptureMeta] = useState<{ uuid: string; referenceNo: string } | null>(null);
  const [previewReferenceNo, setPreviewReferenceNo] = useState("0001");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Initialize student name from Clerk when loaded
  if (isLoaded && user && !studentName && studentName === "") {
    setStudentName(`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.primaryEmailAddress?.emailAddress || "Student");
  }

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    let cancelled = false;

    async function loadPreviewReferenceNo() {
      try {
        const res = await fetch("/api/certificates", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch certificates");
        }

        const data: { certificates: Array<unknown> } = await res.json();
        const nextRefNo = String(data.certificates.length + 1).padStart(4, "0");

        if (!cancelled) {
          setPreviewReferenceNo(nextRefNo);
        }
      } catch (error) {
        console.error("Failed to load preview reference number:", error);
      }
    }

    loadPreviewReferenceNo();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user]);

  const uploadToCloudinary = async (base64Image: string) => {
    // 1. Get signature from backend
    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paramsToSign: { folder: 'certificates' }
      })
    });
    
    if (!signRes.ok) throw new Error("Failed to get signature");
    const { signature, timestamp, cloudName, apiKey } = await signRes.json();

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary keys missing");
    }

    // 2. Upload to Cloudinary using formData
    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("folder", "certificates");
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Failed to upload to Cloudinary: ${errorText}`);
    }
    const data = await uploadRes.json();
    
    return {
      url: data.secure_url,
      public_id: data.public_id
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsGenerating(true);
    try {
      const dbRes = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          instructorName,
          courseLength,
          completionDate,
        })
      });

      if (!dbRes.ok) throw new Error("Failed to create certificate in DB");

      const dbData: { id: string; referenceNo: string } = await dbRes.json();

      flushSync(() => {
        setCaptureMeta({
          uuid: dbData.id,
          referenceNo: dbData.referenceNo,
        });
      });

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (!captureRef.current) {
        throw new Error("Certificate capture surface not ready");
      }

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const base64Image = canvas.toDataURL("image/png");
      
      const uploadData = await uploadToCloudinary(base64Image);

      const updateRes = await fetch(`/api/certificates/${dbData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryUrl: uploadData.url,
          cloudinaryId: uploadData.public_id
        })
      });

      if (!updateRes.ok) throw new Error("Failed to update certificate image in DB");

      setPreviewReferenceNo(String(Number(dbData.referenceNo) + 1).padStart(4, "0"));
      
      router.push(`/certificate/${dbData.id}`);
      
    } catch (error) {
      console.error(error);
      alert("Failed to generate certificate. Please check console for details.");
    } finally {
      setCaptureMeta(null);
      setIsGenerating(false);
    }
  };

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 xl:grid xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <div className="w-full self-start rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Create Certificate</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Student Name</label>
              <input 
                required
                type="text" 
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Course Name</label>
              <input 
                required
                type="text" 
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="e.g. Complete Web Development Bootcamp"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Instructor Name</label>
              <input 
                required
                type="text" 
                value={instructorName}
                onChange={e => setInstructorName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Completion Date</label>
                <input 
                  required
                  type="date" 
                  value={completionDate}
                  onChange={e => setCompletionDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Total Hours</label>
                <input 
                  required
                  type="text" 
                  value={courseLength}
                  onChange={e => setCourseLength(e.target.value)}
                  placeholder="e.g. 10.5 total hours"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating}
              className="mt-6 flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : "Generate Certificate"}
            </button>
          </form>
        </div>

        <div className="min-w-0">
          <h3 className="mb-4 text-center text-sm font-medium uppercase tracking-[0.16em] text-gray-500">Live Preview</h3>
          <div className="overflow-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
            <div
              className="mx-auto"
              style={{
                width: `${Math.round(CERTIFICATE_WIDTH * 0.72)}px`,
                height: `${Math.round(CERTIFICATE_HEIGHT * 0.72)}px`,
              }}
            >
              <div
                style={{
                  transform: "scale(0.72)",
                  transformOrigin: "top left",
                  width: `${CERTIFICATE_WIDTH}px`,
                  height: `${CERTIFICATE_HEIGHT}px`,
                }}
              >
                <Certificate 
                  studentName={studentName || "Student Name"}
                  courseName={courseName || "Course Name"}
                  instructorName={instructorName || "Instructor"}
                  completionDate={completionDate || "Date"}
                  courseLength={courseLength || "Hours"}
                  uuid=""
                  referenceNo={previewReferenceNo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {captureMeta ? (
        <div className="pointer-events-none fixed left-[-10000px] top-0 opacity-0">
          <Certificate
            ref={captureRef}
            studentName={studentName || "Student Name"}
            courseName={courseName || "Course Name"}
            instructorName={instructorName || "Instructor"}
            completionDate={completionDate || "Date"}
            courseLength={courseLength || "Hours"}
            uuid={captureMeta.uuid}
            referenceNo={captureMeta.referenceNo}
          />
        </div>
      ) : null}
    </div>
  );
}
