"use client";

import Script from "next/script";
import { type FormEvent, useEffect, useState } from "react";

type Grecaptcha = {
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  ready: (callback: () => void) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const recaptchaAction = "login";
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const recaptchaScriptUrl = recaptchaSiteKey
  ? `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`
  : "";

export default function LoginForm() {
  const [captchaError, setCaptchaError] = useState("");
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const grecaptcha = window.grecaptcha;

    if (grecaptcha) {
      grecaptcha.ready(() => setIsRecaptchaReady(true));
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!recaptchaSiteKey) {
      setCaptchaError("Google reCAPTCHA has not been configured for this site yet.");
      return;
    }

    const grecaptcha = window.grecaptcha;

    if (!isRecaptchaReady || !grecaptcha) {
      setCaptchaError("Google reCAPTCHA is still loading. Please try again in a moment.");
      return;
    }

    setCaptchaError("");
    setIsVerifying(true);

    try {
      const token = await new Promise<string>((resolve, reject) => {
        grecaptcha.ready(() => {
          grecaptcha.execute(recaptchaSiteKey, { action: recaptchaAction }).then(resolve, reject);
        });
      });
      const response = await fetch("/api/recaptcha", {
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
        success?: boolean;
      } | null;

      if (!response.ok || !result?.success) {
        setCaptchaError(
          result?.error === "configuration"
            ? "Google reCAPTCHA has not been configured on the server yet."
            : "Google reCAPTCHA could not verify this sign-in attempt. Please try again.",
        );
        return;
      }

      setMessage("Sign-in is not configured yet. Connect an authentication provider to enable it.");
    } catch {
      setCaptchaError("Google reCAPTCHA could not be verified. Please check your connection and try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          id="password"
          name="password"
          placeholder="Enter your password"
          required
          type="password"
        />
      </div>

      <div className="recaptcha-field">
        {recaptchaSiteKey ? (
          <>
            <Script
              onError={() =>
                setCaptchaError("Google reCAPTCHA could not be loaded. Please refresh the page and try again.")
              }
              onLoad={() => {
                const grecaptcha = window.grecaptcha;

                if (grecaptcha) {
                  grecaptcha.ready(() => setIsRecaptchaReady(true));
                }
              }}
              src={recaptchaScriptUrl}
              strategy="afterInteractive"
            />
            <p aria-live="polite" className="recaptcha-notice">
              {isRecaptchaReady
                ? "This sign-in is protected by Google reCAPTCHA."
                : "Preparing Google reCAPTCHA..."}
            </p>
          </>
        ) : (
          <p className="recaptcha-configuration" role="alert">
            Google reCAPTCHA needs to be configured before users can sign in.
          </p>
        )}

        {captchaError && (
          <p className="recaptcha-error" role="alert">
            {captchaError}
          </p>
        )}
      </div>

      <label className="remember-me">
        <input name="remember" type="checkbox" />
        Remember me
      </label>

      <button className="login-submit" disabled={isVerifying} type="submit">
        {isVerifying ? "Verifying..." : "Sign in"}
      </button>

      {message && (
        <p aria-live="polite" className="login-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
