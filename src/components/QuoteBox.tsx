export default function QuoteBox({ quote }: { quote: string }) {
  return quote ? (
    <blockquote className="quote-box">“{quote}”</blockquote>
  ) : null;
}
