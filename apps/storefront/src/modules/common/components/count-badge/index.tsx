type CountBadgeProps = {
  count: number
}

const CountBadge = ({ count }: CountBadgeProps) => {
  if (count <= 0) return null

  return (
    <span
      data-testid="count-badge"
      data-badge={count > 99 ? "99+" : String(count)}
      className="count-badge absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
  )
}

export default CountBadge
