export type FieldType = "text" | "textarea" | "select" | "checkbox";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface FormTemplate {
  id?: number;
  projectId: number;
  title: string;
  fields: Field[];
}
