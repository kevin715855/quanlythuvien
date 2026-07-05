import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-context";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (auth.status === "authenticated") return <Navigate to={auth.user?.role === "reader" ? "/reader" : "/dashboard"} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!username.trim() || password.length < 8) {
      setError("Tên đăng nhập và mật khẩu từ 8 ký tự là bắt buộc");
      return;
    }
    setPending(true);
    try {
      const user = await auth.login(username, password);
      navigate(user.role === "reader" ? "/reader" : "/dashboard", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Đăng nhập thất bại");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">DGM Library</p>
        <h1 id="login-title">Đăng nhập thư viện</h1>
        <p className="muted">Dành cho độc giả, nhân viên và quản trị viên.</p>
        <form onSubmit={submit}>
          <label>Tên đăng nhập<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
          <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={pending}>{pending ? "Đang đăng nhập…" : "Đăng nhập"}</button>
          <a href="/search">Tra cứu mục lục không cần đăng nhập</a>
        </form>
      </section>
    </main>
  );
}
