"use client"

import { motion, useReducedMotion } from "framer-motion"

export default function Events() {
  const reduced = useReducedMotion()

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
      freq: "Săptămânal",
      title: "Friday Social Club",
      highlighted: "Social Club",
      when: "Vineri · 19:00 · Prin invitație",
      desc: "Seara care a definit The Hunter House. Un cerc privat de antreprenori, reuniți pentru degustare de vin curatoriată, pian live și conversații care contează.",
      perks: [
        "3 vinuri tematice selectate",
        "Pian live – muzică de atmosferă",
        "15–20 invitați selectați · waiting list",
        "Platouri de charcuterie și brânzeturi",
      ],
      delay: "0s",
    },
    {
      id: 2,
      freq: "Lunar",
      title: "Prosecco Evening",
      highlighted: "Evening",
      when: "Miercuri sau Joi · 19:00 · Selectiv",
      desc: "O seară mai luminoasă, mai socială. Prosecco și vinuri spumante premium, gustări rafinate, atmosfera unui club privat. Deschis unui public nou.",
      perks: [
        "Selecție prosecco și spumante premium",
        "Gustări light – bruschette, charcuterie",
        "20–30 invitați · format semi-deschis",
      ],
      delay: "0.12s",
    },
    {
      id: 3,
      freq: "Anual",
      title: "The Hunter Annual",
      highlighted: "Annual",
      when: "Toamnă · Invitație exclusivă · Național",
      desc: "Lansarea colecției de vânătoare și ecvestru. Invitați selectați din toată România. Selecție de vinuri premium. Parteneri de brand.",
      perks: [
        "Lansare colecție Heritage & Vânătoare",
        "Degustare verticală curatoriată",
        "Invitați naționali · presă · parteneri",
      ],
      delay: "0.24s",
    },
  ]

  return (
    <section className="section ev-sec" id="events">
      <div className="section-inner">
        <div className="kicker rv">
          <span className="kicker-bar"></span>Events
        </div>
        <h2 className="sec-title rv">
          Seri care
          <br />
          nu se <em>uită</em>
        </h2>
        <div className="line-draw rv" style={{ maxWidth: "260px" }}></div>
        <div className="ev-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="ev rv"
              style={{ transitionDelay: event.delay }}
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
                {event.title.replace(event.highlighted, "")}
                <br />
                <em>{event.highlighted}</em>
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
