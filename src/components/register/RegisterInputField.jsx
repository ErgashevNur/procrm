import RegisterFieldError from "@/components/register/RegisterFieldError";

export default function RegisterInputField({
  label,
  value,
  onChange,
  placeholder,
  style,
  error,
  type,
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={style}
      />
      <RegisterFieldError message={error} />
    </div>
  );
}
