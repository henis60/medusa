const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <div
      role="radio"
      aria-checked={checked}
      data-testid={dataTestId || 'radio-button'}
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150"
      style={{
        borderColor: checked ? "#c9a84c" : "var(--theme-border)",
        backgroundColor: checked ? "transparent" : "transparent",
      }}
    >
      {checked && (
        <div className="h-2 w-2 rounded-full bg-hunter-gold" />
      )}
    </div>
  )
}

export default Radio
