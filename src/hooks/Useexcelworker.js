// ─── useExcelWorker.js ────────────────────────────────────────────────────────
// Hook: import/export CSV <-> JSON via Web Worker
// Ishlatish:
//   const { importCSV, exportCSV, loading, error } = useExcelWorker();

import { useRef, useState, useCallback, useEffect } from "react";

export function useExcelWorker() {
  const workerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Worker ni bir marta yaratamiz
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../components/Excelworker.js", import.meta.url),
      { type: "module" },
    );
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // ── IMPORT: foydalanuvchi CSV fayl tanlaydi → leads[] qaytaradi ──────────
  const importCSV = useCallback(() => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,text/csv";

      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return reject(new Error("Fayl tanlanmadi"));

        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (ev) => {
          const csvText = ev.target.result;

          // Worker ga yuboramiz
          workerRef.current.onmessage = (msg) => {
            setLoading(false);
            if (msg.data.type === "IMPORT_DONE") {
              resolve(msg.data.leads);
            } else {
              const err = msg.data.message || "Import xatosi";
              setError(err);
              reject(new Error(err));
            }
          };

          workerRef.current.onerror = (err) => {
            setLoading(false);
            setError(err.message);
            reject(err);
          };

          workerRef.current.postMessage({
            type: "IMPORT",
            payload: { csvText },
          });
        };

        reader.onerror = () => {
          setLoading(false);
          reject(new Error("Fayl o'qishda xato"));
        };

        reader.readAsText(file, "UTF-8");
      };

      input.click();
    });
  }, []);

  const pickImportFile = useCallback(() => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          reject(new Error("Fayl tanlanmadi"));
          return;
        }
        resolve(file);
      };

      input.click();
    });
  }, []);

  // ── EXPORT: statuses[] → CSV fayl yuklab oladi ───────────────────────────
  const exportCSV = useCallback((statuses, filename = "leads.csv") => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      workerRef.current.onmessage = (msg) => {
        setLoading(false);
        if (msg.data.type === "EXPORT_DONE") {
          // BOM — Excel UTF-8 ni to'g'ri o'qishi uchun
          const bom = "\uFEFF";
          const blob = new Blob([bom + msg.data.csvText], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        } else {
          const err = msg.data.message || "Export xatosi";
          setError(err);
          reject(new Error(err));
        }
      };

      workerRef.current.onerror = (err) => {
        setLoading(false);
        setError(err.message);
        reject(err);
      };

      workerRef.current.postMessage({ type: "EXPORT", payload: { statuses } });
    });
  }, []);

  return { importCSV, pickImportFile, exportCSV, loading, error };
}
