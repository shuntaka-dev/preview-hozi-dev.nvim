import Token from 'markdown-it/lib/token';
import Renderer from 'markdown-it/lib/renderer';
import MarkdownIt from 'markdown-it';
import MarkdownItBr from 'markdown-it-br';
import MarkdownItImsize from 'markdown-it-imsize';
import MarkdownItAnchor from 'markdown-it-anchor';
import Prismjs from 'prismjs';
import matter from 'gray-matter';
import loadLanguages from 'prismjs/components/';

export class SwaggerUiError extends Error {
  public constructor() {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SwaggerUiError);
    }
    this.name = this.constructor.name;
  }
}

export class SwaggerUiNotSupportedFileType extends SwaggerUiError {
  convertSwaggerJsonPrameter: ConvertSwaggerJsonPrameter;
  public constructor(convertSwaggerJsonPrameter: ConvertSwaggerJsonPrameter) {
    super();
    this.convertSwaggerJsonPrameter = convertSwaggerJsonPrameter;
    this.name = this.constructor.name;
  }
}

export class SwaggerUiUnknownError extends SwaggerUiError {
  error: Error;
  public constructor(e: Error) {
    super();
    this.name = this.constructor.name;
    this.error = e;
  }
}

interface ConvertSwaggerJsonPrameter {
  bufferRows: string[];
  fileFullPath: string;
}

// TODO lib
const convertHtmlFromMarkdown = (markdownString: string): string => {
  const md = new MarkdownIt({
    linkify: true,
    breaks: true,
  })
    .use(MarkdownItBr)
    .use(MarkdownItImsize)
    .use(MarkdownItAnchor, {
      level: [1, 2, 3],
      permalink: true,
    });

  md.options.highlight = (str: string, lang: string): string => {
    const prismLang = ((): Prismjs.Grammar => {
      const la = Prismjs.languages[lang];
      if (la === undefined) {
        loadLanguages([lang]);
        return Prismjs.languages[lang];
      }

      return la;
    })();
    const highlightedtext = Prismjs.highlight(str, prismLang, lang);

    return `<pre class="hozi-dev-code-block"><code class="language-${lang}">${highlightedtext}</code></pre>`;
  };

  // eslint-disable-next-line
  md.renderer.rules.link_open = (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    // eslint-disable-next-line
    _env: any,
    self: Renderer,
  ) => {
    const aIndex = tokens[idx].attrIndex('target');
    if (tokens[idx]['attrs'][0][1].match('http')) {
      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank';
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  return md.render(markdownString);
};

export const convertHoziDevContent = (
  convertSwaggerJsonPrameter: ConvertSwaggerJsonPrameter,
): { title: string; content: string } => {
  try {
    const buffer = convertSwaggerJsonPrameter.bufferRows.join('\n');

    const markdownExcludeMatter = matter(buffer);
    const html = convertHtmlFromMarkdown(markdownExcludeMatter.content);

    return {
      title: markdownExcludeMatter.data.title,
      content: html,
    };
  } catch (e) {
    throw new Error();
  }
};
