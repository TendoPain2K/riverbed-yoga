'use strict';

// Two arrays organize recommendations and validation rules.
const classOptions = [
  { id: 'gentle', name: 'Gentle Yoga', description: 'Slow movement and adaptable poses for beginners and older adults.' },
  { id: 'vinyasa', name: 'Vinyasa Yoga', description: 'Flowing movement linked with breath for students who enjoy an active practice.' },
  { id: 'restorative', name: 'Restorative Yoga', description: 'Supported resting poses for relaxation and a slower pace.' }
];
const formFields = [
  { id: 'name', label: 'your name', min: 2, max: 80 },
  { id: 'email', label: 'your email', email: true },
  { id: 'contact-method', label: 'a contact method', choices: ['email', 'in-person'] },
  { id: 'interest', label: 'a class or workshop', choices: ['gentle', 'vinyasa', 'restorative', 'private', 'basics', 'breathing', 'restorative-workshop'] },
  { id: 'experience', label: 'your experience level', choices: ['new', 'beginner', 'intermediate', 'experienced'] },
  { id: 'message', label: 'a message', min: 10, max: 1000 }
];
const storageKey = 'riverbendPreferredClass';
let validationStarted = false;
const byId = id => document.getElementById(id);

function getClass(id) {
  return classOptions.find(option => option.id === id);
}
function updateClassDetails() {
  const selected = getClass(byId('preferred-class').value);
  if (selected) byId('class-details').textContent = `${selected.name}: ${selected.description}`;
}
function savePreference() {
  const selected = getClass(byId('preferred-class').value);
  if (!selected) return;
  byId('interest').value = selected.id;
  if (validationStarted) validateField(formFields.find(field => field.id === 'interest'));
  updateClassDetails();
  try {
    localStorage.setItem(storageKey, selected.id);
    byId('preference-status').textContent = `${selected.name} saved. Your request form now uses this class.`;
  } catch (error) {
    byId('preference-status').textContent = 'Your form uses this class, but this browser could not save it for a return visit.';
  }
}
function loadPreference() {
  try {
    const selected = getClass(localStorage.getItem(storageKey));
    if (selected) {
      byId('preferred-class').value = selected.id;
      byId('interest').value = selected.id;
      byId('preference-status').textContent = `Welcome back! Your saved ${selected.name} preference has been restored.`;
    }
  } catch (error) {
    byId('preference-status').textContent = 'Browser storage is unavailable. You can still choose a class and use the form.';
  }
  updateClassDetails();
}
function clearPreference() {
  try {
    localStorage.removeItem(storageKey);
    byId('preference-status').textContent = 'Saved preference cleared. Your current form entries are unchanged.';
  } catch (error) {
    byId('preference-status').textContent = 'This browser could not clear the saved preference.';
  }
}
function getFieldError(field, rawValue) {
  const value = rawValue.trim();
  if (!value) return `Please enter or choose ${field.label}.`;
  if (field.choices && !field.choices.includes(value)) return `Please choose ${field.label} from the list.`;
  if (field.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address, such as name@example.com.';
  if (field.min && value.length < field.min) return `Please enter at least ${field.min} characters for ${field.label}.`;
  if (field.max && value.length > field.max) return `Please use no more than ${field.max} characters for ${field.label}.`;
  return '';
}
function validateField(field) {
  const control = byId(field.id);
  const error = getFieldError(field, control.value);
  byId(`${field.id}-error`).textContent = error;
  control.setAttribute('aria-invalid', error ? 'true' : 'false');
  return !error;
}
function validateForm() {
  // Validate every field so all relevant messages appear together.
  const invalidFields = formFields.filter(field => !validateField(field));
  return invalidFields;
}
function handleSubmit(event) {
  // This teaching site has no server to receive a booking request.
  event.preventDefault();
  validationStarted = true;
  const invalidFields = validateForm();
  if (invalidFields.length) {
    byId('form-status').textContent = 'Please correct the fields shown below. Your entries have been kept.';
    byId(invalidFields[0].id).focus();
  } else {
    byId('form-status').textContent = 'Your details passed validation. This practice form does not send a request or reserve a place.';
  }
}
function initialize() {
  byId('preferred-class').addEventListener('change', () => {
    updateClassDetails();
    byId('preference-status').textContent = 'Class preview updated. Choose Save preference to remember this choice.';
  });
  byId('save-preference').addEventListener('click', savePreference);
  byId('clear-preference').addEventListener('click', clearPreference);
  byId('request-form').addEventListener('submit', handleSubmit);
  formFields.forEach(field => {
    const control = byId(field.id);
    control.addEventListener('input', () => {
      if (validationStarted) {
        validateField(field);
        byId('form-status').textContent = 'Entries updated. Select Request a spot to check the form again.';
      }
    });
    control.addEventListener('change', () => {
      if (validationStarted) validateField(field);
    });
  });
  // Keep native HTML validation as fallback when JavaScript is disabled.
  byId('request-form').noValidate = true;
  loadPreference();
}
initialize();
