import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  content: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <Markdown remarkPlugins={[remarkGfm]}>
        {content}
      </Markdown>
    </div>
  );
};
