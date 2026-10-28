/** The validation messages under one admin form field. */
export default function FieldMessages({ messages }: { messages?: string[] }) {
  return messages?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>);
}
