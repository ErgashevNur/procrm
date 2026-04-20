import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import i18n from "@/i18n/index.js";

export function getStatusMeta() {
  return {
    new: { label: i18n.t("statusMeta.new"), color: "#3b82f6", icon: Users },
    pending: { label: i18n.t("statusMeta.pending"), color: "#f59e0b", icon: Clock },
    success: { label: i18n.t("statusMeta.success"), color: "#22c55e", icon: CheckCircle2 },
    canceled: { label: i18n.t("statusMeta.canceled"), color: "#ef4444", icon: XCircle },
  };
}

export const STATUS_META = {
  new: { label: "Yangi", color: "#3b82f6", icon: Users },
  pending: { label: "Kutilmoqda", color: "#f59e0b", icon: Clock },
  success: { label: "Muvaffaqiyatli", color: "#22c55e", icon: CheckCircle2 },
  canceled: { label: "Bekor qilingan", color: "#ef4444", icon: XCircle },
};
