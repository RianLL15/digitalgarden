// Natural sort comparison - handles numbers anywhere in the string
const naturalCompare = (a, b) => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  // Split into chunks of text and numbers
  const aChunks = aLower.match(/(\d+|\D+)/g) || [];
  const bChunks = bLower.match(/(\d+|\D+)/g) || [];

  const maxLen = Math.max(aChunks.length, bChunks.length);

  for (let i = 0; i < maxLen; i++) {
    const aChunk = aChunks[i] || "";
    const bChunk = bChunks[i] || "";

    const aIsNum = /^\d+$/.test(aChunk);
    const bIsNum = /^\d+$/.test(bChunk);

    if (aIsNum && bIsNum) {
      const diff = parseInt(aChunk, 10) - parseInt(bChunk, 10);
      if (diff !== 0) return diff;
    } else {
      if (aChunk < bChunk) return -1;
      if (aChunk > bChunk) return 1;
    }
  }

  return 0;
};

const MONTH_ORDER = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

const normalizeFolderLabel = (value) => value.replace(/^M\d{2}\s*-\s*/i, "").trim();

const parseMonthRank = (value) => {
  const normalized = normalizeFolderLabel(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return MONTH_ORDER[normalized] || null;
};

const sortTree = (unsorted) => {
  // Sort by folder before file, then by name
  const orderedTree = Object.keys(unsorted)
    .sort((a, b) => {
      const aPinned = unsorted[a].pinned || false;
      const bPinned = unsorted[b].pinned || false;
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      const aIsNote = a.indexOf(".md") > -1;
      const bIsNote = b.indexOf(".md") > -1;

      if (aIsNote && !bIsNote) return 1;
      if (!aIsNote && bIsNote) return -1;

      if (!aIsNote && !bIsNote) {
        const aMonth = parseMonthRank(a);
        const bMonth = parseMonthRank(b);

        // If both are month folders, enforce calendar order
        if (aMonth !== null && bMonth !== null) {
          return aMonth - bMonth;
        }

        // For folder display/sort, ignore Mxx - prefix
        return naturalCompare(normalizeFolderLabel(a), normalizeFolderLabel(b));
      }

      return naturalCompare(a, b);
    })
    .reduce((obj, key) => {
      obj[key] = unsorted[key];
      return obj;
    }, {});

  for (const key of Object.keys(orderedTree)) {
    if (orderedTree[key].isFolder) {
      orderedTree[key] = sortTree(orderedTree[key]);
      orderedTree[key].displayName = normalizeFolderLabel(key);
    }
  }

  return orderedTree;
};

function getPermalinkMeta(note) {
  let permalink = "/";
  let parts = note.filePathStem.split("/");
  let name = parts[parts.length - 1];
  let noteIcon = process.env.NOTE_ICON_DEFAULT;
  let hide = false;
  let pinned = false;
  let folders = null;
  try {
    if (note.data.permalink) {
      permalink = note.data.permalink;
    }
    if (note.data.tags && note.data.tags.indexOf("gardenEntry") != -1) {
      permalink = "/";
    }
    if (note.data.title) {
      name = note.data.title;
    }
    if (note.data.noteIcon) {
      noteIcon = note.data.noteIcon;
    }
    if (note.data.hide) {
      hide = note.data.hide;
    }
    if (note.data.pinned) {
      pinned = note.data.pinned;
    }
    if (note.data["dg-path"]) {
      folders = note.data["dg-path"].split("/");
    } else {
      folders = note.filePathStem.split("notes/")[1].split("/");
    }
    folders[folders.length - 1] += ".md";
  } catch {
    // ignore
  }

  return [{ permalink, name, noteIcon, hide, pinned }, folders];
}

function assignNested(obj, keyPath, value) {
  const lastKeyIndex = keyPath.length - 1;
  for (let i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = { isFolder: true, displayName: normalizeFolderLabel(key) };
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

function getFileTree(data) {
  const tree = {};
  (data.collections.note || []).forEach((note) => {
    const [meta, folders] = getPermalinkMeta(note);
    assignNested(tree, folders, { isNote: true, ...meta });
  });
  return sortTree(tree);
}

exports.getFileTree = getFileTree;
