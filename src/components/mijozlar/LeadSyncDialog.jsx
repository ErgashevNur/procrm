import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TriangleAlert,
  Copy,
  Check,
  RefreshCw,
  Download,
  Plus,
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
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}`, ...options.headers };
  if (
    !(options.body instanceof FormData) &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

async function extractMsg(res, fallback) {
  try {
    const text = await res.text();
    if (!text) return fallback;
    const p = JSON.parse(text);
    if (typeof p?.message === "string") return p.message;
    if (Array.isArray(p?.message)) return String(p.message[0]);
    return fallback;
  } catch {
    return fallback;
  }
}

async function parseResponseData(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function getSetupResult(res) {
  const data = await parseResponseData(res);
  if (typeof data === "string") {
    return { ok: true, code: data };
  }
  const code =
    data?.script ??
    data?.code ??
    data?.scriptCode ??
    data?.data?.script ??
    data?.data?.code ??
    "";

  return {
    ok: Boolean(code),
    code: code ? String(code) : "",
    data,
  };
}

const TABS = [
  { id: "configs", label: "Configlar" },
  { id: "new", label: "+ Yangi" },
  { id: "import", label: "Import" },
];

export default function LeadSyncDialog({
  open,
  onOpenChange,
  projectId,
  onImportDone,
}) {
  const normalizedProjectId = Number(projectId);
  const hasProjectId = Number.isFinite(normalizedProjectId) && normalizedProjectId > 0;
  const [tab, setTab] = useState("configs");
  const [configs, setConfigs] = useState([]);
  const [configsLoading, setConfigsLoading] = useState(false);

  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [creating, setCreating] = useState(false);

  const [scriptCode, setScriptCode] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptConfigId, setScriptConfigId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [importConfigId, setImportConfigId] = useState("");
  const [importRange, setImportRange] = useState("A2:D100");
  const [importing, setImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showFlash = (type, text) => {
    if (type === "ok") {
      toast.success(text);
      return;
    }
    toast.error(text);
  };

  const loadConfigs = async () => {
    if (!hasProjectId) {
      showFlash("err", "Avval loyiha tanlang");
      return;
    }
    setConfigsLoading(true);
    try {
      const res = await apiFetch(apiUrl(`lead-sync/config/${normalizedProjectId}`));
      if (!res || !res.ok) {
        showFlash("err", "Configlar yuklanmadi");
        return;
      }
      const data = await parseResponseData(res);
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      const list = rawList.map((item) => ({
        ...item,
        sheetUrl:
          item?.sheetUrl ??
          item?.sheet_url ??
          item?.url ??
          item?.googleSheetUrl ??
          item?.google_sheet_url ??
          "",
        sheetName:
          item?.sheetName ??
          item?.sheet_name ??
          item?.name ??
          "Sheet1",
      }));
      setConfigs(list);
    } catch {
      showFlash("err", "Configlar yuklanmadi");
    } finally {
      setConfigsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTab("configs");
      setScriptCode("");
      setScriptConfigId(null);
      loadConfigs();
    }
  }, [open, projectId]);

  const requestSetupScript = async (configId) => {
    const numericConfigId = Number(configId);
    const cfg = configs.find((item) => Number(item?.id) === numericConfigId);
    const payloads = [
      cfg?.sheetUrl
        ? {
            sheetUrl: String(cfg.sheetUrl),
            sheetName: cfg.sheetName || "Sheet1",
            projectId: normalizedProjectId,
          }
        : null,
      cfg?.sheetUrl
        ? {
            sheetUrl: String(cfg.sheetUrl),
            sheetName: cfg.sheetName || "Sheet1",
          }
        : null,
      { configId: numericConfigId, projectId: normalizedProjectId },
      { id: numericConfigId, projectId: normalizedProjectId },
      { configId: numericConfigId },
      { id: numericConfigId },
      cfg?.sheetUrl
        ? {
            configId: numericConfigId,
            projectId: normalizedProjectId,
            sheetUrl: String(cfg.sheetUrl),
            sheetName: cfg.sheetName || "Sheet1",
          }
        : null,
    ].filter(Boolean);

    let lastError = "Script olishda xatolik";

    for (const payload of payloads) {
      const res = await apiFetch(apiUrl("lead-sync/setup"), {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res) {
        return { ok: false, error: "So'rov bajarilmadi" };
      }

      if (!res.ok) {
        lastError = await extractMsg(res, lastError);
        continue;
      }

      const result = await getSetupResult(res);
      if (result.ok) return result;
      lastError = "Script topilmadi";
    }

    return { ok: false, error: lastError };
  };

  const fetchScript = async (configId, sheetUrl, sheetName) => {
    if (!configId || !hasProjectId) {
      showFlash("err", "Avval loyiha tanlang");
      return;
    }
    setScriptLoading(true);
    setScriptCode("");
    setScriptConfigId(Number(configId));
    if (!sheetUrl || !sheetUrl.startsWith("http")) {
      const found = configs.find((c) => Number(c.id) === Number(configId));
      sheetUrl = found?.sheetUrl ?? found?.sheet_url ?? "";
    }
    if (!sheetUrl) {
      showFlash("err", "Sheet URL topilmadi. Configni qayta yarating.");
      setScriptLoading(false);
      return;
    }
    try {
      console.log("setup body:", {
        configId,
        projectId,
        sheetUrl,
        sheetName,
      });
      const res = await apiFetch(apiUrl("lead-sync/setup"), {
        method: "POST",
        body: JSON.stringify({
          configId: Number(configId),
          projectId: Number(projectId),
          sheetUrl: sheetUrl ?? "",
          sheetName: sheetName ?? "Sheet1",
        }),
      });
      if (!res || !res.ok) {
        showFlash("err", await extractMsg(res, "Script olishda xatolik"));
        return;
      }
      const data = await parseResponseData(res);
      if (typeof data === "string") {
        setScriptCode(data);
        return;
      }
      const code =
        data?.script ??
        data?.code ??
        data?.scriptCode ??
        data?.appsScriptCode ??
        data?.data?.script ??
        data?.data?.code ??
        data?.data?.appsScriptCode ??
        (data ? JSON.stringify(data, null, 2) : "");
      if (!code) {
        showFlash("err", "Script topilmadi");
        return;
      }
      setScriptCode(String(code));
    } catch {
      showFlash("err", "Script olishda xatolik");
    } finally {
      setScriptLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!hasProjectId) {
      showFlash("err", "Avval loyiha tanlang");
      return;
    }
    if (!sheetUrl.trim()) {
      showFlash("err", "Sheet URL kiriting");
      return;
    }
    setCreating(true);
    try {
      const res = await apiFetch(apiUrl("lead-sync/config"), {
        method: "POST",
        body: JSON.stringify({
          projectId: normalizedProjectId,
          sheetUrl: sheetUrl.trim(),
          sheetName: sheetName.trim() || "Sheet1",
        }),
      });
      if (!res || !res.ok) {
        showFlash("err", await extractMsg(res, "Config yaratishda xatolik"));
        return;
      }
      const created = await parseResponseData(res);
      const newId = created?.id ?? created?.data?.id;
      const newSheetUrl = created?.sheetUrl ?? created?.data?.sheetUrl ?? sheetUrl;
      const newSheetName =
        created?.sheetName ?? created?.data?.sheetName ?? sheetName;
      if (newId) fetchScript(newId, newSheetUrl, newSheetName);
      await loadConfigs();
      setSheetUrl("");
      setSheetName("Sheet1");
      setTab("configs");
      showFlash("ok", "Config yaratildi");
    } catch {
      showFlash("err", "Config yaratishda xatolik");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (cfg) => {
    const nextIsActive = !(cfg.active ?? cfg.isActive ?? false);
    try {
      const res = await apiFetch(apiUrl("lead-sync/config/toggle"), {
        method: "PATCH",
        body: JSON.stringify({
          id: cfg.id,
          isActive: nextIsActive,
          projectId: Number(projectId),
        }),
      });
      if (!res || !res.ok) {
        showFlash("err", "Holat o'zgartirilmadi");
        return;
      }
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === cfg.id
            ? { ...c, active: nextIsActive, isActive: nextIsActive }
            : c,
        ),
      );
      showFlash("ok", "Holat yangilandi");
    } catch {
      showFlash("err", "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (cfg) => {
    setDeleting(true);
    try {
      const res = await apiFetch(
        apiUrl(`lead-sync/config/${cfg.id}/${normalizedProjectId}`),
        { method: "DELETE" },
      );
      if (!res || !res.ok) {
        showFlash("err", "O'chirishda xatolik");
        return;
      }
      setConfigs((prev) => prev.filter((c) => c.id !== cfg.id));
      if (scriptConfigId === cfg.id) {
        setScriptCode("");
        setScriptConfigId(null);
      }
      setDeleteTarget(null);
      showFlash("ok", "Config o'chirildi");
    } catch {
      showFlash("err", "O'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async () => {
    if (!hasProjectId) {
      showFlash("err", "Avval loyiha tanlang");
      return;
    }
    if (!importConfigId) {
      showFlash("err", "Config tanlang");
      return;
    }
    const sheetConfigId = Number(importConfigId);
    if (!Number.isFinite(sheetConfigId) || sheetConfigId <= 0) {
      showFlash("err", "Config ID noto'g'ri. Qaytadan tanlang.");
      return;
    }
    setImporting(true);
    try {
      const payload = {
        sheetConfigId,
        projectId: normalizedProjectId,
        range: importRange.trim() || "A2:D100",
      };
      console.log("lead-sync/import body:", payload);
      const res = await apiFetch(apiUrl("lead-sync/import"), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res || !res.ok) {
        showFlash("err", await extractMsg(res, "Import xatosi"));
        return;
      }
      const data = await parseResponseData(res);
      const count = Number(
        data?.count ??
          data?.importedCount ??
          data?.total ??
          data?.data?.count ??
          0,
      );
      showFlash(
        "ok",
        count > 0 ? `${count} ta lead import qilindi!` : "Import muvaffaqiyatli!",
      );
      if (onImportDone) {
        onImportDone({
          id: normalizedProjectId,
          name: localStorage.getItem("projectName") || "",
        });
      }
    } catch {
      showFlash("err", "Import xatosi");
    } finally {
      setImporting(false);
    }
  };

  const handleCopy = () => {
    if (!scriptCode) return;
    navigator.clipboard.writeText(scriptCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-2xl border border-[#21435b] bg-[#0b1c2d] p-0 text-white">
        <DialogHeader className="border-b border-[#2a4868] bg-[#10273c] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a4868] bg-[#11263a]">
              <FileSpreadsheet size={18} className="text-cyan-300" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">
                Google Sheets
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                Config yaratish, script olish va leadlarni import qilish
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex border-b border-[#21435b] bg-[#10273c]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm transition-colors ${
                tab === t.id
                  ? "border-b-2 border-cyan-400 bg-cyan-400/5 text-cyan-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-5">
          {tab === "configs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Joriy configlar</p>
                <button
                  onClick={loadConfigs}
                  className="flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-white"
                >
                  <RefreshCw
                    size={11}
                    className={configsLoading ? "animate-spin" : ""}
                  />
                  Yangilash
                </button>
              </div>

              {configsLoading && (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </div>
              )}

              {!configsLoading && configs.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#2a4868] py-10 text-center">
                  <FileSpreadsheet
                    size={28}
                    className="mx-auto mb-3 text-gray-700"
                  />
                  <p className="text-sm text-gray-500">Config topilmadi</p>
                  <button
                    onClick={() => setTab("new")}
                    className="mt-2 text-xs text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                  >
                    Yangi config yaratish
                  </button>
                </div>
              )}

              {configs.map((cfg) => {
                const isActive = cfg.active ?? cfg.isActive ?? false;
                return (
                  <div
                    key={cfg.id}
                    className="space-y-3 rounded-xl border border-[#21435b] bg-[#0f2437] p-4"
                  >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {cfg.sheetName || "Sheet"}
                      </p>
                      <p className="mt-0.5 max-w-xs truncate text-[11px] text-gray-500">
                        {cfg.sheetUrl || cfg.sheetId || "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => handleToggle(cfg)}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                          isActive
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                            : "border-gray-600/30 bg-gray-700/20 text-gray-400"
                        }`}
                      >
                        {isActive ? (
                          <ToggleRight size={13} />
                        ) : (
                          <ToggleLeft size={13} />
                        )}
                        {isActive ? "Yopiq" : "O'chiq"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cfg)}
                        className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      fetchScript(cfg.id, cfg.sheetUrl, cfg.sheetName)
                    }
                    disabled={scriptLoading && scriptConfigId === cfg.id}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a4868] bg-[#11263a] py-2 text-xs text-cyan-400 transition-colors hover:bg-[#1a3552] disabled:opacity-60"
                  >
                    {scriptLoading && scriptConfigId === cfg.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={12} />
                    )}
                    Apps Script kodi olish
                  </button>

                  {scriptCode && scriptConfigId === cfg.id && (
                    <div className="overflow-hidden rounded-lg border border-[#2a4868] bg-[#060f18]">
                      <div className="flex items-center justify-between border-b border-[#21435b] px-3 py-2">
                        <span className="font-mono text-[11px] text-gray-400">
                          Code.gs - Google Apps Script
                        </span>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {copied ? (
                            <>
                              <Check size={11} className="text-cyan-400" />{" "}
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Nusxa olish
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap p-3 font-mono text-[11px] leading-relaxed text-gray-300">
                        {scriptCode}
                      </pre>
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "new" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Google Sheet URL ni kiriting. Config saqlanganidan so&apos;ng
                Apps Script kodi avtomatik tayyorlanadi.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">
                  Google Sheet URL <span className="text-red-400">*</span>
                </label>
                <Input
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="border-[#2a4868] bg-[#11263a] text-sm text-white placeholder-gray-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Sheet nomi</label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="border-[#2a4868] bg-[#11263a] text-sm text-white placeholder-gray-600"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating || !sheetUrl.trim()}
                className="w-full border-0 bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Plus size={15} className="mr-2" /> Config yaratish
                  </>
                )}
              </Button>
            </div>
          )}

          {tab === "import" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Mavjud Google Sheetdan bir martalik lead import qilish.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">
                  Config tanlang <span className="text-red-400">*</span>
                </label>
                {configs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#2a4868] p-4 text-center text-xs text-gray-500">
                    Avval config yarating
                  </div>
                ) : (
                  <select
                    value={importConfigId}
                    onChange={(e) => setImportConfigId(e.target.value)}
                    className="w-full rounded-lg border border-[#2a4868] bg-[#11263a] px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="">- Config tanlang -</option>
                    {configs.map((cfg) => (
                      <option key={cfg.id} value={cfg.id}>
                        {cfg.sheetName || `Config #${cfg.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Diapazon (Range)</label>
                <Input
                  value={importRange}
                  onChange={(e) => setImportRange(e.target.value)}
                  placeholder="A2:D100"
                  className="border-[#2a4868] bg-[#11263a] text-sm text-white placeholder-gray-600"
                />
              </div>

              <Button
                onClick={handleImport}
                disabled={importing || !importConfigId}
                className="w-full border-0 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import
                    qilinmoqda...
                  </>
                ) : (
                  <>
                    <Download size={15} className="mr-2" /> Leadlarni import
                    qilish
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border border-[#21435b] bg-[#0b1c2d] p-0 text-white">
          <DialogHeader className="border-b border-[#2a4868] bg-[#10273c] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <TriangleAlert size={18} className="text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Configni o&apos;chirish
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-gray-400">
                  Bu amal qaytarilmaydi.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-[#21435b] bg-[#0f2437] p-4">
              <p className="text-xs text-gray-400">Tanlangan config</p>
              <p className="mt-1 text-sm font-medium text-white">
                {deleteTarget?.sheetName || "Config"}
              </p>
              <p className="mt-1 truncate text-[11px] text-gray-500">
                {deleteTarget?.sheetUrl || deleteTarget?.sheetId || "-"}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="border-[#2a4868] bg-[#11263a] text-gray-200 hover:bg-[#17344c] hover:text-white"
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                disabled={deleting || !deleteTarget}
                onClick={() => deleteTarget && handleDelete(deleteTarget)}
                className="border-0 bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    O&apos;chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    O&apos;chirish
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
