/* Self-discovery quiz logic for the Resources page. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#career-quiz');
  if (!form) return;

  const questionCount = 6;
  const progress = document.querySelector('#quiz-progress');
  const hint = document.querySelector('#quiz-hint');
  const submit = document.querySelector('#quiz-submit');
  const result = document.querySelector('#quiz-result');
  const resultIntro = document.querySelector('#quiz-result-intro');
  const directions = document.querySelector('#result-directions');
  const reset = document.querySelector('#quiz-reset');

  // These are broad themes to explore, not fixed career types.
  const themes = {
    people: {
      title: 'People-centered paths',
      description: 'Education, community programs, advising, and care-related work are possible places to look. Regulated care roles need formal credentials; check local entry requirements, then try a small task such as tutoring or organizing a peer session.'
    },
    ideas: {
      title: 'Research, communication, and learning',
      description: 'Writing, research, teaching, and communications work may fit this theme. Many roles rely on strong writing, subject knowledge, or further study; draft a short explainer and compare entry-level postings for skills that recur.'
    },
    creative: {
      title: 'Creative and hands-on work',
      description: 'Design, content, product, and other hands-on work are possible directions. Paid creative roles can be competitive and some are contract-based; build one portfolio sample, get specific feedback, and check how local entry-level work is structured.'
    },
    systems: {
      title: 'Planning, analysis, and improving things',
      description: 'Operations, project coordination, logistics, and analysis roles may use this strength. Requirements vary by tool and field; map a process or review a small dataset, then compare three local postings for skills that recur.'
    }
  };

  const selectedAnswers = () => [...form.querySelectorAll('input[type="radio"]:checked')];

  const updateProgress = () => {
    const answered = selectedAnswers().length;
    progress.innerHTML = `${answered} of ${questionCount} answered <span>${answered === questionCount ? 'You’ve answered them all. Whenever you’re ready.' : 'Take your time. There are no wrong answers.'}</span>`;
    submit.disabled = answered !== questionCount;
    hint.textContent = answered === questionCount
      ? 'All set. Your answers are ready when you are.'
      : 'Choose one answer for each question to see your ideas.';
  };

  const makeDirectionCard = (theme) => {
    const card = document.createElement('article');
    card.className = 'result-direction';
    const title = document.createElement('h3');
    title.textContent = theme.title;
    const description = document.createElement('p');
    description.textContent = theme.description;
    card.append(title, description);
    return card;
  };

  form.addEventListener('change', (event) => {
    if (event.target.matches('input[type="radio"]')) updateProgress();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = selectedAnswers();
    if (answers.length !== questionCount) {
      hint.textContent = 'A few questions are still waiting for an answer. Choose what feels closest.';
      return;
    }

    const scores = { people: 0, ideas: 0, creative: 0, systems: 0 };
    answers.forEach((answer) => {
      if (Object.prototype.hasOwnProperty.call(scores, answer.value)) scores[answer.value] += 1;
    });

    const ranked = Object.entries(scores).sort((first, second) => second[1] - first[1]);
    const [firstTheme, secondTheme, thirdTheme] = ranked;
    // Always show two themes; include a third when it was close to the second.
    const suggestedThemes = [firstTheme, secondTheme];
    if (thirdTheme[1] > 0 && thirdTheme[1] >= secondTheme[1] - 1) suggestedThemes.push(thirdTheme);

    directions.replaceChildren(...suggestedThemes.map(([key]) => makeDirectionCard(themes[key])));
    resultIntro.textContent = 'This six-question exercise reflects the answer themes you selected; it is not a validated aptitude assessment and cannot predict fit or job prospects. Treat these directions as prompts: try a small task in one area, then check its training, cost, and entry requirements before making a commitment.';
    result.hidden = false;
    result.querySelector('#quiz-result-title').focus();
  });

  reset.addEventListener('click', () => {
    form.reset();
    result.hidden = true;
    updateProgress();
    form.querySelector('fieldset')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.querySelector('input[type="radio"]')?.focus({ preventScroll: true });
  });

  updateProgress();
});
