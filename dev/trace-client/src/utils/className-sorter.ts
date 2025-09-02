/**
 * Automated className sorting utility for Tailwind CSS classes
 * Sorts classes in logical order: layout, flexbox, spacing, sizing, typography, colors, borders, effects, etc.
 */

interface ClassSorterConfig {
  // Layout (display, position, float, etc.)
  layout: string[];
  // Flexbox & Grid
  flexGrid: string[];
  // Spacing (margin, padding, gap)
  spacing: string[];
  // Sizing (width, height, max-width, etc.)
  sizing: string[];
  // Typography (font, text, line-height, etc.)
  typography: string[];
  // Colors (text colors, background colors)
  colors: string[];
  // Borders & Rounded corners
  borders: string[];
  // Effects (shadow, opacity, etc.)
  effects: string[];
  // Transitions & Animations
  transitions: string[];
  // Interactive states (hover, focus, active, etc.)
  interactive: string[];
  // Other (cursor, z-index, etc.)
  other: string[];
}

// Define the class order categories with regex patterns
const CLASS_ORDER_CONFIG: ClassSorterConfig = {
  layout: [
    'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption',
    'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group',
    'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden',
    'static', 'fixed', 'absolute', 'relative', 'sticky', 'inset', 'top', 'right', 'bottom', 'left',
    'visible', 'invisible', 'collapse', 'isolate', 'isolation-auto', 'float-right', 'float-left', 'float-none',
    'clear-left', 'clear-right', 'clear-both', 'clear-none', 'box-border', 'box-content'
  ],
  flexGrid: [
    'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse', 'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
    'content-center', 'content-start', 'content-end', 'content-between', 'content-around', 'content-evenly',
    'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline',
    'flex-1', 'flex-auto', 'flex-initial', 'flex-none', 'grow', 'grow-0', 'shrink', 'shrink-0',
    'order-first', 'order-last', 'order-none',
    'grid-cols', 'grid-rows', 'col-auto', 'col-span', 'col-start', 'col-end',
    'row-auto', 'row-span', 'row-start', 'row-end', 'gap', 'gap-x', 'gap-y'
  ],
  spacing: [
    'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-', 'ms-', 'me-',
    'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'ps-', 'pe-',
    'space-x', 'space-y'
  ],
  sizing: [
    'w-', 'min-w-', 'max-w-', 'h-', 'min-h-', 'max-h-',
    'size-', 'aspect-', 'container'
  ],
  typography: [
    'font-', 'text-', 'leading-', 'tracking-', 'antialiased', 'subpixel-antialiased',
    'italic', 'not-italic', 'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'underline', 'overline', 'line-through', 'no-underline', 'decoration-',
    'underline-offset-', 'indent-', 'align-', 'whitespace-', 'break-', 'hyphens-',
    'content-', 'list-', 'list-inside', 'list-outside'
  ],
  colors: [
    'text-inherit', 'text-current', 'text-transparent', 'text-black', 'text-white',
    'text-slate-', 'text-gray-', 'text-zinc-', 'text-neutral-', 'text-stone-',
    'text-red-', 'text-orange-', 'text-amber-', 'text-yellow-', 'text-lime-',
    'text-green-', 'text-emerald-', 'text-teal-', 'text-cyan-', 'text-sky-',
    'text-blue-', 'text-indigo-', 'text-violet-', 'text-purple-', 'text-fuchsia-',
    'text-pink-', 'text-rose-',
    'bg-inherit', 'bg-current', 'bg-transparent', 'bg-black', 'bg-white',
    'bg-slate-', 'bg-gray-', 'bg-zinc-', 'bg-neutral-', 'bg-stone-',
    'bg-red-', 'bg-orange-', 'bg-amber-', 'bg-yellow-', 'bg-lime-',
    'bg-green-', 'bg-emerald-', 'bg-teal-', 'bg-cyan-', 'bg-sky-',
    'bg-blue-', 'bg-indigo-', 'bg-violet-', 'bg-purple-', 'bg-fuchsia-',
    'bg-pink-', 'bg-rose-',
    'fill-', 'stroke-'
  ],
  borders: [
    'border', 'border-', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l',
    'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none',
    'divide-', 'divide-x', 'divide-y', 'divide-solid', 'divide-dashed', 'divide-dotted', 'divide-double', 'divide-none',
    'outline', 'outline-', 'outline-offset-',
    'ring', 'ring-', 'ring-inset', 'ring-offset-',
    'rounded', 'rounded-', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l',
    'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'
  ],
  effects: [
    'shadow', 'shadow-', 'drop-shadow', 'drop-shadow-',
    'opacity-', 'mix-blend-', 'bg-blend-',
    'filter', 'blur', 'brightness-', 'contrast-', 'drop-shadow-', 'grayscale', 'hue-rotate-',
    'invert', 'saturate-', 'sepia-', 'backdrop-blur', 'backdrop-brightness-', 'backdrop-contrast-',
    'backdrop-grayscale', 'backdrop-hue-rotate-', 'backdrop-invert', 'backdrop-opacity-',
    'backdrop-saturate-', 'backdrop-sepia-'
  ],
  transitions: [
    'transition', 'transition-', 'duration-', 'ease-', 'delay-',
    'animate-', 'transform', 'transform-gpu', 'transform-none',
    'origin-', 'scale-', 'rotate-', 'translate-', 'skew-'
  ],
  interactive: [
    'accent-', 'appearance-', 'caret-', 'cursor-', 'pointer-events-', 'resize', 'resize-',
    'scroll-', 'select-', 'snap-', 'touch-', 'user-select-',
    'will-change-', 'hover:', 'focus:', 'focus-within:', 'focus-visible:', 'active:',
    'visited:', 'target:', 'first:', 'last:', 'only:', 'odd:', 'even:',
    'disabled:', 'enabled:', 'checked:', 'indeterminate:', 'default:', 'required:',
    'valid:', 'invalid:', 'in-range:', 'out-of-range:', 'placeholder-shown:', 'autofill:',
    'read-only:', 'group-hover:', 'group-focus:', 'peer-'
  ],
  other: [
    'sr-only', 'not-sr-only', 'forced-color-adjust-', 'print:', 'dark:', 'motion-safe:',
    'motion-reduce:', 'contrast-more:', 'contrast-less:', 'portrait:', 'landscape:',
    'ltr:', 'rtl:', 'open:', 'closed:'
  ]
};

/**
 * Determines the order priority of a CSS class
 */
function getClassOrderPriority(className: string): number {
  const categories = Object.values(CLASS_ORDER_CONFIG);
  
  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    const category = categories[categoryIndex];
    
    for (const pattern of category) {
      if (pattern.endsWith('-')) {
        // Pattern like 'text-' matches 'text-red-500', 'text-lg', etc.
        if (className.startsWith(pattern)) {
          return categoryIndex * 1000 + category.indexOf(pattern);
        }
      } else if (pattern.endsWith(':')) {
        // Pattern like 'hover:' matches 'hover:text-blue-500', etc.
        if (className.startsWith(pattern)) {
          return categoryIndex * 1000 + category.indexOf(pattern);
        }
      } else {
        // Exact match
        if (className === pattern) {
          return categoryIndex * 1000 + category.indexOf(pattern);
        }
      }
    }
  }
  
  // Unknown class goes to the end
  return 999999;
}

/**
 * Sorts an array of CSS classes according to the logical order
 */
export function sortClasses(classes: string[]): string[] {
  return classes
    .filter(cls => cls.trim().length > 0)
    .sort((a, b) => {
      const priorityA = getClassOrderPriority(a.trim());
      const priorityB = getClassOrderPriority(b.trim());
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort alphabetically
      return a.trim().localeCompare(b.trim());
    });
}

/**
 * Parses and sorts className strings, handling various patterns
 */
export function sortClassNameString(classNameValue: string): string {
  // Handle simple string case: className="flex items-center"
  if (!classNameValue.includes('${') && !classNameValue.includes('`')) {
    const classes = classNameValue.split(/\s+/).filter(cls => cls.length > 0);
    return sortClasses(classes).join(' ');
  }
  
  // For complex template literals and expressions, we'll need more sophisticated parsing
  // This is a basic implementation that handles simple cases
  return classNameValue;
}

/**
 * Main function to process className attributes in JSX/TSX content
 */
export function processClassNames(content: string): string {
  let result = content;
  
  // Pattern 1: Simple string className="..."
  result = result.replace(
    /className="([^"]+)"/g,
    (_, classNames) => {
      const sorted = sortClassNameString(classNames);
      return `className="${sorted}"`;
    }
  );
  
  // Pattern 2: Simple string className='...'
  result = result.replace(
    /className='([^']+)'/g,
    (_, classNames) => {
      const sorted = sortClassNameString(classNames);
      return `className='${sorted}'`;
    }
  );
  
  // Pattern 3: Template literal className={`...`} (basic case without variables)
  result = result.replace(
    /className=\{`([^`${}]+)`\}/g,
    (_, classNames) => {
      const sorted = sortClassNameString(classNames);
      return `className={\`${sorted}\`}`;
    }
  );
  
  return result;
}

/**
 * Advanced className processor that handles complex cases with clsx, cn, etc.
 */
export function processComplexClassNames(content: string): string {
  // This would need more sophisticated AST parsing for complex cases
  // For now, we'll handle the basic cases above
  return processClassNames(content);
}