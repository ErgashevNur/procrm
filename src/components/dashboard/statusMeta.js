import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";

export const STATUS_META = {
  new: { label: "Yangi", color: "#3b82f6", icon: Users },
  pending: { label: "Kutilmoqda", color: "#f59e0b", icon: Clock },
  success: { label: "Muvaffaqiyatli", color: "#22c55e", icon: CheckCircle2 },
  canceled: { label: "Bekor qilingan", color: "#ef4444", icon: XCircle },
};
