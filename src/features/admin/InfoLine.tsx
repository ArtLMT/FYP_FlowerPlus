/** One "Label: value" line on an admin card. */
export default function InfoLine({ label, value }: { label: string; value: string }) {
  return <p className="text-sm text-text-secondary"><span className="font-semibold text-text-primary">{label}: </span>{value}</p>;
}
