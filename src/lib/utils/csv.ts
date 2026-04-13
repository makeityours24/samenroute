type ParsedCsvRow = Record<string, string>;

function detectDelimiter(input: string) {
  const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [";", ",", "\t"];

  let selected = ";";
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = firstLine.split(candidate).length;
    if (score > bestScore) {
      bestScore = score;
      selected = candidate;
    }
  }

  return selected;
}

function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells.map((cell) => cell.replace(/^"(.*)"$/, "$1").trim());
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function parseCsv(input: string): ParsedCsvRow[] {
  const trimmed = input.replace(/^\uFEFF/, "").trim();

  if (!trimmed) {
    return [];
  }

  const delimiter = detectDelimiter(trimmed);
  const rawLines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (rawLines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(rawLines[0], delimiter).map(normalizeHeader);

  return rawLines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return headers.reduce<ParsedCsvRow>((row, header, index) => {
      if (!header) {
        return row;
      }

      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
}
