"use client";

interface StickyFooterProps {
  disabled: boolean;
  onSave: () => void;
  hint?: string;
}

export default function StickyFooter({
  disabled,
  onSave,
  hint = "Isi semua tanggal untuk mengaktifkan tombol simpan",
}: StickyFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-center text-xs text-[#6b7280]">{hint}</p>
        <button
          onClick={onSave}
          disabled={disabled}
          className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all ${
            disabled
              ? "cursor-not-allowed bg-gray-300"
              : "bg-[#0ea56b] active:scale-[0.98] hover:bg-[#0c8f5c]"
          }`}
        >
          {disabled ? "Lengkapi Semua Jadwal" : "Simpan Semua Jadwal"}
        </button>
      </div>
    </div>
  );
}
