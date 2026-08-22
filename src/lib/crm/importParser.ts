/** Parse CSV text into row objects using the first row as headers. */
export function parseCsvText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });
}

export const IMPORT_TEMPLATE_HEADERS = [
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Company Name',
  'Lead Type',
  'Lead Source',
  'Priority',
  'Status',
  'Assigned Agent Email',
  'Expected Deal Value',
  'Next Follow-up Date',
  'Description',
  'Tags',
];

export function downloadImportTemplate() {
  const sample = [
    'John',
    'Doe',
    'john@example.com',
    '9876543210',
    'Acme Corp',
    'Brand',
    'Website',
    'Medium',
    'New',
    '',
    '50000',
    '2026-09-01',
    'Sample lead',
    'vip,enterprise',
  ];
  const csv = [IMPORT_TEMPLATE_HEADERS.join(','), sample.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'crm-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(csv: string, fileName: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
