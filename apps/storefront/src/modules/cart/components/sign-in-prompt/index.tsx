import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between py-4 border border-[var(--theme-border)] px-5">
      <div>
        <p className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text)]">
          Ai deja un cont?
        </p>
        <p className="font-sans text-[9px] uppercase tracking-[2px] text-[var(--theme-text-muted)] mt-0.5">
          Conectează-te pentru o experiență mai bună.
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        data-testid="sign-in-button"
        className="font-sans text-[9px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-hunter-gold hover:text-hunter-gold transition-colors px-5 py-2.5"
      >
        Intră în cont
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
