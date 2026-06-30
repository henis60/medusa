import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AppointmentForm from "@modules/programare/components/appointment-form"

const ProgramareTemplate = () => {
  return (
    <div className="bg-[var(--theme-bg)] w-full min-h-screen">
      {/* Header */}
      <div className="page-container pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-hunter-gold" />
          <span className="font-sans text-[10px] uppercase tracking-[5px] text-[var(--theme-text-muted)]">
            Programare
          </span>
        </div>
        <h1 className="font-display text-4xl small:text-6xl text-[var(--theme-text)] leading-[0.95] mb-3">
          Rezervă o vizită
        </h1>
        <p className="max-w-md font-serif text-lg text-[var(--theme-text-muted)] leading-relaxed">
          Programează o consultație personalizată sau o sesiune made-to-measure
          și te primim cu toată atenția cuvenită.
        </p>
      </div>

      {/* Body */}
      <div className="page-container pb-8 flex flex-col gap-8">
        {/* Form */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-6 small:p-8">
          <AppointmentForm />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 small:grid-cols-2 gap-6">
          {[
            {
              title: "Consultație personalizată",
              body: "Alegem împreună piesele potrivite stilului și preferințelor tale.",
            },
            {
              title: "Sesiune made-to-measure",
              body: "Măsurători și selecție de materiale pentru o comandă personalizată.",
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="border-t border-[var(--theme-border)] pt-5"
            >
              <h3 className="font-display text-lg text-[var(--theme-text)] mb-2">
                {title}
              </h3>
              <p className="font-serif text-sm text-[var(--theme-text-muted)] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgramareTemplate
