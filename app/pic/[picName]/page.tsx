"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepPills from "@/components/StepPills";
import ProgressBar from "@/components/ProgressBar";
import SiteRow from "@/components/SiteRow";
import StickyFooter from "@/components/StickyFooter";

interface Site {
  rowIndex: number;
  type: "MR" | "VW";
  site_id: string;
  tower_name: string;
  pic: string;
  jadwal: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PICPage({
  params,
}: {
  params: { picName: string };
}) {
  const router = useRouter();
  const picName = decodeURIComponent(params.picName);

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [updates, setUpdates] = useState<Record<number, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch(`/api/sites/${encodeURIComponent(picName)}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memuat data site");
        }
        const data: Site[] = await res.json();
        setSites(data);

        // Initialize updates with existing jadwal values
        const init: Record<number, string> = {};
        for (const s of data) {
          if (s.jadwal) init[s.rowIndex] = s.jadwal;
        }
        setUpdates(init);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, [picName]);

  const handleDateChange = (rowIndex: number, value: string) => {
    setUpdates((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        next[rowIndex] = value;
      } else {
        delete next[rowIndex];
      }
      return next;
    });
  };

  const totalSites = sites.length;
  const filledCount = sites.filter((s) => s.jadwal.trim() !== "").length;
  const filledFromUpdates = sites.filter(
    (s) => (updates[s.rowIndex] || "").trim() !== "",
  ).length;

  const allFilled = filledFromUpdates >= totalSites && totalSites > 0;

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const handleSave = async () => {
    if (!allFilled || saving) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const updateList = sites.map((s) => ({
        rowIndex: s.rowIndex,
        jadwal: updates[s.rowIndex] || "",
      }));

      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: updateList }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan jadwal");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Group by type
  const mrSites = sites.filter((s) => s.type === "MR");
  const vwSites = sites.filter((s) => s.type === "VW");

  // Find first unfilled for auto-scroll
  const firstUnfilled = sites.find(
    (s) => (updates[s.rowIndex] || s.jadwal || "").trim() === "",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9]">
        <header className="bg-white px-4 pt-4 pb-3 shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
              <div className="h-px w-6 bg-gray-200" />
              <div className="h-8 w-32 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-md px-4">
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border-l-4 border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex-1">
                  <div className="mb-1 h-4 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
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
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-[#1d72f5] px-4 py-2 text-sm text-white"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-24">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827]"
          >
            ← Kembali
          </button>
          <h1 className="text-sm font-semibold text-[#111827]">Pengisian Jadwal</h1>
        </div>
        <StepPills activeStep={2} />
      </header>

      {/* PIC Bar */}
      <div className="mx-auto max-w-md px-4">
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d72f5] text-sm font-bold text-white">
            {getInitials(picName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[#111827]">
              {picName}
            </div>
            <div className="mt-0.5 text-xs text-[#6b7280]">
              {totalSites} site
            </div>
          </div>
        </div>

        {/* Alert if already some filled */}
        {filledCount > 0 && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-[#92400e]">
            ⚠️ Sudah ada {filledCount} jadwal yang pernah diisi. Anda bisa
            mengubah tanggal jadwal yang sudah ada.
          </div>
        )}

        {/* Progress */}
        <div className="mt-4">
          <ProgressBar filled={filledFromUpdates} total={totalSites} />
        </div>

        {/* MR Sites */}
        {mrSites.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-sm font-bold text-[#111827]">
              Maintenance & Repair (MR)
            </h2>
            <div className="space-y-2">
              {mrSites.map((site) => (
                <SiteRow
                  key={site.rowIndex}
                  rowIndex={site.rowIndex}
                  type={site.type}
                  site_id={site.site_id}
                  tower_name={site.tower_name}
                  jadwal={updates[site.rowIndex] || site.jadwal || ""}
                  onChange={handleDateChange}
                  isTarget={firstUnfilled?.rowIndex === site.rowIndex}
                />
              ))}
            </div>
          </div>
        )}

        {/* VW Sites */}
        {vwSites.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-[#111827]">
              Visual Walk (VW)
            </h2>
            <div className="space-y-2">
              {vwSites.map((site) => (
                <SiteRow
                  key={site.rowIndex}
                  rowIndex={site.rowIndex}
                  type={site.type}
                  site_id={site.site_id}
                  tower_name={site.tower_name}
                  jadwal={updates[site.rowIndex] || site.jadwal || ""}
                  onChange={handleDateChange}
                  isTarget={firstUnfilled?.rowIndex === site.rowIndex}
                />
              ))}
            </div>
          </div>
        )}

        {sites.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">🏗️</div>
            <p className="mt-2 text-sm text-[#6b7280]">
              Tidak ada site untuk PIC ini.
            </p>
          </div>
        )}
      </div>

      {/* Success notification */}
      {saveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-3xl">✅</div>
            <p className="text-sm font-semibold text-[#0ea56b]">
              Jadwal berhasil disimpan!
            </p>
            <p className="mt-1 text-xs text-[#6b7280]">
              Mengalihkan ke dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d72f5] border-t-transparent" />
            <p className="mt-3 text-sm font-semibold text-[#111827]">
              Menyimpan...
            </p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center text-4xl">📋</div>
            <h3 className="mb-1 text-center text-base font-bold text-[#111827]">
              Simpan Jadwal?
            </h3>
            <p className="mb-6 text-center text-sm text-[#6b7280]">
              {totalSites} jadwal akan ditulis ke spreadsheet. <br />
              Data lama akan ditimpa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-[#6b7280] transition-all active:scale-[0.98] hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSave();
                }}
                className="flex-1 rounded-xl bg-[#0ea56b] py-3 text-sm font-bold text-white transition-all active:scale-[0.98] hover:bg-[#0c8f5c]"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Footer */}
      <StickyFooter
        disabled={!allFilled || saving}
        onSave={handleSaveClick}
      />
    </div>
  );
}
