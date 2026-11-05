/* Three-step selector and results renderer for the Exam Explorer page. */
document.addEventListener('DOMContentLoaded', () => {
  const explorer = document.querySelector('#exam-explorer');
  if (!explorer) return;

  const progressLabel = document.querySelector('#exam-progress-label');
  const progressSteps = [...document.querySelectorAll('[data-progress-step]')];
  const stepPanels = [...document.querySelectorAll('[data-step-panel]')];
  const stepHint = document.querySelector('#exam-step-hint');
  const backButton = document.querySelector('#exam-back');
  const backgroundChoices = document.querySelector('#exam-background-choices');
  const fieldChoices = document.querySelector('#exam-field-choices');
  const results = document.querySelector('#exam-results');
  const resultTitle = document.querySelector('#exam-results-title');
  const resultNote = document.querySelector('#exam-results-note');
  const pathwayBackground = document.querySelector('#pathway-background');
  const pathwayExams = document.querySelector('#pathway-exams');
  const pathwayField = document.querySelector('#pathway-field');
  const resultGrid = document.querySelector('#exam-result-grid');
  const editButton = document.querySelector('#exam-edit');
  const selection = { country: '', background: '', field: '' };
  let activeStep = 'country';

  const countries = [
    { name: 'India', note: 'School-leaver and graduate exam examples' },
    { name: 'USA', note: 'Undergraduate admission test examples' },
    { name: 'UK', note: 'Qualification and admissions-test examples' },
    { name: 'Canada', note: 'Starter examples coming soon' },
    { name: 'UAE/Gulf', note: 'Starter examples coming soon' },
    { name: 'Australia', note: 'Starter examples coming soon' }
  ];

  const backgroundsByCountry = {
    India: ['After Class 10', 'After Class 12 - Science', 'After Class 12 - Commerce', 'After Class 12 - Arts', 'After Class 12 - Any stream', 'After Bachelor\'s'],
    USA: ['In High School (or equivalent)', 'After High School (or equivalent)', 'After Bachelor\'s'],
    UK: ['After GCSEs', 'After A-Levels / equivalent', 'After Bachelor\'s'],
    'Canada': ['In Secondary School (or equivalent)', 'After Secondary School (or equivalent)', 'After Bachelor\'s'],
    'UAE/Gulf': ['In Secondary School (or equivalent)', 'After Secondary School (or equivalent)', 'After Bachelor\'s'],
    Australia: ['In Secondary School (or equivalent)', 'After Secondary School (or equivalent)', 'After Bachelor\'s']
  };

  const fields = [
    'Engineering', 'Medical', 'Management', 'Law', 'Civil Services', 'Design',
    'General Undergraduate Admissions', 'Study Abroad/Undergrad', 'Study Abroad/Grad'
  ];

  const examsReady = fetch('../data/exams.json').then((response) => {
    if (!response.ok) throw new Error('Exam examples could not be loaded.');
    return response.json();
  });

  const createChoice = (group, value, note = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'exam-choice';
    button.dataset.choiceGroup = group;
    button.dataset.choiceValue = value;
    button.setAttribute('aria-pressed', 'false');

    const title = document.createElement('span');
    title.className = 'exam-choice-title';
    title.textContent = value;
    button.append(title);

    if (note) {
      const description = document.createElement('span');
      description.className = 'exam-choice-note';
      description.textContent = note;
      button.append(description);
    }
    return button;
  };

  const renderChoices = (container, group, values) => {
    container.replaceChildren(...values.map((value) => createChoice(group, value.name || value, value.note || '')));
  };

  const setStep = (step) => {
    activeStep = step;
    const stepOrder = ['country', 'background', 'field'];
    const activeIndex = stepOrder.indexOf(step);
    stepPanels.forEach((panel) => { panel.hidden = panel.dataset.stepPanel !== step; });
    progressSteps.forEach((item, index) => {
      item.classList.toggle('is-current', index === activeIndex);
      item.classList.toggle('is-complete', index < activeIndex || step === 'results');
      if (index === activeIndex) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    progressLabel.textContent = step === 'results' ? 'Your route is ready' : `Step ${activeIndex + 1} of 3 · ${['Country or region', 'Study background', 'Area of interest'][activeIndex]}`;
    backButton.hidden = activeIndex < 1 || step === 'results';
    stepHint.textContent = step === 'country'
      ? 'Choose the place you’re considering. You can explore a region even if examples are still being added.'
      : step === 'background'
        ? 'Pick the stage that feels closest to where you are now.'
        : step === 'field'
          ? 'Choose one area to see a few relevant starting points.'
          : '';
  };

  const syncPressedChoices = () => {
    explorer.querySelectorAll('.exam-choice').forEach((button) => {
      const isSelected = selection[button.dataset.choiceGroup] === button.dataset.choiceValue;
      button.setAttribute('aria-pressed', String(isSelected));
    });
  };

  const createExamCard = (exam) => {
    const card = document.createElement('article');
    card.className = 'exam-result-card';

    const top = document.createElement('div');
    top.className = 'exam-result-card-top';
    const name = document.createElement('h3');
    name.textContent = exam.name;
    const location = document.createElement('span');
    location.className = 'exam-result-region';
    location.textContent = exam.country_region;
    top.append(name, location);

    const description = document.createElement('p');
    description.className = 'exam-result-description';
    description.textContent = exam.short_description;

    const difficulty = document.createElement('p');
    difficulty.className = 'exam-difficulty';
    const difficultyLabel = document.createElement('span');
    difficultyLabel.textContent = 'Difficulty note';
    const difficultyText = document.createElement('strong');
    difficultyText.textContent = exam.difficulty_note;
    difficulty.append(difficultyLabel, difficultyText);

    const details = document.createElement('details');
    details.className = 'exam-prep-details';
    const summary = document.createElement('summary');
    summary.textContent = 'What prep usually looks like';
    const prep = document.createElement('p');
    prep.textContent = exam.prep_note;
    details.append(summary, prep);

    const source = document.createElement('a');
    source.className = 'exam-source-link';
    source.href = exam.source_url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = `${exam.source_label} ↗`;

    const exampleNote = document.createElement('p');
    exampleNote.className = 'exam-example-note';
    exampleNote.textContent = exam.example_status;

    card.append(top, description, difficulty, details, source, exampleNote);
    return card;
  };

  const resultMessage = (result) => {
    if (result.kind === 'exact') {
      return 'These examples match your selections. They’re starting points, not a complete eligibility guide—confirm current details with the official source and your target institution.';
    }
    if (result.kind === 'background-fallback') {
      return `We don’t have an example for that exact area yet. Here are options in ${selection.country} for a similar study stage that may be useful to explore.`;
    }
    if (result.kind === 'country-fallback') {
      return `We don’t have an example for that exact combination yet. Here are a few ${selection.country} examples from other study stages; check each official source to see what fits your route.`;
    }
    return `We haven’t added example exams for ${selection.country} yet. The list is a starter set, and more regions and fields can be added over time.`;
  };

  const showResults = async () => {
    setStep('results');
    results.hidden = false;
    resultTitle.textContent = 'Finding a few starting points…';
    resultNote.textContent = '';
    resultGrid.replaceChildren();
    pathwayBackground.textContent = selection.background;
    pathwayField.textContent = selection.field;
    pathwayExams.textContent = 'Looking for examples…';

    try {
      const exams = await examsReady;
      const result = window.ExamMatcher.matchExams(exams, selection);
      resultTitle.textContent = result.matches.length
        ? `${result.matches.length === 1 ? 'One' : 'A few'} route${result.matches.length === 1 ? '' : 's'} to explore`
        : 'A useful next step can still be small';
      resultNote.textContent = resultMessage(result);
      pathwayExams.textContent = result.matches.length
        ? result.matches.map((exam) => exam.name).join(' · ')
        : 'No starter example yet';
      resultGrid.replaceChildren(...result.matches.map(createExamCard));
    } catch (error) {
      resultTitle.textContent = 'The example list didn’t load.';
      resultNote.textContent = 'Open the project through a local web server so this page can read data/exams.json, then try again.';
      pathwayExams.textContent = 'Example list unavailable';
    }

    results.classList.remove('is-entering');
    void results.offsetWidth;
    results.classList.add('is-entering');
    window.setTimeout(() => results.classList.remove('is-entering'), 900);
    resultTitle.focus();
  };

  renderChoices(explorer.querySelector('[data-step-panel="country"] .exam-choice-grid'), 'country', countries);
  renderChoices(backgroundChoices, 'background', backgroundsByCountry.India);
  renderChoices(fieldChoices, 'field', fields);

  explorer.addEventListener('click', (event) => {
    const choice = event.target.closest('.exam-choice');
    if (!choice) return;
    const { choiceGroup, choiceValue } = choice.dataset;
    selection[choiceGroup] = choiceValue;
    syncPressedChoices();

    if (choiceGroup === 'country') {
      selection.background = '';
      selection.field = '';
      renderChoices(backgroundChoices, 'background', backgroundsByCountry[choiceValue] || []);
      setStep('background');
      backgroundChoices.querySelector('.exam-choice')?.focus();
    } else if (choiceGroup === 'background') {
      selection.field = '';
      setStep('field');
      fieldChoices.querySelector('.exam-choice')?.focus();
    } else if (choiceGroup === 'field') {
      showResults();
    }
  });

  backButton.addEventListener('click', () => {
    if (activeStep === 'field') {
      setStep('background');
      backgroundChoices.querySelector(`[data-choice-value="${CSS.escape(selection.background)}"]`)?.focus();
    } else if (activeStep === 'background') {
      setStep('country');
      explorer.querySelector(`[data-choice-value="${CSS.escape(selection.country)}"]`)?.focus();
    }
  });

  editButton.addEventListener('click', () => {
    results.hidden = true;
    setStep('country');
    explorer.querySelector(`[data-choice-value="${CSS.escape(selection.country)}"]`)?.focus();
  });

  setStep('country');
});
