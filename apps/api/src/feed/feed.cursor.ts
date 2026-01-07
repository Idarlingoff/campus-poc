export function encodeCursor(publishedAtIso: string, id: string) {
    return Buffer.from(`${publishedAtIso}|${id}`, 'utf8').toString('base64');
}

export function decodeCursor(cursor: string): { publishedAtIso: string; id: string } {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    const [publishedAtIso, id] = raw.split('|');
    if (!publishedAtIso || !id) throw new Error('Invalid cursor');
    return { publishedAtIso, id };
}