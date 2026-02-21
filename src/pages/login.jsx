import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    toast.promise(
      fetch(`${import.meta.env.VITE_VITE_API_KEY_PROHOME}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.statusCode === 400) {
            console.log("login qilin");
            setLoading(false);
          } else if (data.accessToken) {
            localStorage.setItem("user", data.accessToken);
            localStorage.setItem("companyId", data.user.companyId);

            const userData = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
            };

            localStorage.setItem("userData", JSON.stringify(userData));
          }
          console.log(data);
          navigate("/");
          return data;
        })
        .finally(() => {
          setLoading(false);
        }),
      {
        loading: "Ma`lumotlar yuborilmoqda...",
        success: "Xush kelibsiz!",
        error: "Kirishda xatolik",
      },
    );
  };

  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden items-center justify-center p-8 md:flex md:w-1/2">
        <img
          src="/login_img.svg"
          alt="ProCRM Illustration"
          className="max-h-[80vh] max-w-full object-contain"
        />
      </div>

      <div className="mx-auto flex h-screen items-center justify-center">
        <div className="flex w-96 flex-col gap-6 rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-center text-2xl font-bold text-[#2c3e50]">
            PRO HOME
          </h1>
          <p className="text-center text-[#7f8c8d]">
            Welcome back! Please login.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-[#bdc3c7] p-3 placeholder-[#95a5a6] focus:ring-2 focus:ring-[#3498db] focus:outline-none"
            />

            <input
              type={isChecked ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-[#bdc3c7] p-3 placeholder-[#95a5a6] focus:ring-2 focus:ring-[#3498db] focus:outline-none"
            />

            <div className="flex items-center justify-between text-sm text-[#7f8c8d]">
              <label className="flex items-center gap-2">
                <input
                  checked={isChecked}
                  onChange={handleChange}
                  type="checkbox"
                />
                Show password
              </label>
              <span className="hover:text-[#3498db]">Forgot password?</span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`rounded py-3 font-semibold text-white ${
                loading ? "cursor-not-allowed bg-[#95a5a6]" : ""
              }`}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
