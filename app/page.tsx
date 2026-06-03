"use client";

import { useEffect, useState, useCallback } from "react";
import StepPills from "@/components/StepPills";
import PICItem from "@/components/PICItem";

interface PICStatus {
  name: string;
  total: number;
  filled: number;
  done: number;
  complete: boolean;
}

export default function HomePage() {
  const [title, setTitle] = useState("Jadwal Kunjungan PM");
  const [pics, setPics] = useState<PICStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const titleRes = await fetch("/api/title");
      if (titleRes.ok) {
        const titleData = await titleRes.json();
        setTitle(titleData.title);
      }

      const picRes = await fetch("/api/pic-status");
      if (!picRes.ok) {
        const errData = await picRes.json();
        throw new Error(errData.error || "Gagal memuat data PIC");
      }
      const picData: PICStatus[] = await picRes.json();
      setPics(picData);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull-to-refresh via touch
  const [pullStart, setPullStart] = useState(0);
  const [pullDist, setPullDist] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart === 0) return;
    const dist = Math.max(0, e.touches[0].clientY - pullStart);
    setPullDist(Math.min(dist, 80));
  };

  const handleTouchEnd = () => {
    if (pullDist > 50) {
      fetchData(true);
    }
    setPullStart(0);
    setPullDist(0);
  };

  const handleExport = () => {
    window.open("/api/export", "_blank");
  };

  const totalSites = pics.reduce((sum, p) => sum + p.total, 0);
  const doneSites = pics.reduce((sum, p) => sum + p.done, 0);
  const doneCount = pics.filter((p) => p.complete).length;
  const openCount = pics.filter((p) => !p.complete).length;
  const openPICs = pics.filter((p) => !p.complete);
  const completePICs = pics.filter((p) => p.complete);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] pb-4">
        <header className="bg-white px-4 pt-4 pb-3 shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-3 h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
              <div className="h-px w-6 bg-gray-200" />
              <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </header>

        <div className="mx-auto mt-4 max-w-md px-4">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto mb-1 h-8 w-12 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto mb-1 h-8 w-12 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-2 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
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
          <button
            onClick={() => fetchData()}
            className="mt-4 rounded-lg bg-[#1d72f5] px-4 py-2 text-sm text-white"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const donePct = totalSites > 0 ? Math.round((doneSites / totalSites) * 100) : 0;

  return (
    <div
      className="min-h-screen bg-[#f4f6f9] pb-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDist > 0 && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: pullDist, opacity: pullDist / 80 }}
        >
          <div
            className={`h-6 w-6 rounded-full border-2 border-[#1d72f5] ${
              pullDist > 50 ? "animate-spin border-t-transparent" : "border-b-transparent"
            }`}
          />
        </div>
      )}

      {/* Refresh indicator */}
      {refreshing && (
        <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2 rounded-full bg-[#1d72f5] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          ↻ Memperbarui...
        </div>
      )}

      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <h1 className="text-center text-lg font-bold text-[#111827]">
              {title}
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={handleExport}
                className="rounded-lg bg-[#0ea56b] px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 hover:bg-[#0c8f5c]"
              >
                Export
              </button>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#6b7280] transition-all active:scale-90 hover:bg-gray-200 disabled:opacity-50"
                aria-label="Refresh"
              >
                ↻
              </button>
            </div>
          </div>
          <StepPills activeStep={1} />
        </div>
      </header>

      {/* Stats Cards */}
      <div className="mx-auto mt-4 max-w-md px-4">
        {/* Overall progress bar */}
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6b7280]">
              Progress Submit ke Oneflux
            </span>
            <span className="text-xs font-bold text-[#111827]">
              {doneSites}/{totalSites} ({donePct}%)
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0ea56b] to-[#06d6a0] transition-all duration-700"
              style={{ width: `${donePct}%` }}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0ea56b]">
              {doneCount}
            </div>
            <div className="text-xs text-[#6b7280]">PIC Complete</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#f59e0b]">
              {openCount}
            </div>
            <div className="text-xs text-[#6b7280]">PIC Open</div>
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
