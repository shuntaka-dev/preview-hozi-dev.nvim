import matter from 'gray-matter';
import * as MarkdownToHtml from '@hozi-dev/markdown-to-html';

export const convertHoziDevHtmlFromMd = (
  markdownString: string,
): { title: string; content: string } => {
  const markdownExcludeMatter = matter(markdownString);

  const html = MarkdownToHtml.default(markdownExcludeMatter.content);

  return {
    title: markdownExcludeMatter.data.title,
    content: html,
  };
};
