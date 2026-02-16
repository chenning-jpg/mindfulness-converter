import React, { useState } from "react";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: Error | null }>;
}

export default function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const fn = mode === "signin" ? onSignIn : onSignUp;
      const { error } = await fn(email, password);
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (mode === "signup") {
        setMessage({ type: "success", text: "注册成功，请查收邮件确认（若已开启邮件确认）。" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F6] p-6">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl border border-stone-100 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#D1FAE5] text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Leaf size={36} />
          </div>
          <h1 className="text-2xl font-black text-[#111827]">心境转化</h1>
          <p className="text-stone-500 text-sm mt-1">登录或注册以同步你的森林</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-sm ${
                message.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#111827] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 size={22} className="animate-spin" /> : null}
            {mode === "signin" ? "登录" : "注册"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
          className="w-full mt-6 py-3 text-stone-500 text-sm font-bold hover:text-[#111827] transition-colors"
        >
          {mode === "signin" ? "没有账号？去注册" : "已有账号？去登录"}
        </button>
      </div>
    </div>
  );
}
