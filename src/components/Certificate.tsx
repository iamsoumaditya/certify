import React, { forwardRef } from "react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  courseLength: string;
  uuid: string;
  referenceNo: string;
}

export const CERTIFICATE_WIDTH = 1600;
export const CERTIFICATE_HEIGHT = 1200;

function formatCompletionDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatReferenceNo(value: string) {
  if (!value) {
    return "0000";
  }

  return /^\d+$/.test(value) ? value.padStart(4, "0") : value;
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  (
    {
      studentName,
      courseName,
      instructorName,
      completionDate,
      courseLength,
      uuid,
      referenceNo,
    },
    ref
  ) => {
    const certificateNumber = uuid ? `UC-${uuid}` : "UC-880bc6a4-f9k0-9h0x-1810-36x4dd2d2b44";
    const certificateUrl = `ude.my/${certificateNumber}`;
    const displayReferenceNo = formatReferenceNo(referenceNo);
    const displayDate = formatCompletionDate(completionDate);

    return (
      <div
        ref={ref}
        className="certificate-container"
        style={{
          width: `${CERTIFICATE_WIDTH}px`,
          height: `${CERTIFICATE_HEIGHT}px`,
          backgroundColor: "#f6f6f8",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          color: "#15161c",
          fontFamily:
            'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "58px",
            left: "92px",
            width: "340px",
            height: "120px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/udemy.png"
            alt="Udemy"
            style={{
              width: "305px",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "74px",
            right: "96px",
            textAlign: "right",
            color: "#64666d",
            fontSize: "19px",
            lineHeight: 1.55,
            fontWeight: 400,
          }}
        >
          <div>Certificate no: {certificateNumber}</div>
          <div>Certificate url: {certificateUrl}</div>
          <div>Reference Number: {displayReferenceNo}</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "306px",
            left: "96px",
            fontSize: "29px",
            letterSpacing: "0.15em",
            fontWeight: 600,
            color: "#676a72",
          }}
        >
          CERTIFICATE OF COMPLETION
        </div>

        <div
          style={{
            position: "absolute",
            top: "388px",
            left: "96px",
            maxWidth: "1360px",
            fontSize: "90px",
            lineHeight: 1.03,
            fontWeight: 800,
            letterSpacing: 0,
            color: "#191a21",
            wordBreak: "break-word",
          }}
        >
          {courseName}
        </div>

        <div
          style={{
            position: "absolute",
            top: "604px",
            left: "96px",
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            fontSize: "25px",
            color: "#17181d",
          }}
        >
          <span style={{ fontWeight: 400 }}>Instructors</span>
          <span style={{ fontWeight: 700 }}>{instructorName}</span>
        </div>

        <div
          style={{
            position: "absolute",
            left: "96px",
            bottom: "150px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              maxWidth: "980px",
              fontSize: "74px",
              lineHeight: 1,
              fontWeight: 800,
              color: "#191a21",
              wordBreak: "break-word",
            }}
          >
            {studentName}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "25px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontWeight: 400 }}>Date</span>
              <span style={{ fontWeight: 700 }}>{displayDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontWeight: 400 }}>Length</span>
              <span style={{ fontWeight: 700 }}>{courseLength}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Certificate.displayName = "Certificate";
