"use client";

import { useEffect, useState } from "react";
import StepPills from "@/components/StepPills";
import PICItem from "@/components/PICItem";

interface PICStatus {
  name: string;
  total: number;
  filled: number;
  complete: boolean;
}

export default function HomePage() {
  const [title, setTitle] = useState("Jadwal Kunjungan PM");
  const [pics, setPics] = useState<PICStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch title (optional, may fail if not configured)
        const titleRes = await fetch("/api/title");
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          setTitle(titleData.title);
        }

        // Fetch PIC status
        const picRes = await fetch("/api/pic-status");
        if (!picRes.ok) {
          const errData = await picRes.json();
          throw new Error(errData.error || "Gagal memuat data PIC");
        }
        const picData: PICStatus[] = await picRes.json();
        setPics(picData);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const completeCount = pics.filter((p) => p.complete).length;
  const openCount = pics.filter((p) => !p.complete).length;
  const openPICs = pics.filter((p) => !p.complete);
  const completePICs = pics.filter((p) => p.complete);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d72f5] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-xl bg-red-50 p-6 text-center shadow-sm">
          <div className="mb-2 text-2xl">⚠️</div>
          <p className="text-sm font-semibold text-[#e53935]">{error}</p>
          <p className="mt-2 text-xs text-[#6b7280]">
            Periksa konfigurasi Google Service Account dan Spreadsheet ID di
            file .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-4">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-center text-lg font-bold text-[#111827]">
          {title}
        </h1>
        <StepPills activeStep={1} />
      </header>

      {/* Stats Cards */}
      <div className="mx-auto mt-4 max-w-md px-4">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0ea56b]">
              {completeCount}
            </div>
            <div className="text-xs text-[#6b7280]">Complete</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#f59e0b]">
              {openCount}
            </div>
            <div className="text-xs text-[#6b7280]">Open</div>
          </div>
        </div>

        {/* Open PICs */}
        {openPICs.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-semibold text-[#6b7280]">
              PIC — Belum Complete
            </h2>
            <div className="space-y-2">
              {openPICs.map((pic) => (
                <PICItem key={pic.name} {...pic} />
              ))}
            </div>
          </div>
        )}

        {/* Complete PICs */}
        {completePICs.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-[#6b7280]">
              PIC — Complete
            </h2>
            <div className="space-y-2">
              {completePICs.map((pic) => (
                <PICItem key={pic.name} {...pic} />
              ))}
            </div>
          </div>
        )}

        {pics.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">📋</div>
            <p className="mt-2 text-sm text-[#6b7280]">
              Tidak ada data PIC ditemukan. Periksa apakah spreadsheet sudah
              dibagikan ke Service Account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
