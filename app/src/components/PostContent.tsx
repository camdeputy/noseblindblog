import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PostContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (!href) return <>{children}</>;
            const isExternal = /^https?:\/\//.test(href);
            // Block non-http(s) schemes (javascript:, data:, etc.)
            if (!isExternal && !href.startsWith('/')) return <>{children}</>;
            return (
              <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
