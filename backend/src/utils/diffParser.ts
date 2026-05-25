export type DiffLineType = "added" | "removed" | "context";

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

export interface HunkContext {
  before: DiffLine[];
  after: DiffLine[];
}

export interface Hunk {
  filename: string;
  startLine: number;
  lines: DiffLine[];
  surroundingContext: HunkContext;
}

const hunkHeaderPattern = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
const contextLineLimit = 10;

function surroundingContext(lines: DiffLine[]): HunkContext {
  const firstChangedLine = lines.findIndex((line) => line.type !== "context");
  let lastChangedLine = -1;

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];

    if (line && line.type !== "context") {
      lastChangedLine = index;
      break;
    }
  }

  if (firstChangedLine === -1 || lastChangedLine === -1) {
    return {
      before: lines.slice(-contextLineLimit),
      after: [],
    };
  }

  return {
    before: lines.slice(0, firstChangedLine).slice(-contextLineLimit),
    after: lines.slice(lastChangedLine + 1, lastChangedLine + 1 + contextLineLimit),
  };
}

export function parseDiff(patch: string, filename: string): Hunk[] {
  const patchLines = patch.replace(/\r\n/g, "\n").split("\n");
  const hunks: Hunk[] = [];

  for (let index = 0; index < patchLines.length; index += 1) {
    const header = patchLines[index];

    if (header === undefined) {
      continue;
    }

    const match = hunkHeaderPattern.exec(header);

    if (!match) {
      continue;
    }

    const oldStart = Number(match[1]);
    const newStart = Number(match[2]);
    let oldLineNumber = oldStart;
    let newLineNumber = newStart;
    const lines: DiffLine[] = [];

    index += 1;

    for (; index < patchLines.length; index += 1) {
      const line = patchLines[index];

      if (line === undefined) {
        continue;
      }

      if (hunkHeaderPattern.test(line)) {
        index -= 1;
        break;
      }

      if (line === "\\ No newline at end of file") {
        continue;
      }

      if (line.startsWith("+")) {
        lines.push({
          type: "added",
          content: line.slice(1),
          oldLineNumber: null,
          newLineNumber,
        });
        newLineNumber += 1;
        continue;
      }

      if (line.startsWith("-")) {
        lines.push({
          type: "removed",
          content: line.slice(1),
          oldLineNumber,
          newLineNumber: null,
        });
        oldLineNumber += 1;
        continue;
      }

      if (line.startsWith(" ")) {
        lines.push({
          type: "context",
          content: line.slice(1),
          oldLineNumber,
          newLineNumber,
        });
        oldLineNumber += 1;
        newLineNumber += 1;
      }
    }

    hunks.push({
      filename,
      startLine: newStart,
      lines,
      // GitHub patches only contain context included in the diff; capture up to ten available lines.
      surroundingContext: surroundingContext(lines),
    });
  }

  return hunks;
}
