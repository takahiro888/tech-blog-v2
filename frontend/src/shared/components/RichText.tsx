type Props = {
  html: string;
  className?: string;
};

export function RichText({ html, className = "" }: Props) {
  return (
    <div
      className={`prose max-w-none prose-h2:border-l-4 prose-h2:border-blue-700 prose-h2:pl-3 prose-a:text-blue-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
