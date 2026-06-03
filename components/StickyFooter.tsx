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
    <div className="glass-footer fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-center text-[12px] tracking-[-0.06px] text-[#8e8e93]">
          {hint}
        </p>
        <button
          onClick={onSave}
          disabled={disabled}
          className={`btn-ios w-full transition-all ${
            disabled
              ? "cursor-not-allowed bg-[rgba(118,118,128,0.12)] text-[#aeaeb2]"
              : "btn-ios-primary"
          }`}
        >
          {disabled ? "Lengkapi Semua Jadwal" : "Simpan Semua Jadwal"}
        </button>
      </div>
    </div>
  );
}
