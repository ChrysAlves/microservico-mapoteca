
export function sanitizeFilename(filename: string): string {
  const extension = filename.split('.').pop() || '';
  let base = filename.substring(0, filename.length - (extension.length ? extension.length + 1 : 0));

  base = base.toLowerCase();

  base = base.replace(/\//g, '-');

  base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  base = base.replace(/[\s_]+/g, '_');

  let sanitizedBase = base.replace(/[^\w-]/g, '');

  if (['_', '-'].includes(sanitizedBase.slice(-1))) {
    sanitizedBase = sanitizedBase.slice(0, -1);
  }

  const finalFilename = extension ? `${sanitizedBase}.${extension.toLowerCase()}` : sanitizedBase;

  return finalFilename;
}