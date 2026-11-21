const filterButtons = document.querySelectorAll('[data-filter]');
const courseList = document.querySelector('#course-list');
const courseStatus = document.querySelector('#course-status');
const FILTER_KEY = 'ajokaista-filter';

if (filterButtons.length > 0 && courseList) {
  const applyFilter = (filter) => {
    for (const button of filterButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }

    const cards = courseList.querySelectorAll('article');
    let visibleCount = 0;

    for (const card of cards) {
      const matches = filter === 'all' || card.dataset.class === filter;
      card.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    }

    if (courseStatus) {
      courseStatus.textContent = `Näytetään ${visibleCount} / ${cards.length} kurssia`;
    }

    localStorage.setItem(FILTER_KEY, filter);
  };

  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filter);
    });
  }

  const savedFilter = localStorage.getItem(FILTER_KEY) || 'all';
  applyFilter(savedFilter);
}
const signupForm = document.querySelector('#signup-form');
const formStatus = document.querySelector('#form-status');
const DRAFT_KEY = 'ajokaista-signup-draft';

if (signupForm) {
  signupForm.noValidate = true;

  const birthdateField = signupForm.querySelector('#birthdate');
  const guardianNameField = signupForm.querySelector('#guardian-name');
  const guardianPhoneField = signupForm.querySelector('#guardian-phone');

  const isUnder18 = (dateString) => {
    if (!dateString) return false;
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age < 18;
  };

  const updateGuardianRequirement = () => {
    const needsGuardian = isUnder18(birthdateField.value);
    guardianNameField.required = needsGuardian;
    guardianPhoneField.required = needsGuardian;
  };

  const showError = (field, message) => {
    const errorEl = document.querySelector(`#${field.id}-error`);
    if (errorEl) {
      errorEl.textContent = message;
    }
    field.setAttribute('aria-invalid', 'true');
  };

  const clearError = (field) => {
    const errorEl = document.querySelector(`#${field.id}-error`);
    if (errorEl) {
      errorEl.textContent = '';
    }
    field.removeAttribute('aria-invalid');
  };

  const messageFor = (field) => {
    const v = field.validity;
    const rawLabel = field.labels[0] ? field.labels[0].textContent : 'Kenttä';
    const label = rawLabel.replace('*', '').trim();

    if (v.valueMissing) {
      return `${label} on pakollinen.`;
    }
    if (v.typeMismatch) {
      return 'Kirjoita toimiva sähköpostiosoite (esim. nimi@esimerkki.fi).';
    }
    if (v.patternMismatch) {
      return 'Käytä vain numeroita, välilyöntejä ja +-merkkiä (7–20 merkkiä).';
    }
    return 'Tarkista kentän arvo.';
  };

  const saveDraft = () => {
    const draft = {};
    for (const field of signupForm.querySelectorAll('input, select, textarea')) {
      if (!field.name) continue;
      draft[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const loadDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      for (const [name, value] of Object.entries(saved)) {
        const field = signupForm.elements[name];
        if (!field) continue;
        if (field.type === 'checkbox') {
          field.checked = Boolean(value);
        } else {
          field.value = value;
        }
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const handleFieldUpdate = (event) => {
    const field = event.target;
    if (field === birthdateField) {
      updateGuardianRequirement();
    }
    if (field.getAttribute('aria-invalid') === 'true' && field.validity.valid) {
      clearError(field);
    }
    saveDraft();
  };

  signupForm.addEventListener('input', handleFieldUpdate);
  signupForm.addEventListener('change', handleFieldUpdate);

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateGuardianRequirement();

    const fields = signupForm.querySelectorAll('input, select, textarea');
    let firstInvalid = null;

    for (const field of fields) {
      if (field.validity.valid) {
        clearError(field);
      } else {
        showError(field, messageFor(field));
        firstInvalid ??= field;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(signupForm));
    const englishNote = data.englishTheory ? ' (englanninkielinen teoriakurssi)' : '';

    if (formStatus) {
      formStatus.textContent = `Kiitos, ${data.name}! Ilmoittautumispyyntösi kurssille ${data.course}${englishNote} on valmis. Vahvistamme paikan vielä puhelimitse numerosta ${data.phone}.`;
    }

    signupForm.reset();
    updateGuardianRequirement();
    localStorage.removeItem(DRAFT_KEY);
  });

  loadDraft();
  updateGuardianRequirement();
}