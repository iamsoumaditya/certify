"use client";

import { useEffect, useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import {
  CERTIFICATE_HEIGHT,
  CERTIFICATE_WIDTH,
  Certificate,
} from "@/components/Certificate";
import { jsPDF } from "jspdf";
import { Download, Loader2 } from "lucide-react";

interface CertificateRecord {
  id: string;
  userId: string | null;
  courseName: string | null;
  instructorName: string | null;
  courseLength: string | null;
  completionDate: string | null;
  referenceNo: string | null;
  cloudinaryUrl: string | null;
  cloudinaryId: string | null;
  createdAt: string | null;
}

interface CertificateResponse {
  certificate: CertificateRecord;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  isOwner: boolean;
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user, isLoaded } = useUser();
  const [certData, setCertData] = useState<CertificateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCert() {
      try {
        const res = await fetch(`/api/certificates/${id}`);
        if (!res.ok) {
          throw new Error("Certificate not found");
        }
        const data: CertificateResponse = await res.json();
        setCertData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [id]);

  const downloadJPG = async () => {
    if (!certData?.certificate?.cloudinaryUrl) return;
    
    try {
      const response = await fetch(certData.certificate.cloudinaryUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-UC-${certData.certificate.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Failed to download JPG:", error);
      alert("Failed to download JPG image. Please try again.");
    }
  };

  const downloadPDF = async () => {
    if (!certData?.certificate?.cloudinaryUrl) return;
    
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT]
      });
      
      // Load image from cloudinary url to embed in PDF
      // We must fetch it to base64 first to avoid CORS issues in jsPDF sometimes
      const response = await fetch(certData.certificate.cloudinaryUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result as string;
        pdf.addImage(base64data, 'JPEG', 0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT);
        pdf.save(`Certificate-UC-${certData.certificate.id}.pdf`);
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Failed to load certificate"}</p>
        </div>
      </div>
    );
  }

  const { certificate, user: ownerUser, isOwner } = certData;

  // We can determine ownership by the API response which uses clerk session, 
  // or by verifying client-side if user is logged in and IDs match
  const viewerIsOwner = isOwner || (user && certificate.userId && user.id === certificate.userId); // simplified

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {viewerIsOwner && (
        <div className="mb-8 flex w-full max-w-[1280px] flex-col items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Certificate is Ready!</h2>
            <p className="text-sm text-gray-500">You can download it in multiple formats.</p>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button 
              onClick={downloadJPG}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <Download className="mr-2 h-4 w-4" />
              Download JPG
            </button>
            <button 
              onClick={downloadPDF}
              className="flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Actual Certificate Image rendered from Cloudinary URL for best fidelity */}
      {certificate.cloudinaryUrl ? (
        <div className="w-full max-w-[1280px] overflow-hidden rounded-sm bg-white shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={certificate.cloudinaryUrl} 
            alt="Certificate of Completion" 
            className="w-full h-auto"
          />
        </div>
      ) : (
        /* Fallback if Cloudinary image is not available */
        <div className="max-w-full overflow-auto rounded-sm bg-white p-4 shadow-lg">
          <div style={{ transformOrigin: 'top center', maxWidth: `${CERTIFICATE_WIDTH}px`, margin: '0 auto' }}>
            <Certificate 
              studentName={`${ownerUser.firstName} ${ownerUser.lastName}`.trim()}
              courseName={certificate.courseName || "Course Name"}
              instructorName={certificate.instructorName || "Instructor"}
              completionDate={certificate.completionDate || "Date"}
              courseLength={certificate.courseLength || "Hours"}
              uuid={certificate.id}
              referenceNo={certificate.referenceNo || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
