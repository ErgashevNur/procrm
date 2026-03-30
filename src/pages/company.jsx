import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Upload,
    Loader2,
    Building2,
    Hash,
    Check,
    AlertTriangle,
    Phone,
    Briefcase,
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const BASE = "https://backend.prohome.uz/api/v1";
const ALL_PERMISSIONS = ["CRM", "PROHOME"];
const PER_PAGE = 12;

const getImgUrl = (raw) => {
    if (!raw) return null;
    const clean = raw.replace(/^image\//, "");
    return `${BASE}/image/${clean}`;
};

function initials(name = "") {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0] ?? "")
        .join("")
        .toUpperCase();
}

function cleanPhone(phone = "") {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("998")) return `+${digits}`;
    if (digits.length === 9) return `+998${digits}`;
    if (digits.startsWith("8")) return `+99${digits}`;
    return `+998${digits.slice(-9)}`;
}

async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("user");
    const res = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return null;
    }

    return res;
}

function ConfirmDialog({ company, onConfirm, onCancel, deleting }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6"
                style={{ background: "#0f2030" }}
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Kompaniyani o&apos;chirish
                        </p>
                        <p className="text-xs text-gray-500">Bu amalni qaytarib bo&apos;lmaydi</p>
                    </div>
                </div>

                <p className="mb-5 text-sm text-gray-400">
                    <span className="font-semibold text-white">&quot;{company.name}&quot;</span>{" "}
                    kompaniyasini o&apos;chirmoqchimisiz?
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 rounded-xl border border-white/[0.08] py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white disabled:opacity-50"
                    >
                        Bekor
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                        {deleting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            "O\u2019chirish"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImageDropZone({ file, preview, onChange }) {
    const inputRef = useRef();
    const [drag, setDrag] = useState(false);

    const handleFile = (f) => {
        if (!f || !f.type.startsWith("image/")) return;
        onChange(f);
    };

    return (
        <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                Logo
            </p>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
                style={{
                    borderColor: drag ? "#3b82f6" : preview ? "#3b82f640" : "rgba(255,255,255,0.08)",
                    background: drag ? "rgba(59,130,246,0.06)" : preview ? "rgba(59,130,246,0.03)" : "rgba(255,255,255,0.02)",
                }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="h-full w-full rounded-xl object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                            <p className="text-xs font-medium text-white">O&apos;zgartirish</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                            <Upload size={16} className="text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-600">Logo yuklang yoki shu yerga tashlang</p>
                        <p className="text-[10px] text-gray-700">PNG, JPG, WEBP</p>
                    </>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            {file && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-green-400">
                    <Check size={11} /> {file.name}
                </p>
            )}
        </div>
    );
}

function FormField({ label, required, icon: Icon, error, children }) {
    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                {Icon && <Icon size={11} className="text-gray-600" />}
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
        </div>
    );
}

function TInput({ value, onChange, placeholder, type = "text", ...rest }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            {...rest}
            className="w-full rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-gray-600"
            style={{ background: "#0a1929", borderColor: "rgba(255,255,255,0.07)" }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
        />
    );
}

function CompanyDrawer({ company, onClose, onSaved }) {
    const isEdit = !!company;

    const [form, setForm] = useState({
        name: company?.name ?? "",
        managerName: company?.managerName ?? "",
        phoneNumber: company?.phoneNumber ?? "",
        description: company?.description ?? "",
        permissions: Array.isArray(company?.permissions) ? company.permissions : [],
        logo: null,
    });

    const [preview, setPreview] = useState(company?.logo ? getImgUrl(company.logo) : null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const togglePermission = (perm) => {
        setForm((f) => ({
            ...f,
            permissions: f.permissions.includes(perm)
                ? f.permissions.filter((p) => p !== perm)
                : [...f.permissions, perm],
        }));
    };

    const handleImage = (file) => {
        setForm((f) => ({ ...f, logo: file }));
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const e = {};
        const normalizedPhone = cleanPhone(form.phoneNumber);
        if (!form.name.trim()) e.name = "Nom majburiy";
        if (!form.managerName.trim()) e.managerName = "Menejer ismi majburiy";
        if (!form.phoneNumber.trim()) {
            e.phoneNumber = "Telefon majburiy";
        } else if (!/^\+998\d{9}$/.test(normalizedPhone)) {
            e.phoneNumber = "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const body = {
                name: form.name.trim(),
                managerName: form.managerName.trim(),
                phoneNumber: cleanPhone(form.phoneNumber),
                description: form.description?.trim() || "",
                permissions: Array.isArray(form.permissions) ? form.permissions : [],
            };

            const url = isEdit ? `${BASE}/company/${company.id}` : `${BASE}/company`;
            const res = await apiFetch(url, {
                method: isEdit ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res) throw new Error("No response");
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(
                    Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Request failed"
                );
            }

            toast.success(isEdit ? "Kompaniya yangilandi " : "Kompaniya qo'shildi ");
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.message || "Xatolik yuz berdi ");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-40 flex justify-end"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div className="absolute inset-0" onClick={onClose} />
            <div
                className="relative flex h-full w-full max-w-md flex-col border-l border-white/6 shadow-2xl"
                style={{ background: "#071828", animation: "slideIn .25s ease" }}
            >
                <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {isEdit ? "Kompaniyani tahrirlash" : "Yangi kompaniya"}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-600">
                            {isEdit ? `#${company.id}` : "Ma'lumotlarni to'ldiring"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 transition-colors hover:text-white"
                    >
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                        <FormField label="Nomi" required icon={Building2} error={errors.name}>
                            <TInput value={form.name} onChange={set("name")} placeholder="Kompaniya nomi" />
                        </FormField>
                        <FormField label="Menejer ismi" required icon={Users} error={errors.managerName}>
                            <TInput value={form.managerName} onChange={set("managerName")} placeholder="To'liq ism sharif" />
                        </FormField>
                        <FormField label="Telefon raqam" required icon={Phone} error={errors.phoneNumber}>
                            <TInput value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+998 90 000 00 00" type="tel" />
                        </FormField>
                        <FormField label="Tavsif" icon={Briefcase} error={errors.description}>
                            <textarea
                                value={form.description}
                                onChange={(e) => set("description")(e.target.value)}
                                placeholder="Kompaniya haqida qisqacha..."
                                rows={3}
                                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-gray-600"
                                style={{ background: "#0a1929", borderColor: "rgba(255,255,255,0.07)" }}
                                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                            />
                        </FormField>
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Ruxsatlar</p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_PERMISSIONS.map((perm) => {
                                    const active = form.permissions.includes(perm);
                                    return (
                                        <button
                                            key={perm}
                                            type="button"
                                            onClick={() => togglePermission(perm)}
                                            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
                                            style={active
                                                ? { background: "rgba(37,99,235,0.15)", borderColor: "rgba(37,99,235,0.4)", color: "#93c5fd" }
                                                : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }
                                            }
                                        >
                                            <div
                                                className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
                                                style={active ? { borderColor: "#3b82f6", background: "#3b82f6" } : { borderColor: "#4b5563" }}
                                            >
                                                {active && <Check size={9} className="text-white" />}
                                            </div>
                                            {perm}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <ImageDropZone file={form.logo} preview={preview} onChange={handleImage} />
                    </div>

                    <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                        >
                            Bekor
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
                        >
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> {isEdit ? "Saqlash" : "Qo'shish"}</>}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

function CompanyCard({ company, onEdit, onDelete, index }) {
    const [imgErr, setImgErr] = useState(false);
    const logoUrl = company.logo ? getImgUrl(company.logo) : null;
    const showLogo = logoUrl && !imgErr;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-white/6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12"
            style={{
                background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
                animation: `fadeUp .4s ease ${index * 0.05}s both`,
            }}
        >
            <div className="relative h-36 w-full overflow-hidden bg-[#0a1929]">
                {showLogo ? (
                    <img
                        src={logoUrl}
                        alt={company.name}
                        onError={() => setImgErr(true)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-blue-300"
                            style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }}
                        >
                            {initials(company.name)}
                        </div>
                    </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,24,40,0.95) 0%, transparent 55%)" }} />
                <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(company)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-blue-400"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={() => onDelete(company)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-400"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
                <div className="absolute left-3 top-3">
                    <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#071828]/80 px-2 py-0.5 backdrop-blur-sm">
                        <Hash size={9} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-white">{company.id}</span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="mb-1 truncate text-sm font-semibold text-white">{company.name}</h3>
                {company.managerName && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                        <Users size={10} className="shrink-0 text-gray-600" />
                        <p className="truncate text-xs text-gray-600">{company.managerName}</p>
                    </div>
                )}
                {company.description && (
                    <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gray-700">{company.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                    {company.phoneNumber && (
                        <a
                            href={`tel:${company.phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 transition-colors hover:border-green-500/20 hover:bg-green-500/5"
                        >
                            <Phone size={9} className="text-green-400" />
                            <span className="text-[10px] text-gray-500">{company.phoneNumber}</span>
                        </a>
                    )}
                    {company.permissions?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {company.permissions.map((p) => (
                                <span
                                    key={p}
                                    className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                                    style={{ background: "rgba(37,99,235,0.12)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.2)" }}
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-[#0f2438]">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
                <Skeleton className="mt-3 h-6 w-32 rounded-lg" />
            </div>
        </div>
    );
}

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [drawer, setDrawer] = useState(null);
    const [delTarget, setDelTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCompanies = async (p = page) => {
        setLoading(true);
        try {
            const res = await apiFetch(`${BASE}/company/all?limit=${PER_PAGE}&page=${p}`);
            if (!res) return;
            const data = await res.json();

            if (Array.isArray(data)) {
                setCompanies(data);
                setTotal(data.length);
            } else {
                const list = data.data ?? data.companies ?? data.items ?? [];
                setCompanies(list);
                setTotal(data.total ?? data.count ?? list.length);
            }
        } catch (err) {
            console.error(err);
            toast.error("Kompaniyalar yuklanmadi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies(page);
    }, [page]);

    const handleDelete = async () => {
        if (!delTarget || deleting) return;

        setDeleting(true);

        try {
            const url = `${BASE}/company/delete/${delTarget.id}`;
            console.log("DELETE URL:", url);

            const res = await apiFetch(url, {
                method: "DELETE",
            });

            if (!res) throw new Error("No response");

            const data = await res.json().catch(() => null);
            console.log("STATUS:", res.status);
            console.log("RESPONSE:", data);

            if (!res.ok) {
                throw new Error(data?.message || "Delete failed");
            }

            toast.success("Kompaniya o'chirildi ");

            setCompanies((prev) => prev.filter((c) => c.id !== delTarget.id));
            setTotal((t) => t - 1);
        } catch (err) {
            console.error("DELETE ERROR:", err);
            toast.error(err.message || "O'chirishda xatolik ");
        } finally {
            setDeleting(false);
            setDelTarget(null);
        }
    };

    const filtered = companies.filter(
        (c) =>
            !search ||
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.managerName?.toLowerCase().includes(search.toLowerCase()) ||
            c.phoneNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(total / PER_PAGE);

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
        .reduce((acc, n, idx, arr) => {
            if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
            acc.push(n);
            return acc;
        }, []);

    return (
        <div className="min-h-screen bg-[#071828]" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />

            <div
                className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#071828]/90 px-6 py-4 backdrop-blur"
                style={{ animation: "fadeUp .3s ease both" }}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-white">Kompaniyalar</h1>
                        <p className="mt-0.5 text-xs text-gray-600">
                            {loading ? "Yuklanmoqda..." : `${total} ta kompaniya`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden sm:block">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Qidirish..."
                                className="w-48 rounded-xl border py-2 pl-8 pr-3 text-sm text-white outline-none transition-all placeholder:text-gray-600"
                                style={{ background: "#0a1929", borderColor: "rgba(255,255,255,0.07)" }}
                                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                            />
                        </div>
                        <button
                            onClick={() => setDrawer("add")}
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Yangi kompaniya</span>
                            <span className="sm:hidden">Yangi</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center" style={{ animation: "fadeUp .4s ease both" }}>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                            <Building2 size={28} className="text-gray-700" />
                        </div>
                        <p className="text-base font-semibold text-white">
                            {search ? "Hech narsa topilmadi" : "Hech qanday kompaniya yo'q"}
                        </p>
                        <p className="text-sm text-gray-600">
                            {search ? "Boshqa so'z bilan qidiring" : "Birinchi kompaniyangizni qo'shing"}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setDrawer("add")}
                                className="mt-2 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                                style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
                            >
                                <Plus size={15} /> Kompaniya qo'shish
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((c, i) => (
                                <CompanyCard
                                    key={c.id}
                                    company={c}
                                    index={i}
                                    onEdit={(comp) => setDrawer(comp)}
                                    onDelete={(comp) => setDelTarget(comp)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2" style={{ animation: "fadeUp .4s ease both" }}>
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {pageNumbers.map((n, i) =>
                                    n === "..." ? (
                                        <span key={`dots-${i}`} className="text-sm text-gray-600">…</span>
                                    ) : (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className="h-9 min-w-[36px] rounded-xl border px-3 text-sm font-medium transition-all"
                                            style={n === page
                                                ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderColor: "#2563eb", color: "#fff" }
                                                : { borderColor: "rgba(255,255,255,0.08)", color: "#9ca3af" }
                                            }
                                        >
                                            {n}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {drawer && (
                <CompanyDrawer
                    company={drawer === "add" ? null : drawer}
                    onClose={() => setDrawer(null)}
                    onSaved={() => fetchCompanies(page)}
                />
            )}

            {delTarget && (
                <ConfirmDialog
                    company={delTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDelTarget(null)}
                    deleting={deleting}
                />
            )}

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}