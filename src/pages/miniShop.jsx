import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiUrl, imageUrl } from "@/lib/api";
import { toast } from "@/lib/toast";

const C = {
  pageBg: "#111827",
  cardBg: "#1E2D42",
  cardBorder: "#243449",
  blue: "#4D8EF5",
  text: "#FFFFFF",
  textMuted: "#8A9BB5",
  textDim: "#4A6080",
  border: "#243449",
  green: "#27AE60",
  red: "#E74C3C",
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}`, ...options.headers };
  return fetch(url, { ...options, headers });
}

async function readJson(res, fallback = null) {
  if (!res) return fallback;
  try {
    const text = await res.text();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function pickArray(payload) {
  const cands = [
    payload,
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.items,
    payload?.data?.results,
  ];
  for (const c of cands) if (Array.isArray(c)) return c;
  return [];
}

function validateFiles(files) {
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" noto'g'ri format. Faqat JPG, JPEG, PNG qabul qilinadi.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" hajmi 5MB dan oshib ketdi.`;
    }
  }
  return null;
}

function formatPrice(price) {
  if (price == null || price === "") return "";
  if (Number(price) === 0) return "Bepul";
  return Number(price).toLocaleString("uz-UZ") + " so'm";
}

// ─── Product Form Modal ──────────────────────────────────────────────────────

function ProductFormModal({ open, onClose, onSaved, initialData, companyId }) {
  const isEdit = !!initialData;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [keepImages, setKeepImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialData) {
      setName(initialData.name || "");
      setDesc(initialData.desc || "");
      setPrice(initialData.price != null ? String(initialData.price) : "");
      setKeepImages(
        Array.isArray(initialData.img) ? [...initialData.img] : [],
      );
    } else {
      setName("");
      setDesc("");
      setPrice("");
      setKeepImages([]);
    }
    setNewFiles([]);
    setNewPreviews([]);
  }, [open, isEdit, initialData]);

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - keepImages.length - newFiles.length;

    if (remaining <= 0) {
      toast.error(`Rasm limiti to'ldi (maksimal ${MAX_IMAGES} ta)`);
      e.target.value = "";
      return;
    }

    const toAdd = picked.slice(0, remaining);
    const skipped = picked.length - toAdd.length;

    const err = validateFiles(toAdd);
    if (err) {
      toast.error(err);
      e.target.value = "";
      return;
    }

    if (skipped > 0) {
      toast.warning(`${skipped} ta rasm qo'shilmadi — limit: ${MAX_IMAGES} ta`);
    }

    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeNewFile = (idx) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeKeepImage = (img) => {
    setKeepImages((prev) => prev.filter((i) => i !== img));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Mahsulot nomini kiriting");
      return;
    }
    if (price && (isNaN(Number(price)) || Number(price) < 0)) {
      toast.error("To'g'ri narx kiriting");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("desc", desc.trim());
      fd.append("price", String(Number(price)));
      if (!isEdit) {
        fd.append("companyId", String(companyId));
      }
      if (isEdit) {
        keepImages.forEach((img) => fd.append("keepImages", img));
      }
      newFiles.forEach((f) => fd.append("images", f));

      const url = isEdit
        ? apiUrl(`product/${initialData.id}`)
        : apiUrl("product");
      const method = isEdit ? "PATCH" : "POST";

      const res = await apiFetch(url, { method, body: fd });
      if (!res) return;
      if (!res.ok) {
        const payload = await readJson(res, null);
        const msg =
          (Array.isArray(payload?.message)
            ? payload.message[0]
            : payload?.message) || "Xato yuz berdi";
        toast.error(String(msg));
        return;
      }
      toast.success(isEdit ? "Mahsulot yangilandi" : "Mahsulot qo'shildi!");
      onSaved?.();
      onClose?.();
    } catch {
      toast.error("Server bilan bog'lanishda xato");
    } finally {
      setSaving(false);
    }
  };

  const totalImages = keepImages.length + newFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-[#243449] bg-[#111827] p-0 text-white sm:max-w-xl">
        <DialogHeader className="border-b border-[#243449] bg-[#162030] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a4060] bg-[#1a2e40]">
              <ShoppingBag size={20} color={C.blue} strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[#8A9BB5]">
                {isEdit
                  ? "Ma'lumotlarni yangilang va saqlang"
                  : "Mahsulot ma'lumotlarini to'ldiring"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A9BB5]">
              Mahsulot nomi <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Qo'shimcha eshik"
              className="border-[#243449] bg-[#0d1822] text-sm text-white placeholder-[#4A6080] focus-visible:border-[#4D8EF5] focus-visible:ring-[#4D8EF5]/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A9BB5]">Tavsif</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mahsulot haqida batafsil ma'lumot..."
              rows={3}
              className="w-full resize-none rounded-md border border-[#243449] bg-[#0d1822] px-3 py-2 text-sm text-white placeholder-[#4A6080] outline-none focus:border-[#4D8EF5] focus:ring-1 focus:ring-[#4D8EF5]/20"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A9BB5]">
              Narx (so'm)
            </label>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Masalan: 150000"
              className="border-[#243449] bg-[#0d1822] text-sm text-white placeholder-[#4A6080] focus-visible:border-[#4D8EF5] focus-visible:ring-[#4D8EF5]/20"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#8A9BB5]">
                Rasmlar ({totalImages}/{MAX_IMAGES})
              </label>
              <span className="text-[10px] text-[#4A6080]">
                JPG, JPEG, PNG · max 5MB
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Existing images (edit mode) */}
              {keepImages.map((img) => (
                <div
                  key={img}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#243449]"
                >
                  <img
                    src={imageUrl(img)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeepImage(img)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E74C3C]/90 text-white hover:bg-[#E74C3C]"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {/* New file previews */}
              {newPreviews.map((src, idx) => (
                <div
                  key={src}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#4D8EF5]/40"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E74C3C]/90 text-white hover:bg-[#E74C3C]"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#243449] text-[#4A6080] transition-colors hover:border-[#4D8EF5] hover:text-[#4D8EF5]"
                >
                  <ImagePlus size={20} />
                  <span className="text-[10px]">Qo'shish</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#243449] bg-[#0d1320] px-5 py-3">
          <Button
            variant="ghost"
            className="text-[#8A9BB5] hover:bg-white/5 hover:text-white"
            onClick={onClose}
            disabled={saving}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#4D8EF5] text-white hover:bg-[#3a7de0] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saqlanmoqda...
              </>
            ) : isEdit ? (
              "Yangilash"
            ) : (
              "Qo'shish"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

function DeleteConfirmDialog({ open, onClose, onConfirm, productName }) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm?.();
    setDeleting(false);
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-sm rounded-2xl border border-[#243449] bg-[#111827] p-0 text-white">
        <DialogHeader className="border-b border-[#243449] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a1a1a] bg-[#2a0d0d]">
              <Trash2 size={18} color={C.red} strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-white">
                Mahsulotni o'chirish
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[#8A9BB5]">
                Bu amalni ortga qaytarib bo'lmaydi
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-5 py-4">
          <p className="text-sm text-[#8A9BB5]">
            <span className="font-medium text-white">"{productName}"</span>{" "}
            mahsulotini o'chirmoqchimisiz?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#243449] px-5 py-3">
          <Button
            variant="ghost"
            className="text-[#8A9BB5] hover:bg-white/5 hover:text-white"
            onClick={onClose}
            disabled={deleting}
          >
            Bekor
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-[#E74C3C] text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : null}
            O'chirish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }) {
  const firstImage = product.img?.[0];
  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {firstImage ? (
        <img
          src={imageUrl(firstImage)}
          alt={product.name}
          style={{ width: "100%", height: 160, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 160,
            background: "#0d1822",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingBag size={36} color={C.textDim} strokeWidth={1.5} />
        </div>
      )}
      <div
        style={{
          padding: "12px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: C.text,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </div>
        {product.desc && (
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.desc}
          </div>
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: C.blue,
            marginTop: "auto",
            paddingTop: 4,
          }}
        >
          {formatPrice(product.price)}
        </div>
        {product.img?.length > 1 && (
          <div style={{ fontSize: 10, color: C.textDim }}>
            {product.img.length} ta rasm
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          borderTop: `1px solid ${C.border}`,
          padding: "8px 12px",
          gap: 8,
        }}
      >
        <button
          onClick={() => onEdit(product)}
          style={{
            flex: 1,
            background: "transparent",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 7,
            padding: "6px 0",
            color: C.textMuted,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.color = C.blue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.cardBorder;
            e.currentTarget.style.color = C.textMuted;
          }}
        >
          <Pencil size={11} /> Tahrirlash
        </button>
        <button
          onClick={() => onDelete(product)}
          style={{
            width: 34,
            background: "transparent",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 7,
            color: C.textDim,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.red;
            e.currentTarget.style.color = C.red;
            e.currentTarget.style.background = "rgba(231,76,60,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.cardBorder;
            e.currentTarget.style.color = C.textDim;
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MiniShop() {
  const companyId = localStorage.getItem("companyId") || "";
  const shopLink = companyId
    ? `${window.location.origin}/shop/${companyId}`
    : null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromPrice, setFromPrice] = useState("");
  const [toPrice, setToPrice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: search || "",
        fromPrice: fromPrice || "0",
        toPrice: toPrice || "999999999",
        companyId: String(companyId),
      });
      const res = await apiFetch(apiUrl(`product/all?${params}`));
      if (!res || !res.ok) return;
      const payload = await readJson(res, null);
      setProducts(pickArray(payload));
    } catch {
      toast.error("Mahsulotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  }, [companyId, search, fromPrice, toPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(apiUrl(`api/v1/product/${deleteTarget.id}`), {
        method: "DELETE",
      });
      if (!res || !res.ok) {
        toast.error("O'chirishda xato yuz berdi");
        return;
      }
      toast.success("Mahsulot o'chirildi");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error("Server bilan bog'lanishda xato");
    }
  };

  const handleCopyLink = () => {
    if (!shopLink) return;
    navigator.clipboard.writeText(shopLink).then(() => {
      toast.success("Havola nusxalandi!");
    });
  };

  const openAdd = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        background: C.pageBg,
        color: C.text,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#162030",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <ShoppingBag size={18} color={C.blue} strokeWidth={2} />
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>
          Mening <span style={{ color: C.blue }}>Mini-Shopim</span>
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={openAdd}
          style={{
            background: C.blue,
            border: "none",
            borderRadius: 8,
            padding: "7px 16px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3a7de0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.blue)}
        >
          <Plus size={14} strokeWidth={2.5} />
          Mahsulot qo'shish
        </button>
      </div>

      {/* Shop link banner */}
      {shopLink && (
        <div
          style={{
            background: "linear-gradient(135deg, #0d1e35 0%, #0d2040 100%)",
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Sizning do'kon havolangiz
            </div>
            <div
              style={{
                fontSize: 13,
                color: C.blue,
                fontWeight: 600,
                wordBreak: "break-all",
              }}
            >
              {shopLink}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: "rgba(77,142,245,0.12)",
                border: `1px solid rgba(77,142,245,0.3)`,
                borderRadius: 8,
                padding: "7px 14px",
                color: C.blue,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(77,142,245,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(77,142,245,0.12)")
              }
            >
              <Copy size={13} />
              Nusxalash
            </button>
            <a
              href={shopLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "7px 14px",
                color: C.textMuted,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
            >
              <ExternalLink size={13} />
              Ko'rish
            </a>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: "#0f1a27",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot nomi bo'yicha qidirish..."
          style={{
            flex: "1 1 200px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "7px 12px",
            color: C.text,
            fontSize: 13,
            outline: "none",
          }}
        />
        <input
          type="number"
          value={fromPrice}
          onChange={(e) => setFromPrice(e.target.value)}
          placeholder="Min narx"
          style={{
            width: 130,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "7px 12px",
            color: C.text,
            fontSize: 13,
            outline: "none",
          }}
        />
        <input
          type="number"
          value={toPrice}
          onChange={(e) => setToPrice(e.target.value)}
          placeholder="Max narx"
          style={{
            width: 130,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "7px 12px",
            color: C.text,
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24 }}>
        {!companyId ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: C.textMuted,
            }}
          >
            <ShoppingBag
              size={48}
              color={C.textDim}
              strokeWidth={1.5}
              style={{ margin: "0 auto 16px" }}
            />
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Kompaniya topilmadi
            </p>
            <p style={{ fontSize: 13 }}>
              Mini-shopdan foydalanish uchun kompaniyaga biriktirilgan
              bo'lishingiz shart.
            </p>
          </div>
        ) : loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: C.textMuted,
              gap: 8,
            }}
          >
            <Loader2
              size={20}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Yuklanmoqda...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: C.textMuted,
            }}
          >
            <ShoppingBag
              size={48}
              color={C.textDim}
              strokeWidth={1.5}
              style={{ margin: "0 auto 16px" }}
            />
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Mahsulotlar yo'q
            </p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              Birinchi mahsulotingizni qo'shing!
            </p>
            <button
              onClick={openAdd}
              style={{
                background: C.blue,
                border: "none",
                borderRadius: 8,
                padding: "9px 20px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={15} /> Mahsulot qo'shish
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
        initialData={editProduct}
        companyId={companyId}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        productName={deleteTarget?.name || ""}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
