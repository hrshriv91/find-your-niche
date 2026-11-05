/* Filter and rank example exams separately from the page interface. */
(function exposeExamMatcher(global) {
  const MAX_MATCHES = 3;

  function normalize(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }

  function rank(exams, selectedField) {
    return [...exams]
      .map((exam, index) => ({
        exam,
        index,
        fieldMatch: normalize(exam.field) === normalize(selectedField) ? 1 : 0
      }))
      .sort((first, second) => second.fieldMatch - first.fieldMatch || first.index - second.index)
      .slice(0, MAX_MATCHES)
      .map((item) => item.exam);
  }

  /** Exact country/background/field first, then relax the field, then background. */
  function matchExams(exams, selection = {}) {
    const available = Array.isArray(exams) ? exams : [];
    const country = normalize(selection.country);
    const background = normalize(selection.background);
    const field = normalize(selection.field);

    const exact = available.filter((exam) =>
      normalize(exam.country_region) === country
      && normalize(exam.study_background) === background
      && normalize(exam.field) === field
    );
    if (exact.length) {
      return { kind: 'exact', matches: rank(exact, selection.field), country, background, field };
    }

    const sameCountryBackground = available.filter((exam) =>
      normalize(exam.country_region) === country
      && normalize(exam.study_background) === background
    );
    if (sameCountryBackground.length) {
      return { kind: 'background-fallback', matches: rank(sameCountryBackground, selection.field), country, background, field };
    }

    const sameCountry = available.filter((exam) => normalize(exam.country_region) === country);
    if (sameCountry.length) {
      return { kind: 'country-fallback', matches: rank(sameCountry, selection.field), country, background, field };
    }

    return { kind: 'none', matches: [], country, background, field };
  }

  global.ExamMatcher = Object.freeze({ matchExams });
}(window));
