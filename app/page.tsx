"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepPills from "@/components/StepPills";
import PICItem from "@/components/PICItem";
import { RegionTabs } from "@/components/RegionTabs";
import { parseRegion, REGION_LABELS, type Region } from "@/lib/regions";

interface PICStatus {
  name: string;
  total: number;
  filled: number;
  done: number;
  complete: boolean;
  submitted: boolean;
}

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const region: Region = parseRegion(searchParams.get("region"));

  const [title, setTitle] = useState("Jadwal Kunjungan PM");
  const [pics, setPics] = useState<PICStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const setRegion = (next: Region) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set("region", next);
    router.replace(`/?${q.toString()}`, { scroll: false });
  };

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const titleRes = await fetch("/api/title");
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          setTitle(titleData.title);
        }

        const picRes = await fetch(`/api/pic-status?region=${region}`);
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
    },
    [region],
  );

  useEffect(() => {
    setLoading(true);
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

  const handleExport = (exportRegion: Region) => {
    window.open(`/api/export?region=${exportRegion}`, "_blank");
    setShowExport(false);
  };

  const totalSites = pics.reduce((sum, p) => sum + p.total, 0);
  const doneSites = pics.reduce((sum, p) => sum + p.done, 0);
  const submittedCount = pics.filter((p) => p.submitted).length;
  const completeNotSubmittedCount = pics.filter(
    (p) => p.complete && !p.submitted,
  ).length;
  const incompleteCount = pics.filter((p) => !p.complete).length;

  const incompletePICs = pics.filter((p) => !p.complete);
  const completeNotSubmittedPICs = pics.filter(
    (p) => p.complete && !p.submitted,
  );
  const submittedPICs = pics.filter((p) => p.submitted);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f7]">
        <header className="glass-nav px-4 pt-4 pb-3">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-3 h-6 w-48 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
            <div className="flex justify-center py-2">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-[rgba(118,118,128,0.12)]" />
            </div>
          </div>
        </header>
        <div className="mx-auto mt-4 max-w-md px-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card animate-pulse p-3 text-center"
              >
                <div className="mx-auto mb-1 h-6 w-8 rounded bg-[rgba(118,118,128,0.12)]" />
                <div className="mx-auto h-3 w-16 rounded bg-[rgba(118,118,128,0.08)]" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="glass-card mb-2 flex items-center gap-3 p-4"
            >
              <div className="h-11 w-11 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
              <div className="flex-1">
                <div className="mb-1 h-4 w-32 animate-pulse rounded bg-[rgba(118,118,128,0.12)]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[rgba(118,118,128,0.08)]" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f2f7] p-4">
        <div className="glass-card p-6 text-center">
          <div className="mb-2 text-3xl">⚠️</div>
          <p className="text-[15px] font-[590] tracking-[-0.23px] text-[#ff3b30]">
            {error}
          </p>
          <p className="mt-2 text-[13px] tracking-[-0.08px] text-[#8e8e93]">
            Periksa konfigurasi Google Service Account dan Spreadsheet ID di
            file .env.local
          </p>
          <button
            onClick={() => fetchData()}
            className="btn-ios btn-ios-primary mt-4"
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
      className="min-h-screen bg-[#f2f2f7] pb-4"
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
            className={`h-6 w-6 rounded-full border-2 border-[#007aff] ${
              pullDist > 50 ? "animate-spin border-t-transparent" : "border-b-transparent"
            }`}
          />
        </div>
      )}

      {/* Refresh indicator */}
      {refreshing && (
        <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2 rounded-full bg-[#007aff] px-4 py-1.5 text-[12px] font-[590] text-white shadow-lg">
          ↻ Memperbarui...
        </div>
      )}

      {/* Header */}
      <header className="glass-nav px-4 pt-4 pb-3">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-[590] tracking-[-0.45px] text-[#1c1c1e]">
              {title}
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowExport(true)}
                className="btn-ios btn-ios-outline !px-4 !py-1.5 !text-[12px]"
              >
                Export
              </button>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(118,118,128,0.08)] text-[15px] text-[#8e8e93] transition-all active:scale-90 hover:bg-[rgba(118,118,128,0.12)] disabled:opacity-50"
                aria-label="Refresh"
              >
                ↻
              </button>
            </div>
          </div>
          <div className="py-2">
            <StepPills activeStep={1} />
          </div>
          <div className="pb-1">
            <RegionTabs value={region} onChange={setRegion} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto mt-4 max-w-md px-4">
        {/* Overall progress */}
        <div className="glass-card mb-4 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium tracking-[-0.08px] text-[#8e8e93]">
              Progress Submit ke Oneflux
            </span>
            <span className="text-[13px] font-[590] tracking-[-0.08px] text-[#1c1c1e]">
              {doneSites}/{totalSites} ({donePct}%)
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(118,118,128,0.12)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#34c759] to-[#30d158] transition-all duration-700"
              style={{ width: `${donePct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="segment-control mb-5 grid w-full grid-cols-3 !bg-transparent !p-0">
          {[
            { count: incompleteCount, label: "Belum Complete", color: "#ff3b30" },
            { count: completeNotSubmittedCount, label: "Complete", color: "#ff9500" },
            { count: submittedCount, label: "Disubmit", color: "#34c759" },
          ].map((s, i) => (
            <div key={i} className="glass-card mx-1 p-3 text-center">
              <div
                className="text-[22px] font-[590] tracking-[-0.35px]"
                style={{ color: s.color }}
              >
                {s.count}
              </div>
              <div className="text-[11px] font-medium tracking-[-0.06px] text-[#8e8e93]">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        {[
          { pics: incompletePICs, label: "Belum Complete" },
          { pics: completeNotSubmittedPICs, label: "Complete" },
          { pics: submittedPICs, label: "Disubmit" },
        ].map(
          (section) =>
            section.pics.length > 0 && (
              <div key={section.label} className="mb-4">
                <h2 className="mb-2 text-[13px] font-[590] tracking-[-0.08px] text-[#8e8e93] uppercase">
                  PIC — {section.label}
                </h2>
                <div className="space-y-2">
                  {section.pics.map((pic) => (
                    <PICItem key={pic.name} {...pic} region={region} />
                  ))}
                </div>
              </div>
            ),
        )}

        {pics.length === 0 && (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl">📋</div>
            <p className="mt-2 text-[15px] tracking-[-0.23px] text-[#8e8e93]">
              Tidak ada data PIC ditemukan.
            </p>
          </div>
        )}
      </div>

      {/* Export dialog */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="mb-4 text-center text-4xl">📤</div>
            <h3 className="mb-1 text-center text-[17px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
              Export Jadwal
            </h3>
            <p className="mb-6 text-center text-[15px] tracking-[-0.23px] text-[#8e8e93]">
              Pilih region untuk di-export (xlsx, kolom terpisah).
            </p>
            <div className="flex flex-col gap-3">
              {(["kalbar", "kalteng"] as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleExport(r)}
                  className="btn-ios btn-ios-outline w-full justify-between"
                >
                  <span>{REGION_LABELS[r]}</span>
                  <span className="text-[12px] text-[#8e8e93]">.xlsx</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExport(false)}
              className="btn-ios btn-ios-primary mt-3 w-full"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePageWrapper() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
