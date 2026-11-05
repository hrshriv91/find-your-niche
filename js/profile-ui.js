/* Page-specific form handling and profile card rendering. Matching stays in match.js. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#profile-match-form');
  if (!form) return;

  const resultSection = document.querySelector('#match-results');
  const resultTitle = document.querySelector('#match-results-title');
  const resultMessage = document.querySelector('#match-message');
  const profileGrid = document.querySelector('#profile-match-grid');
  const fieldNames = ['Tech', 'Sports', 'Business', 'Arts', 'Science'];
  const tagLabels = {
    failed_exam: 'Failed an important exam',
    late_start: 'Felt behind compared to peers',
    rejected_often: 'Faced a lot of rejection',
    career_pivot: 'Changed direction later in life',
    first_gen: 'First in my family to navigate this alone'
  };

  // Load the local JSON now; the form waits for it if someone submits quickly.
  const profilesReady = fetch('../data/profiles.json').then((response) => {
    if (!response.ok) throw new Error('Profile data could not be loaded.');
    return response.json();
  });

  const getMessage = (result, hasField, hasTags) => {
    const fieldName = fieldNames.find((name) => name.toLowerCase() === result.field) || 'that field';
    if (result.kind === 'field-fallback') {
      return `We don’t have an exact match for that combination yet. Here are people in ${fieldName} who faced something close to what you’re feeling.`;
    }
    if (result.kind === 'tag-fallback') {
      return 'We don’t have an exact match for all of those experiences yet. Here are the closest stories we have so far.';
    }
    if (result.kind === 'none') {
      return 'We don’t have a close match in these placeholder stories yet. Try another experience or choose a field to see related paths.';
    }
    if (!hasField && !hasTags) return 'Here are a few placeholder profiles to begin with. You can narrow your search whenever you like.';
    if (hasField && hasTags) return `Here are placeholder profiles in ${fieldName} that share all the experiences you selected.`;
    if (hasField) return `Here are a few placeholder profiles from ${fieldName}.`;
    return 'Here are placeholder profiles that share the experiences you selected.';
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const createProfileCard = (profile, selectedTags) => {
    const card = createElement('article', 'profile-match-card');
    const header = createElement('div', 'profile-match-header');
    const avatar = createElement('span', 'profile-placeholder', profile.image_placeholder?.initials || '…');
    const color = profile.image_placeholder?.color;
    avatar.style.backgroundColor = /^#[\da-f]{6}$/i.test(color || '') ? color : '#dfece8';
    avatar.setAttribute('aria-hidden', 'true');

    const identity = createElement('div', 'profile-identity');
    identity.append(
      createElement('h3', '', profile.name || 'Profile placeholder'),
      createElement('p', '', profile.field || 'Field placeholder')
    );
    header.append(avatar, identity);

    const summary = createElement('p', 'profile-summary', profile.summary || 'Placeholder summary to be added.');
    const sharedTags = (profile.struggle_tags || []).filter((tag) => selectedTags.includes(tag));
    const tags = createElement('ul', 'profile-tags');
    const tagsToShow = sharedTags.length ? sharedTags : (profile.struggle_tags || []);
    tagsToShow.forEach((tag) => {
      if (tagLabels[tag]) tags.append(createElement('li', '', tagLabels[tag]));
    });

    card.append(header, summary);
    if (tags.childElementCount) card.append(tags);
    return card;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const field = form.elements.field.value;
    const struggleTags = [...form.querySelectorAll('input[name="struggles"]:checked')].map((input) => input.value);
    resultSection.hidden = false;
    resultTitle.textContent = 'Finding a few familiar paths…';
    resultMessage.textContent = '';
    profileGrid.replaceChildren();

    try {
      const profiles = await profilesReady;
      const result = window.ProfileMatcher.matchProfiles(profiles, { field, struggleTags });
      resultTitle.textContent = result.matches.length === 1 ? 'One possible match' : 'Your possible matches';
      resultMessage.textContent = getMessage(result, Boolean(field), struggleTags.length > 0);
      profileGrid.replaceChildren(...result.matches.map((profile) => createProfileCard(profile, struggleTags)));
    } catch (error) {
      resultTitle.textContent = 'We couldn’t load the stories yet.';
      resultMessage.textContent = 'Try opening the project through a local web server so this page can read its profiles.json file.';
    }

    // Restart the short entrance animation whenever a new set of results appears.
    resultSection.classList.remove('is-entering');
    void resultSection.offsetWidth;
    resultSection.classList.add('is-entering');
    window.setTimeout(() => resultSection.classList.remove('is-entering'), 700);
    resultTitle.focus();
  });
});
