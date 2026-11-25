import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ShieldCheck, LockKeyhole, Eye, EyeOff, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import gallery from "@/assets/basalt-gallery.png";
import { adminSignIn, verifyAdminCode, adminStatus, adminSignOut } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";
export function AdminEntry() {
  const [bn, setBn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "verify" | "enroll">("login");
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signIn = useServerFn(adminSignIn);
  const verify = useServerFn(verifyAdminCode);
  const statusFn = useServerFn(adminStatus);
  const signOut = useServerFn(adminSignOut);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn(), retry: false });
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(e.currentTarget);
    try {
      if (step === "login") {
        const result = await signIn({
          data: {
            email: String(fields.get("email") ?? ""),
            password: String(fields.get("password") ?? ""),
          },
        });
        if (!result.ok) setError(result.error);
        else {
          setStep(result.step);
          setQr(result.qr);
        }
      } else {
        const result = await verify({ data: { code: String(fields.get("code") ?? "") } });
        if (!result.ok) setError(result.error);
        else {
          setQr("");
          await status.refetch();
        }
      }
    } catch {
      setError(
        t(
          "Sign-in could not be completed. Please try again.",
          "প্রবেশ করা যায়নি। আবার চেষ্টা করুন।",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-entry">
      <section className="entry-art" aria-label="Basalt gallery">
        <img
          src={gallery}
          alt="Five spotlight-lit rectangular niches carved into dark basalt stone"
        />
        <div className="entry-logo">
          <BrandLogo />
        </div>
        <div className="entry-quote">
          <span className="micro-label">THE PRIVATE ATELIER</span>
          <h2>
            Scented your
            <br />
            <em>mood.</em>
          </h2>
          <p>A world of fragrance. A feeling that stays.</p>
        </div>
      </section>
      <section className="entry-panel">
        <header className="entry-top">
          <div className="entry-mobile-logo">
            <BrandLogo />
          </div>
          <span>
            <LockKeyhole />
            {t("Private access", "ব্যক্তিগত প্রবেশ")}
          </span>
          <Button variant="ghost" size="sm" aria-label="Switch language" onClick={() => setBn(!bn)}>
            EN <span className="text-muted-foreground">/</span>
            <span className={bn ? "text-primary" : "text-muted-foreground"}>বাংলা</span>
          </Button>
        </header>
        <div className="entry-form">
          <span className="micro-label">SCENTOLOGY BD · ATELIER</span>
          {status.data?.signedIn ? (
            <>
              <h1>{t("Welcome to your atelier.", "আপনার আতেলিয়েতে স্বাগতম।")}</h1>
              <p className="entry-intro">
                {status.data.email}
                <br />
                {status.data.role} · {status.data.products} {t("products", "পণ্য")}
              </p>
              <div className="entry-assurance">
                <ShieldCheck />
                {t("Two-factor verified session", "দুই-ধাপ যাচাইকৃত সেশন")}
              </div>
              <Button
                variant="outline"
                className="entry-submit"
                onClick={async () => {
                  await signOut();
                  setStep("login");
                  await status.refetch();
                }}
              >
                <LogOut />
                {t("Sign out", "বের হন")}
              </Button>
            </>
          ) : (
            <>
              <h1>
                {step === "login"
                  ? t("Welcome back.", "স্বাগতম।")
                  : step === "enroll"
                    ? t("A little extra protection.", "আরও একটু সুরক্ষা।")
                    : t("Verify it’s you.", "আপনার পরিচয় যাচাই করুন।")}
              </h1>
              <p className="entry-intro">
                {step === "login"
                  ? t(
                      "Sign in to the private Scentology atelier.",
                      "ব্যক্তিগত Scentology আতেলিয়েতে প্রবেশ করুন।",
                    )
                  : step === "enroll"
                    ? t(
                        "Scan with your authenticator, then enter your six-digit code.",
                        "অথেনটিকেটরে স্ক্যান করুন, তারপর ছয় অঙ্কের কোড দিন।",
                      )
                    : t(
                        "Enter the six-digit code from your authenticator.",
                        "আপনার অথেনটিকেটরের ছয় অঙ্কের কোড দিন।",
                      )}
              </p>
              <form onSubmit={submit}>
                {step === "login" ? (
                  <>
                    <label htmlFor="email">{t("Email address", "ইমেইল ঠিকানা")}</label>
                    <input
                      className="entry-input"
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@example.com"
                      maxLength={254}
                      required
                    />
                    <label htmlFor="password">{t("Password", "পাসওয়ার্ড")}</label>
                    <div className="password-field">
                      <input
                        className="entry-input"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        maxLength={128}
                        required
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {step === "enroll" && qr && (
                      <img
                        className="totp-image"
                        src={
                          qr.startsWith("data:")
                            ? qr
                            : `data:image/svg+xml,${encodeURIComponent(qr)}`
                        }
                        alt="Authenticator setup QR code"
                      />
                    )}
                    <label htmlFor="code">{t("Verification code", "যাচাইকরণ কোড")}</label>
                    <input
                      className="entry-input"
                      id="code"
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      minLength={6}
                      maxLength={6}
                      placeholder="000000"
                      required
                    />
                  </>
                )}
                {error && (
                  <p role="alert" className="entry-error">
                    {error}
                  </p>
                )}
                <Button className="entry-submit" type="submit" disabled={busy || status.isLoading}>
                  {busy ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      {step === "login"
                        ? t("Enter the atelier", "আতেলিয়েতে প্রবেশ করুন")
                        : t("Verify & continue", "যাচাই করে এগিয়ে যান")}
                      <ArrowRight />
                    </>
                  )}
                </Button>
                {step !== "login" && (
                  <Button
                    className="mt-4 w-full"
                    variant="ghost"
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setStep("login");
                      setQr("");
                      setError("");
                    }}
                  >
                    {t("Back to sign in", "প্রবেশ পাতায় ফিরুন")}
                  </Button>
                )}
              </form>
              <div className="entry-assurance">
                <ShieldCheck />
                {t("Protected with two-factor authentication", "দুই-ধাপ যাচাই দ্বারা সুরক্ষিত")}
              </div>
            </>
          )}
        </div>
        <footer className="entry-bottom">
          <span>© 2026 Scentology BD</span>
          <span>{t("Private administration", "ব্যক্তিগত প্রশাসন")}</span>
        </footer>
      </section>
    </main>
  );
}
