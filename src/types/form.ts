export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "checkbox";

export interface Field {
  id: string;
  fieldId?: number;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormTemplate {
  id?: number;
  projectId: number;
  title: string;
  description?: string;
  telegramUrl?: string;
  fields: Field[];
}
