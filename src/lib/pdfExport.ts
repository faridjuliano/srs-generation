import html2pdf from 'html2pdf.js';

interface PDFExportOptions {
  filename?: string;
  projectName?: string;
}

export const exportSRSToPDF = async (options: PDFExportOptions = {}) => {
  try {
    const {
      filename = 'SRS_Document.pdf'
    } = options;

    // Get the main content to export
    const contentElement = document.querySelector('main');

    if (!contentElement) {
      console.error('Content element not found');
      return;
    }

    // Create a temporary container for processing
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    // Clone the element
    const clonedElement = contentElement.cloneNode(true) as HTMLElement;
    tempContainer.appendChild(clonedElement);

    // Remove unwanted elements
    const elementsToRemove = clonedElement.querySelectorAll('header, .flex.flex-col.sm\\:flex-row.gap-2');
    elementsToRemove.forEach(el => el.remove());

    // Get all elements in the cloned content
    const allElements = clonedElement.querySelectorAll('*');

    // Apply computed styles to all elements
    allElements.forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);

      // Copy all computed styles as inline styles
      // This converts lab() colors to rgb() automatically
      const styleProps = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'fontSize',
        'fontWeight',
        'fontFamily',
        'lineHeight',
        'padding',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'margin',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'borderWidth',
        'borderStyle',
        'borderRadius',
        'display',
        'flexDirection',
        'alignItems',
        'justifyContent',
        'textAlign',
        'width',
        'maxWidth',
        'minWidth'
      ];

      styleProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== '' && value !== 'none') {
          element.style.setProperty(prop, value, 'important');
        }
      });

      // Remove all class names to prevent CSS from being reapplied
      element.className = '';
    });

    // Also apply styles to the container itself
    const containerStyle = window.getComputedStyle(clonedElement);
    clonedElement.style.backgroundColor = containerStyle.backgroundColor || '#ffffff';
    clonedElement.style.color = containerStyle.color || '#000000';

    // Create PDF options
    const pdfOptions = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 0,
        allowTaint: true,
        ignoreElements: (element: Element) => {
          // Ignore style and link elements
          return element.tagName === 'STYLE' || element.tagName === 'LINK';
        }
      },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    } as any;

    try {
      // Generate PDF
      await html2pdf().set(pdfOptions).from(clonedElement).save();
    } finally {
      // Clean up temporary container
      document.body.removeChild(tempContainer);
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export default exportSRSToPDF;

