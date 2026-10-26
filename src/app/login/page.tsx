import type { Metadata } from "next";
import LoginForm from "../../components/LoginForm";

export const metadata: Metadata = {
  title: "Login | Circle",
  description: "Sign in to your Circle account.",
};

export default function LoginPage() {
  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="main-heading">
        <h1 id="login-title">Welcome back</h1>
        <p className="subtitle">Sign in to continue your journey with Circle.</p>
      </div>
      <LoginForm />
    </section>
  );
}
