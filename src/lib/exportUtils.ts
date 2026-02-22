import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportNote {
  title: string;
  content: string;
  created_at?: string;
  tags?: string[];
}

// Export as Markdown
export function exportAsMarkdown(note: ExportNote) {
  // Convert HTML to markdown format
  const markdown = htmlToMarkdown(note.content || '');
  
  const fullMarkdown = `# ${note.title}\n\n${markdown}\n\n---\n**Created:** ${note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Unknown'}  \n**Tags:** ${note.tags?.join(', ') || 'None'}`;
  
  downloadFile(fullMarkdown, `${sanitizeFilename(note.title)}.md`, 'text/markdown');
}

// Export as HTML
export function exportAsHTML(note: ExportNote) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1, h2, h3, h4, h5, h6 { color: #222; margin: 1.5em 0 0.5em; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 0.8em 0; }
    ul, ol { margin: 0.8em 0; padding-left: 2em; }
    li { margin: 0.4em 0; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; }
    .meta { color: #666; font-size: 0.9em; margin: 20px 0; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #7c3aed; }
    .meta strong { color: #333; }
    .content { margin-top: 30px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(note.title)}</h1>
  <div class="meta">
    <div><strong>Created:</strong> ${note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</div>
    <div><strong>Tags:</strong> ${note.tags?.join(', ') || 'None'}</div>
  </div>
  <div class="content">
    ${note.content || '<p>No content</p>'}
  </div>
</body>
</html>`;
  
  downloadFile(html, `${sanitizeFilename(note.title)}.html`, 'text/html');
}

// Helper to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export as plain text
export function exportAsText(note: ExportNote) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = note.content || '';
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  const content = `${note.title}\n${'='.repeat(note.title.length)}\n\n${text}\n\n---\nCreated: ${note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Unknown'}\nTags: ${note.tags?.join(', ') || 'None'}`;
  
  downloadFile(content, `${sanitizeFilename(note.title)}.txt`, 'text/plain');
}

// Export as PDF
export async function exportAsPDF(note: ExportNote) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(note.title, maxWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 10 + 5;

    // Add separator line
    pdf.setDrawColor(124, 58, 237);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    const createdDate = note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';
    pdf.text(`Created: ${createdDate}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Tags: ${note.tags?.join(', ') || 'None'}`, margin, yPosition);
    yPosition += 12;

    // Process HTML content with better formatting
    pdf.setTextColor(0);
    pdf.setFontSize(11);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content || '';
    
    function processElement(element: Element, currentY: number): number {
      let y = currentY;
      
      for (const node of Array.from(element.childNodes)) {
        if (y > pageHeight - margin - 10) {
          pdf.addPage();
          y = margin;
        }
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            const lines = pdf.splitTextToSize(text, maxWidth);
            lines.forEach((line: string) => {
              if (y > pageHeight - margin - 10) {
                pdf.addPage();
                y = margin;
              }
              pdf.text(line, margin, y);
              y += 6;
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          
          switch (tagName) {
            case 'h1': {
              pdf.setFontSize(18);
              pdf.setFont('helvetica', 'bold');
              const h1Lines = pdf.splitTextToSize(el.textContent || '', maxWidth);
              h1Lines.forEach((line: string) => {
                if (y > pageHeight - margin - 10) {
                  pdf.addPage();
                  y = margin;
                }
                pdf.text(line, margin, y);
                y += 9;
              });
              y += 3;
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              break;
            }
              
            case 'h2': {
              pdf.setFontSize(16);
              pdf.setFont('helvetica', 'bold');
              const h2Lines = pdf.splitTextToSize(el.textContent || '', maxWidth);
              h2Lines.forEach((line: string) => {
                if (y > pageHeight - margin - 10) {
                  pdf.addPage();
                  y = margin;
                }
                pdf.text(line, margin, y);
                y += 8;
              });
              y += 2;
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              break;
            }
              
            case 'h3': {
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              const h3Lines = pdf.splitTextToSize(el.textContent || '', maxWidth);
              h3Lines.forEach((line: string) => {
                if (y > pageHeight - margin - 10) {
                  pdf.addPage();
                  y = margin;
                }
                pdf.text(line, margin, y);
                y += 7;
              });
              y += 2;
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              break;
            }
              
            case 'p': {
              const pText = el.textContent?.trim();
              if (pText) {
                const pLines = pdf.splitTextToSize(pText, maxWidth);
                pLines.forEach((line: string) => {
                  if (y > pageHeight - margin - 10) {
                    pdf.addPage();
                    y = margin;
                  }
                  pdf.text(line, margin, y);
                  y += 6;
                });
                y += 3;
              }
              break;
            }
              
            case 'ul':
            case 'ol': {
              const items = el.querySelectorAll('li');
              items.forEach((li, index) => {
                const bullet = tagName === 'ul' ? '•' : `${index + 1}.`;
                const liText = li.textContent?.trim();
                if (liText) {
                  const liLines = pdf.splitTextToSize(`${bullet} ${liText}`, maxWidth - 5);
                  liLines.forEach((line: string, lineIndex: number) => {
                    if (y > pageHeight - margin - 10) {
                      pdf.addPage();
                      y = margin;
                    }
                    pdf.text(line, margin + (lineIndex > 0 ? 5 : 0), y);
                    y += 6;
                  });
                }
              });
              y += 3;
              break;
            }
              
            case 'blockquote': {
              pdf.setTextColor(100);
              pdf.setFont('helvetica', 'italic');
              const bqText = el.textContent?.trim();
              if (bqText) {
                const bqLines = pdf.splitTextToSize(bqText, maxWidth - 10);
                bqLines.forEach((line: string) => {
                  if (y > pageHeight - margin - 10) {
                    pdf.addPage();
                    y = margin;
                  }
                  pdf.text(line, margin + 5, y);
                  y += 6;
                });
              }
              pdf.setTextColor(0);
              pdf.setFont('helvetica', 'normal');
              y += 3;
              break;
            }
              
            case 'pre':
            case 'code': {
              pdf.setFont('courier', 'normal');
              pdf.setFontSize(9);
              const codeText = el.textContent || '';
              const codeLines = codeText.split('\n');
              codeLines.forEach((line: string) => {
                if (y > pageHeight - margin - 10) {
                  pdf.addPage();
                  y = margin;
                }
                pdf.text(line, margin + 3, y);
                y += 5;
              });
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(11);
              y += 3;
              break;
            }
              
            default:
              y = processElement(el, y);
          }
        }
      }
      
      return y;
    }
    
    processElement(tempDiv, yPosition);

    pdf.save(`${sanitizeFilename(note.title)}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

// Helper function to download a file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  let markdown = '';
  
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(element.childNodes).map(processNode).join('');
      
      switch (tagName) {
        case 'h1':
          return `# ${children}\n\n`;
        case 'h2':
          return `## ${children}\n\n`;
        case 'h3':
          return `### ${children}\n\n`;
        case 'h4':
          return `#### ${children}\n\n`;
        case 'h5':
          return `##### ${children}\n\n`;
        case 'h6':
          return `###### ${children}\n\n`;
        case 'p':
          return `${children}\n\n`;
        case 'br':
          return '\n';
        case 'strong':
        case 'b':
          return `**${children}**`;
        case 'em':
        case 'i':
          return `*${children}*`;
        case 'code':
          return element.parentElement?.tagName === 'PRE' ? children : `\`${children}\``;
        case 'pre':
          return `\n\`\`\`\n${children}\n\`\`\`\n\n`;
        case 'blockquote':
          return children.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
        case 'ul':
          return children + '\n';
        case 'ol':
          return children + '\n';
        case 'li': {
          const isOrdered = element.parentElement?.tagName === 'OL';
          const index = Array.from(element.parentElement?.children || []).indexOf(element) + 1;
          const prefix = isOrdered ? `${index}. ` : '- ';
          return `${prefix}${children}\n`;
        }
        case 'a': {
          const href = element.getAttribute('href');
          return href ? `[${children}](${href})` : children;
        }
        case 'img': {
          const src = element.getAttribute('src');
          const alt = element.getAttribute('alt') || '';
          return src ? `![${alt}](${src})\n\n` : '';
        }
        case 'table':
          return `\n${children}\n`;
        case 'tr':
          return `| ${children}|\n`;
        case 'th':
        case 'td':
          return `${children} | `;
        default:
          return children;
      }
    }
    
    return '';
  }
  
  markdown = processNode(tempDiv);
  return markdown.trim();
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50);
}
