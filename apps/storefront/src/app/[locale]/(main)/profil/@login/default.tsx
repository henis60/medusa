import LoginTemplate from "@modules/account/templates/login-template"

// Parallel routes require a matching segment in EVERY slot for the current
// URL — @login only has an explicit page.tsx for the exact "/profil" path,
// so any deeper path (e.g. /profil/comenzi, /profil/adrese) had no @login
// match at all. Without this default.tsx, Next.js had nothing to render for
// the @login slot on those paths and 404'd the whole route via
// profil/not-found.tsx — racing against (and often beating) the @dashboard
// slot's own redirect() to /profil for a signed-out visitor. default.tsx is
// the documented catch-all for "no more specific match in this slot", so it
// covers every /profil/* sub-path uniformly.
export default function LoginDefault() {
  return <LoginTemplate />
}
