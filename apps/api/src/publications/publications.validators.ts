export function validateCreatePublication(body: any) {
  const type = String(body.type || '');
  const title = String(body.title || '').trim();
  const contentHtml = String(body.contentHtml || '').trim();

  const visibility = body.visibility ? String(body.visibility) : 'PUBLIC';
  const campusId = body.campusId ? String(body.campusId) : null;
  const themeId = body.themeId ? String(body.themeId) : null;

  const eventStartAt = body.eventStartAt ? String(body.eventStartAt) : null;
  const eventEndAt = body.eventEndAt ? String(body.eventEndAt) : null;

  const allowedTypes = ['POST', 'EVENT', 'CAMPUS_ANNOUNCEMENT'];
  const allowedVisibility = ['PUBLIC', 'CAMPUS_ONLY', 'PRIVATE'];

  if (!allowedTypes.includes(type)) throw new Error('Invalid type');
  if (!title) throw new Error('Title required');
  if (!contentHtml) throw new Error('contentHtml required');
  if (!allowedVisibility.includes(visibility))
    throw new Error('Invalid visibility');

  if (type === 'EVENT') {
    if (!eventStartAt || !eventEndAt)
      throw new Error('Event start/end required');
  }

  return {
    type,
    title,
    contentHtml,
    visibility,
    campusId,
    themeId,
    eventStartAt,
    eventEndAt,
  };
}

export function validatePatchPublication(body: any) {
  const out: any = {};
  if (body.title !== undefined) out.title = String(body.title).trim();
  if (body.contentHtml !== undefined)
    out.contentHtml = String(body.contentHtml).trim();
  if (body.visibility !== undefined) out.visibility = String(body.visibility);
  if (body.campusId !== undefined)
    out.campusId = body.campusId ? String(body.campusId) : null;
  if (body.themeId !== undefined)
    out.themeId = body.themeId ? String(body.themeId) : null;
  if (body.eventStartAt !== undefined)
    out.eventStartAt = body.eventStartAt ? String(body.eventStartAt) : null;
  if (body.eventEndAt !== undefined)
    out.eventEndAt = body.eventEndAt ? String(body.eventEndAt) : null;
  return out;
}
