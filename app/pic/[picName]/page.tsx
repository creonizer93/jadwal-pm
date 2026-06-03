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
  mo_site: string;
  status: string;
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

  const mrSites = sites.filter((s) => s.type === "MR");
  const vwSites = sites.filter((s) => s.type === "VW");

  const firstUnfilled = sites.find(
    (s) => (updates[s.rowIndex] || s.jadwal || "").trim() === "",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f7]">
        <header className="glass-nav px-4 pt-4 pb-3">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
              <div className="h-5 w-32 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
            </div>
            <div className="flex justify-center py-2">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-[rgba(118,118,128,0.12)]" />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-md px-4">
          <div className="glass-card mt-3 flex items-center gap-3 p-4">
            <div className="h-11 w-11 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-32 animate-pulse rounded bg-[rgba(118,118,128,0.12)]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[rgba(118,118,128,0.08)]" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card flex items-center gap-3 p-4">
                <div className="h-10 w-1 animate-pulse rounded-full bg-[rgba(118,118,128,0.12)]" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-40 animate-pulse rounded bg-[rgba(118,118,128,0.12)]" />
                  <div className="h-3 w-24 animate-pulse rounded bg-[rgba(118,118,128,0.08)]" />
                </div>
                <div className="h-9 w-28 animate-pulse rounded-xl bg-[rgba(118,118,128,0.12)]" />
              </div>
            ))}
          </div>
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
          <button
            onClick={() => router.push("/")}
            className="btn-ios btn-ios-primary mt-4"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] pb-24">
      {/* Header */}
      <header className="glass-nav px-4 pt-4 pb-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-[15px] font-medium tracking-[-0.23px] text-[#007aff] transition-opacity active:opacity-60"
          >
            ← Kembali
          </button>
          <h1 className="text-[15px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
            Pengisian Jadwal
          </h1>
        </div>
        <div className="py-2">
          <StepPills activeStep={2} />
        </div>
      </header>

      {/* PIC Bar */}
      <div className="mx-auto max-w-md px-4">
        <div className="glass-card mt-3 flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#007aff] text-[13px] font-[590] text-white">
            {getInitials(picName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
              {picName}
            </div>
            <div className="mt-0.5 text-[13px] tracking-[-0.08px] text-[#8e8e93]">
              {totalSites} site
            </div>
          </div>
        </div>

        {/* Alert */}
        {filledCount > 0 && (
          <div className="glass-card mt-3 border-[#ff9500]/20 bg-[#ff9500]/8 p-3 text-[13px] tracking-[-0.08px] text-[#cc7a00]">
            ⚠️ Sudah ada {filledCount} jadwal yang pernah diisi. Anda bisa
            mengubah tanggal jadwal yang sudah ada.
          </div>
        )}

        {/* Progress */}
        <div className="glass-card mt-4 p-4">
          <ProgressBar filled={filledFromUpdates} total={totalSites} />
        </div>

        {/* MR Sites */}
        {mrSites.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-[13px] font-[590] tracking-[-0.08px] text-[#8e8e93] uppercase">
              Maintenance & Repair
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
                  isDone={site.status === "Done"}
                  moSite={site.mo_site || ""}
                />
              ))}
            </div>
          </div>
        )}

        {/* VW Sites */}
        {vwSites.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-[13px] font-[590] tracking-[-0.08px] text-[#8e8e93] uppercase">
              Visual Walk
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
                  isDone={site.status === "Done"}
                  moSite={site.mo_site || ""}
                />
              ))}
            </div>
          </div>
        )}

        {sites.length === 0 && (
          <div className="glass-card mt-6 p-8 text-center">
            <div className="text-4xl">🏗️</div>
            <p className="mt-2 text-[15px] tracking-[-0.23px] text-[#8e8e93]">
              Tidak ada site untuk PIC ini.
            </p>
          </div>
        )}
      </div>

      {/* Success notification */}
      {saveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="glass-card mx-4 max-w-sm p-6 text-center">
            <div className="mb-2 text-3xl">✅</div>
            <p className="text-[15px] font-[590] tracking-[-0.23px] text-[#34c759]">
              Jadwal berhasil disimpan!
            </p>
            <p className="mt-1 text-[13px] tracking-[-0.08px] text-[#8e8e93]">
              Mengalihkan ke dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="glass-card p-6 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[#007aff] border-t-transparent" />
            <p className="text-[15px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
              Menyimpan...
            </p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="mb-4 text-center text-4xl">📋</div>
            <h3 className="mb-1 text-center text-[17px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
              Simpan Jadwal?
            </h3>
            <p className="mb-6 text-center text-[15px] tracking-[-0.23px] text-[#8e8e93]">
              {totalSites} jadwal akan ditulis ke spreadsheet.
              <br />
              Data lama akan ditimpa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-ios btn-ios-outline flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSave();
                }}
                className="btn-ios btn-ios-primary flex-1"
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
