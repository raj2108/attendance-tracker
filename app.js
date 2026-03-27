const STORAGE_KEY = 'smart-attendance-tracker-v1';

const state = {
  subjects: [],
  alerts: [],
  settings: {
    defaultThreshold: 75,
    notificationsEnabled: false,
    dailyReminderEnabled: false,
    reminderTime: '21:00',
  },
  selectedSubjectId: null,
  reminderTimer: null,
};

const el = {
  dashboard: document.getElementById('dashboard'),
  onboarding: document.getElementById('onboarding'),
  subjectDetail: document.getElementById('subjectDetail'),
  settings: document.getElementById('settings'),
  alerts: document.getElementById('alerts'),
  subjectDialog: document.getElementById('subjectDialog'),
  subjectForm: document.getElementById('subjectForm'),
  settingsForm: document.getElementById('settingsForm'),
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nowISODate() {
  return new Date().toISOString().split('T')[0];
}

function attendancePct(subject) {
  if (subject.classes_total <= 0) return 0;
  return (subject.classes_attended / subject.classes_total) * 100;
}

function safeBunks(subject) {
  const ratio = subject.attendance_threshold / 100;
  const pct = attendancePct(subject);
  if (pct < subject.attendance_threshold || ratio <= 0) return 0;
  const result = Math.floor(subject.classes_attended / ratio - subject.classes_total);
  return Math.max(0, result);
}

function classesNeededForRecovery(subject) {
  const ratio = subject.attendance_threshold / 100;
  const pct = attendancePct(subject);
  if (pct >= subject.attendance_threshold || ratio >= 1) return 0;
  const remaining = Math.ceil((ratio * subject.classes_total - subject.classes_attended) / (1 - ratio));
  return Math.max(0, remaining);
}

function riskBand(subject) {
  const pct = attendancePct(subject);
  if (pct > 75) return 'ok';
  if (pct >= 70) return 'warn';
  return 'risk';
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.subjects)) state.subjects = parsed.subjects;
    if (parsed.settings) state.settings = { ...state.settings, ...parsed.settings };
    if (Array.isArray(parsed.alerts)) state.alerts = parsed.alerts.slice(0, 100);
  } catch (error) {
    console.error('Could not load app state', error);
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      subjects: state.subjects,
      settings: state.settings,
      alerts: state.alerts.slice(0, 100),
    }),
  );
}

function pushAlert(message, level = 'warn') {
  const stamped = `${new Date().toLocaleString()} — ${message}`;
  if (state.alerts[0] === stamped) return;
  state.alerts.unshift(stamped);
  state.alerts = state.alerts.slice(0, 100);

  if (state.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Attendance Alert', { body: message });
  }

  renderAlerts();
  persistState();
}

function evaluateAlerts(subject) {
  const pct = attendancePct(subject);
  const sb = safeBunks(subject);
  const needed = classesNeededForRecovery(subject);

  if (pct < 75) pushAlert(`Warning: ${subject.subject_name} attendance below threshold (${pct.toFixed(1)}%).`, 'risk');
  if (pct < 80) pushAlert(`${subject.subject_name} attendance is below 80%. Plan attendance carefully.`);
  if (pct < 85) pushAlert(`${subject.subject_name} attendance is below 85%.`);
  if (sb === 1 && pct >= subject.attendance_threshold) pushAlert(`Only 1 safe bunk left in ${subject.subject_name}.`, 'risk');
  if (needed > 0) pushAlert(`Attend next ${needed} ${subject.subject_name} classes to recover to ${subject.attendance_threshold}%.`, 'risk');
}

function renderDashboard() {
  el.dashboard.innerHTML = '<h2>Attendance Dashboard</h2>';

  if (state.subjects.length === 0) {
    el.onboarding.classList.remove('hidden');
    return;
  }

  el.onboarding.classList.add('hidden');

  state.subjects.forEach((subject) => {
    const pct = attendancePct(subject);
    const sb = safeBunks(subject);
    const needed = classesNeededForRecovery(subject);

    const card = document.createElement('article');
    card.className = `subject-card ${riskBand(subject)}`;
    card.innerHTML = `
      <h3>${subject.subject_name}</h3>
      <div class="subject-meta">${subject.subject_type.toUpperCase()} • Updated ${subject.last_updated_date}</div>
      <p><strong>${pct.toFixed(1)}%</strong> attendance (${subject.classes_attended}/${subject.classes_total})</p>
      <p>${pct >= subject.attendance_threshold ? `Safe bunks left: ${sb}` : `Recovery needed: attend next ${needed} classes`}</p>
      <div class="subject-actions">
        <button data-action="present" data-id="${subject.id}">Present</button>
        <button data-action="absent" data-id="${subject.id}">Absent</button>
        <button data-action="cancelled" data-id="${subject.id}">Cancelled</button>
        <button data-action="details" data-id="${subject.id}">Details</button>
        <button data-action="edit" data-id="${subject.id}">Edit</button>
      </div>
    `;
    el.dashboard.appendChild(card);
  });
}

function renderDetails() {
  if (!state.selectedSubjectId) {
    el.subjectDetail.classList.add('hidden');
    return;
  }

  const subject = state.subjects.find((item) => item.id === state.selectedSubjectId);
  if (!subject) {
    el.subjectDetail.classList.add('hidden');
    return;
  }

  const pct = attendancePct(subject);
  const sb = safeBunks(subject);
  const needed = classesNeededForRecovery(subject);

  el.subjectDetail.innerHTML = `
    <h2>${subject.subject_name} Details</h2>
    <p>Threshold: ${subject.attendance_threshold}%</p>
    <p>Current attendance: <strong>${pct.toFixed(2)}%</strong></p>
    <p>Safe bunks remaining: ${sb}</p>
    <p>Classes needed for recovery: ${needed}</p>
    <p>Suggestion: ${needed > 0 ? `Attend next ${needed} consecutive classes.` : 'You are safe for now. Keep consistency.'}</p>
  `;
  el.subjectDetail.classList.remove('hidden');
}

function renderAlerts() {
  el.alerts.innerHTML = '';
  if (state.alerts.length === 0) {
    el.alerts.innerHTML = '<li>No alerts yet.</li>';
    return;
  }

  state.alerts.slice(0, 20).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    el.alerts.appendChild(li);
  });
}

function renderSettings() {
  document.getElementById('defaultThreshold').value = state.settings.defaultThreshold;
  document.getElementById('notificationsEnabled').checked = state.settings.notificationsEnabled;
  document.getElementById('dailyReminderEnabled').checked = state.settings.dailyReminderEnabled;
  document.getElementById('reminderTime').value = state.settings.reminderTime;
}

function render() {
  renderDashboard();
  renderDetails();
  renderAlerts();
  renderSettings();
}

function openSubjectDialog(subject = null) {
  document.getElementById('subjectId').value = subject?.id ?? '';
  document.getElementById('subjectName').value = subject?.subject_name ?? '';
  document.getElementById('classesAttended').value = subject?.classes_attended ?? 0;
  document.getElementById('classesTotal').value = subject?.classes_total ?? 0;
  document.getElementById('attendanceThreshold').value = subject?.attendance_threshold ?? state.settings.defaultThreshold;
  document.getElementById('subjectType').value = subject?.subject_type ?? 'theory';
  el.subjectDialog.showModal();
}

function upsertSubject(formData) {
  const id = formData.get('subjectId') || uid();
  const subject = {
    id,
    subject_name: String(formData.get('subjectName')).trim(),
    classes_attended: Number(formData.get('classesAttended')),
    classes_total: Number(formData.get('classesTotal')),
    attendance_threshold: Number(formData.get('attendanceThreshold')),
    subject_type: String(formData.get('subjectType')),
    last_updated_date: nowISODate(),
  };

  if (!subject.subject_name || subject.classes_attended > subject.classes_total) {
    alert('Please enter valid data (attended cannot exceed total).');
    return;
  }

  const existingIndex = state.subjects.findIndex((item) => item.id === id);
  if (existingIndex >= 0) state.subjects[existingIndex] = subject;
  else state.subjects.push(subject);

  evaluateAlerts(subject);
  persistState();
  render();
}

function markAttendance(id, status) {
  const subject = state.subjects.find((item) => item.id === id);
  if (!subject) return;

  if (status === 'present') {
    subject.classes_attended += 1;
    subject.classes_total += 1;
  }
  if (status === 'absent') {
    subject.classes_total += 1;
  }
  subject.last_updated_date = nowISODate();
  evaluateAlerts(subject);
  persistState();
  render();
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    state.settings.notificationsEnabled = false;
    pushAlert('Notification permission denied. Browser notifications disabled.');
  }
}

function setupDailyReminder() {
  if (state.reminderTimer) clearTimeout(state.reminderTimer);
  if (!state.settings.dailyReminderEnabled) return;

  const [hours, minutes] = state.settings.reminderTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours || 21, minutes || 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();
  state.reminderTimer = setTimeout(() => {
    pushAlert('Reminder: Update today’s attendance.');
    setupDailyReminder();
  }, delay);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.error('SW registration failed', error));
  }
}

function bindEvents() {
  document.getElementById('addSubjectBtn').addEventListener('click', () => openSubjectDialog());
  document.getElementById('onboardingAddBtn').addEventListener('click', () => openSubjectDialog());
  document.getElementById('cancelDialog').addEventListener('click', () => el.subjectDialog.close());

  el.subjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(el.subjectForm);
    upsertSubject(formData);
    el.subjectDialog.close();
  });

  el.dashboard.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;
    if (action === 'details') {
      state.selectedSubjectId = id;
      render();
      return;
    }
    if (action === 'edit') {
      openSubjectDialog(state.subjects.find((item) => item.id === id));
      return;
    }
    markAttendance(id, action);
  });

  document.querySelectorAll('.bottom-nav button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const view = button.dataset.view;
      el.dashboard.classList.toggle('hidden', view !== 'dashboard');
      el.subjectDetail.classList.toggle('hidden', view !== 'dashboard' || !state.selectedSubjectId);
      el.settings.classList.toggle('hidden', view !== 'settings');
    });
  });

  el.settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.settings.defaultThreshold = Number(document.getElementById('defaultThreshold').value);
    state.settings.notificationsEnabled = document.getElementById('notificationsEnabled').checked;
    state.settings.dailyReminderEnabled = document.getElementById('dailyReminderEnabled').checked;
    state.settings.reminderTime = document.getElementById('reminderTime').value || '21:00';

    if (state.settings.notificationsEnabled) {
      await requestNotificationPermission();
    }

    setupDailyReminder();
    persistState();
    pushAlert('Settings updated successfully.');
    render();
  });
}

function init() {
  loadState();
  bindEvents();
  setupDailyReminder();
  registerServiceWorker();
  render();
}

init();
