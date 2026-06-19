const QuoteBand = () => {
  return (
    <div className="band" id="quote">
      <div
        className="band-bg"
        id="band1"
        style={{
          backgroundImage: "url('/landing/images/quote.webp')",
          backgroundPosition: "center -5%",
        }}
      />
      <div className="band-body">
        <p className="band-quote">
          &ldquo;Eleganța nu înseamnă să fii remarcat.
          <br />
          Înseamnă să fii <strong>memorat.</strong>&rdquo;
        </p>
        <div className="band-source">&mdash; The Hunter House &mdash;</div>
      </div>
    </div>
  )
}

export default QuoteBand
