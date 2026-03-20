/**
 * アンケート回答CSVダウンロードボタン
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreateButton } from "@/app/(admin)/components/CreateButton";

// レスポンスヘッダーに入っている「Content-Disposition」ヘッダーの値から、ファイル名を取り出す関数
function parseFilenameFromContentDisposition(
  contentDisposition: string | null,
): string | null {
  if (!contentDisposition) return null;
  const filenameStarMatch = contentDisposition.match(
    /filename\*\s*=\s*UTF-8''([^;]+)/i,
  );
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }
  const filenameMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"/i);
  if (filenameMatch?.[1]) return filenameMatch[1];
  const filenameUnquotedMatch = contentDisposition.match(
    /filename\s*=\s*([^;]+)/i,
  );
  return filenameUnquotedMatch?.[1]?.trim() ?? null;
}

export function SurveyResultsCsvButton() {
  const searchParams = useSearchParams();
  const questionnaireId = searchParams.get("id");
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (isDownloading) return;
    if (!questionnaireId) {
      console.warn("questionnaireId is missing");
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/survey-results/api/csv?questionnaireId=${encodeURIComponent(
          questionnaireId,
        )}`,
      );

      if (!response.ok) {
        console.error("CSV download failed", {
          status: response.status,
          statusText: response.statusText,
        });
        setErrorMessage("CSVダウンロードに失敗しました。再度お試しください。");
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        parseFilenameFromContentDisposition(contentDisposition) ??
        `survey-results-${questionnaireId}.csv`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV download error", error);
      setErrorMessage("CSVダウンロードに失敗しました。再度お試しください。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <CreateButton
        icon="/download.svg"
        label={isDownloading ? "ダウンロード中..." : "CSVダウンロード"}
        onClick={handleDownload}
        disabled={isDownloading}
      />
      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
