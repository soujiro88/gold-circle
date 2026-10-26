import { NextRequest, NextResponse } from "next/server";

type RecaptchaResponse = {
  action?: string;
  score?: number;
  success: boolean;
};

const loginAction = "login";
const defaultMinimumScore = 0.5;

function getMinimumScore() {
  const configuredScore = Number.parseFloat(process.env.RECAPTCHA_MINIMUM_SCORE ?? "");

  if (!Number.isFinite(configuredScore)) {
    return defaultMinimumScore;
  }

  return Math.min(1, Math.max(0, configuredScore));
}

export async function POST(request: NextRequest) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    return NextResponse.json({ error: "configuration", success: false }, { status: 500 });
  }

  let token: unknown;

  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        body: new URLSearchParams({ response: token, secret }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        cache: "no-store",
      },
    );

    if (!verificationResponse.ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    const verification = (await verificationResponse.json()) as RecaptchaResponse;

    const isValid =
      verification.success &&
      verification.action === loginAction &&
      typeof verification.score === "number" &&
      verification.score >= getMinimumScore();

    return NextResponse.json({ success: isValid }, { status: isValid ? 200 : 400 });
  } catch {
    return NextResponse.json({ success: false }, { status: 502 });
  }
}
