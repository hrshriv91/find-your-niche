/* Pure profile filtering and ranking. Swap this module's data source for an API later. */
(function exposeProfileMatcher(global) {
  const MAX_MATCHES = 3;

  function normalizeField(field) {
    return typeof field === 'string' ? field.trim().toLowerCase() : '';
  }

  function countSharedTags(profile, selectedTags) {
    const profileTags = Array.isArray(profile.struggle_tags) ? profile.struggle_tags : [];
    return selectedTags.filter((tag) => profileTags.includes(tag)).length;
  }

  function rankProfiles(profiles, selectedTags) {
    return [...profiles]
      .map((profile, index) => ({ profile, index, sharedTagCount: countSharedTags(profile, selectedTags) }))
      .sort((first, second) => second.sharedTagCount - first.sharedTagCount || first.index - second.index)
      .slice(0, MAX_MATCHES)
      .map((item) => item.profile);
  }

  /**
   * Return up to three profiles and explain how they were selected.
   * Chosen fields and tags are treated as filters together. If that exact
   * combination is missing, prefer a field-only fallback when a field was chosen.
   */
  function matchProfiles(profiles, filters = {}) {
    const safeProfiles = Array.isArray(profiles) ? profiles : [];
    const field = normalizeField(filters.field);
    const tags = [...new Set(Array.isArray(filters.struggleTags) ? filters.struggleTags : [])];
    const hasFilters = Boolean(field || tags.length);

    const exact = safeProfiles.filter((profile) => {
      const matchesField = !field || normalizeField(profile.field) === field;
      const profileTags = Array.isArray(profile.struggle_tags) ? profile.struggle_tags : [];
      const matchesEveryTag = tags.every((tag) => profileTags.includes(tag));
      return matchesField && matchesEveryTag;
    });

    if (exact.length) {
      return {
        kind: hasFilters ? 'exact' : 'browse',
        matches: rankProfiles(exact, tags),
        field,
        tags
      };
    }

    if (field) {
      const sameField = safeProfiles.filter((profile) => normalizeField(profile.field) === field);
      return { kind: 'field-fallback', matches: rankProfiles(sameField, tags), field, tags };
    }

    if (tags.length) {
      const overlapCounts = safeProfiles.map((profile) => countSharedTags(profile, tags));
      const closestCount = Math.max(0, ...overlapCounts);
      const closest = closestCount
        ? safeProfiles.filter((profile) => countSharedTags(profile, tags) === closestCount)
        : [];
      return { kind: closest.length ? 'tag-fallback' : 'none', matches: rankProfiles(closest, tags), field, tags };
    }

    return { kind: 'browse', matches: rankProfiles(safeProfiles, tags), field, tags };
  }

  global.ProfileMatcher = Object.freeze({ matchProfiles });
}(window));
