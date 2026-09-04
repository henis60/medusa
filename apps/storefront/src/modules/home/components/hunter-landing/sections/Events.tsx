"use client"

import { m as motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

export default function Events() {
  const reduced = useReducedMotion()
  const t = useTranslations("home")

  const barVariants = {
    hidden: { height: 0 },
    visible: {
      height: "100%",
      transition: reduced
        ? { duration: 0 }
        : ({ duration: 0.8, ease: [0.23, 1, 0.32, 1] } as const),
    },
  }
  const events = [
    {
      id: 1,
      freq: t("Săptămânal"),
      titleMain: t("Friday"),
      titleEm: t("Social Club"),
      when: t("Vineri · 19:00 · Prin invitație"),
      desc: t("Seara care a definit The Hunter House Un cerc privat de antreprenori, reuniți pentru degustare de vin curatoriată, pian live și conversații care contează"),
      perks: t.raw("fridaySocialClubPerks") as string[],
      delay: "0s",
    },
    {
      id: 2,
      freq: t("Lunar"),
      titleMain: t("Prosecco"),
      titleEm: t("Evening"),
      when: t("Miercuri sau Joi · 19:00 · Selectiv"),
      desc: t("O seară mai luminoasă, mai socială Prosecco și vinuri spumante premium, gustări rafinate, atmosfera unui club privat Deschis unui public nou"),
      perks: t.raw("proseccoEveningPerks") as string[],
      delay: "0.12s",
    },
    {
      id: 3,
      freq: t("Anual"),
      titleMain: t("The Hunter"),
      titleEm: t("Annual"),
      when: t("Toamnă · Invitație exclusivă · Național"),
      desc: t("Lansarea colecției de vânătoare și ecvestru Invitați selectați din toată România Selecție de vinuri premium Parteneri de brand"),
      perks: t.raw("hunterAnnualPerks") as string[],
      delay: "0.24s",
    },
  ]

  return (
    <section className="section ev-sec" id="events">
      <div className="section-inner">
        <div className="kicker rv">
          {t("Events")}
        </div>
        <h2 className="sec-title rv">
          {t("Seri care")}
          <br />
          {t("nu se")} <em>{t("uită")}</em>
        </h2>
        <div className="line-draw rv" style={{ maxWidth: "260px" }}></div>
        <div className="ev-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="ev rv"
              data-rv-delay={event.delay}
            >
              <motion.div
                className="ev-bar"
                variants={barVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              />
              <div className="ev-freq">{event.freq}</div>
              <div className="ev-title">
                {event.titleMain}
                <br />
                <em>{event.titleEm}</em>
              </div>
              <div className="ev-when">{event.when}</div>
              <p className="ev-desc">{event.desc}</p>
              <div className="flex flex-col gap-[9px]">
                {event.perks.map((perk, idx) => (
                  <div key={idx} className="ev-perk">
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
