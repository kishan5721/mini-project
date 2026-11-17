/**
 * STUDENT TASK & STUDY PLANNER - JAVASCRIPT CONTROLLER
 * College B.Tech Mini Project
 * 
 * Features:
 * - Single Page Navigation
 * - LocalStorage CRUD operations
 * - Live Search, Filters & Sorting
 * - Statistical Analytics & Progress Tracking
 * - Dark / Light Theme Switching
 * - Custom Modal & Toast System
 * - Real-time Form Validation
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'studyPlanner_tasks_v1';
  const THEME_KEY = 'studyPlanner_theme';

  // --- Initial Demo Tasks for First-time College Users ---
  const DEMO_TASKS = [
    {
      id: 'demo-task-1',
      title: 'Data Structures Lab: Implement AVL Tree Rotations',
      subject: 'Data Structures & Algorithms',
      priority: 'High',
      deadline: getOffsetDateString(1), // Tomorrow
      estimatedHours: 3.0,
      description: 'Implement left-left, right-right and double rotations in C++. Write test cases verifying balance factors.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'demo-task-2',
      title: 'Operating Systems Seminar: Virtual Memory & Paging Slides',
      subject: 'Operating Systems',
      priority: 'Medium',
      deadline: getOffsetDateString(3), // In 3 days
      estimatedHours: 2.5,
      description: 'Prepare 10 presentation slides covering FIFO, LRU, and Optimal page replacement algorithms with diagrams.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'demo-task-3',
      title: 'Engineering Mathematics: Runge-Kutta 4th Order Problems',
      subject: 'Mathematics',
      priority: 'High',
      deadline: getOffsetDateString(0), // Today
      estimatedHours: 2.0,
      description: 'Solve tutorial exercise problems 4 through 9 before the evening tutorial session.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'demo-task-4',
      title: 'Database Systems: SQL Schema & Normalization Queries',
      subject: 'Database Systems',
      priority: 'Low',
      deadline: getOffsetDateString(-1), // Yesterday (Completed)
      estimatedHours: 1.5,
      description: 'Design 3NF schema for university course registration and verify foreign key constraints.',
      status: 'Completed',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];

  const STUDY_TIPS = [
    "Use the Pomodoro Technique: 25 minutes of deep focus followed by a 5-minute break.",
    "Tackle high-priority and difficult topics early in the morning when mental energy is highest.",
    "Teach what you learned to a classmate — Feynman Technique is the fastest way to master concepts.",
    "Keep study sessions consistent rather than cramming 10 hours before exam night.",
    "Review your solved questions 24 hours later to lock them into long-term memory."
  ];

  // --- State Variables ---
  let tasks = [];
  let currentFilterStatus = 'ALL';
  let activeSearchTerm = '';
  let activeSubjectFilter = 'ALL';
  let activePriorityFilter = 'ALL';
  let activeSortOption = 'deadline-asc';
  let taskToDeleteId = null;

  // --- Helper: Get YYYY-MM-DD date offset by N days ---
  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- DOM Elements Cache ---
  const elements = {
    // Nav & Sidebar
    navLinks: document.querySelectorAll('.nav-link, [data-section]'),
    pageSections: document.querySelectorAll('.page-section'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Top Header
    greetingText: document.getElementById('greetingText'),
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    headerQuickAddBtn: document.getElementById('headerQuickAddBtn'),

    // Dashboard
    dashTotalTasks: document.getElementById('dashTotalTasks'),
    dashPendingTasks: document.getElementById('dashPendingTasks'),
    dashCompletedTasks: document.getElementById('dashCompletedTasks'),
    dashCompletionRate: document.getElementById('dashCompletionRate'),
    dashProgressBar: document.getElementById('dashProgressBar'),
    progressRingCircle: document.getElementById('progressRingCircle'),
    progressRingPercent: document.getElementById('progressRingPercent'),
    dashHighCount: document.getElementById('dashHighCount'),
    dashMedCount: document.getElementById('dashMedCount'),
    dashLowCount: document.getElementById('dashLowCount'),
    dailyTipText: document.getElementById('dailyTipText'),
    urgentTasksList: document.getElementById('urgentTasksList'),
    recentTasksList: document.getElementById('recentTasksList'),

    // Sidebar counts
    sidebarPendingCount: document.getElementById('sidebarPendingCount'),
    sidebarCompletedCount: document.getElementById('sidebarCompletedCount'),

    // My Tasks
    taskSearchInput: document.getElementById('taskSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterSubject: document.getElementById('filterSubject'),
    filterPriority: document.getElementById('filterPriority'),
    sortBy: document.getElementById('sortBy'),
    statusTabs: document.querySelectorAll('.status-tab'),
    countFilterAll: document.getElementById('countFilterAll'),
    countFilterPending: document.getElementById('countFilterPending'),
    countFilterCompleted: document.getElementById('countFilterCompleted'),
    activeFiltersRow: document.getElementById('activeFiltersRow'),
    activeFilterTags: document.getElementById('activeFilterTags'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    allTasksGrid: document.getElementById('allTasksGrid'),
    emptyStateContainer: document.getElementById('emptyStateContainer'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateMessage: document.getElementById('emptyStateMessage'),

    // Add Task Form
    addTaskForm: document.getElementById('addTaskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskSubject: document.getElementById('taskSubject'),
    taskDeadline: document.getElementById('taskDeadline'),
    taskEstimatedHours: document.getElementById('taskEstimatedHours'),
    taskDescription: document.getElementById('taskDescription'),
    titleError: document.getElementById('titleError'),
    subjectError: document.getElementById('subjectError'),
    deadlineError: document.getElementById('deadlineError'),
    resetTaskFormBtn: document.getElementById('resetTaskFormBtn'),

    // Completed Section
    completedTasksGrid: document.getElementById('completedTasksGrid'),
    completedTotalBadge: document.getElementById('completedTotalBadge'),
    emptyCompletedState: document.getElementById('emptyCompletedState'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),

    // About Section
    resetDemoTasksBtn: document.getElementById('resetDemoTasksBtn'),
    wipeAllDataBtn: document.getElementById('wipeAllDataBtn'),

    // Edit Modal
    editModalBackdrop: document.getElementById('editModalBackdrop'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskId: document.getElementById('editTaskId'),
    editTaskTitle: document.getElementById('editTaskTitle'),
    editTaskSubject: document.getElementById('editTaskSubject'),
    editTaskPriority: document.getElementById('editTaskPriority'),
    editTaskDeadline: document.getElementById('editTaskDeadline'),
    editTaskStatus: document.getElementById('editTaskStatus'),
    editTaskDescription: document.getElementById('editTaskDescription'),
    editTitleError: document.getElementById('editTitleError'),
    editDeadlineError: document.getElementById('editDeadlineError'),
    closeEditModalBtn: document.getElementById('closeEditModalBtn'),
    cancelEditModalBtn: document.getElementById('cancelEditModalBtn'),

    // Delete Modal
    deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
    deleteTaskTitleDisplay: document.getElementById('deleteTaskTitleDisplay'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
    cancelDeleteModalBtn: document.getElementById('cancelDeleteModalBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Initialization ---
  function init() {
    initTheme();
    initDateAndGreeting();
    initDefaultMinDeadline();
    initRandomStudyTip();
    loadTasks();
    setupEventListeners();
    updateUI();
  }

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    showToast(`Switched to ${next} mode`, 'info');
  }

  // --- Greeting & Current Date ---
  function initDateAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Welcome Back! 👋';

    if (hours >= 5 && hours < 12) {
      greeting = 'Good Morning, Scholar! ☀️';
    } else if (hours >= 12 && hours < 17) {
      greeting = 'Good Afternoon, Scholar! 🌤️';
    } else if (hours >= 17 && hours < 22) {
      greeting = 'Good Evening, Scholar! 🌙';
    } else {
      greeting = 'Burning the Midnight Oil! 🦉';
    }

    if (elements.greetingText) {
      elements.greetingText.textContent = greeting;
    }

    if (elements.currentDateDisplay) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      elements.currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  function initDefaultMinDeadline() {
    const todayStr = getOffsetDateString(0);
    if (elements.taskDeadline) {
      elements.taskDeadline.value = todayStr;
      elements.taskDeadline.min = todayStr;
    }
  }

  function initRandomStudyTip() {
    if (elements.dailyTipText) {
      const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
      elements.dailyTipText.textContent = randomTip;
    }
  }

  // --- LocalStorage Operations ---
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tasks = JSON.parse(stored);
      } else {
        // Preload sample college tasks on initial load
        tasks = [...DEMO_TASKS];
        saveTasksToStorage();
      }
    } catch (err) {
      console.error('Error reading localStorage:', err);
      tasks = [...DEMO_TASKS];
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      showToast('Storage quota exceeded or unavailable', 'danger');
    }
  }

  // --- Single Page Navigation ---
  function navigateTo(sectionId) {
    // Validate target section
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (!targetSection) return;

    // Switch active section
    elements.pageSections.forEach(section => {
      section.classList.remove('active');
    });
    targetSection.classList.add('active');

    // Update active nav links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-section') === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    closeMobileSidebar();

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh UI for active section
    updateUI();
  }

  function openMobileSidebar() {
    if (elements.sidebar) elements.sidebar.classList.add('open');
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (elements.sidebar) elements.sidebar.classList.remove('open');
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Task CRUD Operations ---
  function handleAddTaskSubmit(e) {
    e.preventDefault();

    const title = elements.taskTitle.value.trim();
    const subject = elements.taskSubject.value;
    const deadline = elements.taskDeadline.value;
    const estimatedHours = parseFloat(elements.taskEstimatedHours.value) || 1.0;
    const description = elements.taskDescription.value.trim();
    
    // Get selected priority
    const priorityChecked = document.querySelector('input[name="priorityOption"]:checked');
    const priority = priorityChecked ? priorityChecked.value : 'Medium';

    // Validate inputs
    let hasError = false;

    if (!title) {
      elements.taskTitle.classList.add('has-error');
      elements.titleError.classList.add('visible');
      hasError = true;
    } else {
      elements.taskTitle.classList.remove('has-error');
      elements.titleError.classList.remove('visible');
    }

    if (!subject) {
      elements.taskSubject.classList.add('has-error');
      elements.subjectError.classList.add('visible');
      hasError = true;
    } else {
      elements.taskSubject.classList.remove('has-error');
      elements.subjectError.classList.remove('visible');
    }

    if (!deadline) {
      elements.taskDeadline.classList.add('has-error');
      elements.deadlineError.classList.add('visible');
      hasError = true;
    } else {
      elements.taskDeadline.classList.remove('has-error');
      elements.deadlineError.classList.remove('visible');
    }

    if (hasError) return;

    // Create New Task Object
    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      subject: subject,
      priority: priority,
      deadline: deadline,
      estimatedHours: estimatedHours,
      description: description,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasksToStorage();

    // Reset Form
    elements.addTaskForm.reset();
    initDefaultMinDeadline();

    showToast('Study task scheduled successfully! 🎯', 'success');
    navigateTo('tasks');
  }

  function toggleTaskStatus(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const currentStatus = tasks[taskIndex].status;
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    tasks[taskIndex].status = newStatus;

    if (newStatus === 'Completed') {
      tasks[taskIndex].completedAt = new Date().toISOString();
      showToast('Task marked as completed! 🏆', 'success');
    } else {
      delete tasks[taskIndex].completedAt;
      showToast('Task moved back to pending. ⏳', 'info');
    }

    saveTasksToStorage();
    updateUI();
  }

  // --- Edit Task Modal ---
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    elements.editTaskId.value = task.id;
    elements.editTaskTitle.value = task.title;
    elements.editTaskSubject.value = task.subject;
    elements.editTaskPriority.value = task.priority;
    elements.editTaskDeadline.value = task.deadline;
    elements.editTaskStatus.value = task.status;
    elements.editTaskDescription.value = task.description || '';

    // Clear previous errors
    elements.editTaskTitle.classList.remove('has-error');
    elements.editTitleError.classList.remove('visible');
    elements.editTaskDeadline.classList.remove('has-error');
    elements.editDeadlineError.classList.remove('visible');

    elements.editModalBackdrop.classList.add('active');
  }

  function closeEditModal() {
    elements.editModalBackdrop.classList.remove('active');
  }

  function handleSaveEditSubmit(e) {
    e.preventDefault();

    const taskId = elements.editTaskId.value;
    const title = elements.editTaskTitle.value.trim();
    const subject = elements.editTaskSubject.value;
    const priority = elements.editTaskPriority.value;
    const deadline = elements.editTaskDeadline.value;
    const status = elements.editTaskStatus.value;
    const description = elements.editTaskDescription.value.trim();

    let hasError = false;

    if (!title) {
      elements.editTaskTitle.classList.add('has-error');
      elements.editTitleError.classList.add('visible');
      hasError = true;
    } else {
      elements.editTaskTitle.classList.remove('has-error');
      elements.editTitleError.classList.remove('visible');
    }

    if (!deadline) {
      elements.editTaskDeadline.classList.add('has-error');
      elements.editDeadlineError.classList.add('visible');
      hasError = true;
    } else {
      elements.editTaskDeadline.classList.remove('has-error');
      elements.editDeadlineError.classList.remove('visible');
    }

    if (hasError) return;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title = title;
      tasks[taskIndex].subject = subject;
      tasks[taskIndex].priority = priority;
      tasks[taskIndex].deadline = deadline;
      tasks[taskIndex].status = status;
      tasks[taskIndex].description = description;

      saveTasksToStorage();
      closeEditModal();
      showToast('Task updated successfully! ✏️', 'success');
      updateUI();
    }
  }

  // --- Delete Task Modal ---
  function openDeleteModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    taskToDeleteId = taskId;
    elements.deleteTaskTitleDisplay.textContent = `"${task.title}"`;
    elements.deleteModalBackdrop.classList.add('active');
  }

  function closeDeleteModal() {
    taskToDeleteId = null;
    elements.deleteModalBackdrop.classList.remove('active');
  }

  function handleConfirmDelete() {
    if (!taskToDeleteId) return;

    tasks = tasks.filter(t => t.id !== taskToDeleteId);
    saveTasksToStorage();
    closeDeleteModal();
    showToast('Task removed permanently. 🗑️', 'info');
    updateUI();
  }

  function handleClearAllCompleted() {
    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.', 'info');
      return;
    }

    if (window.confirm(`Clear all ${completedCount} completed task(s)?`)) {
      tasks = tasks.filter(t => t.status !== 'Completed');
      saveTasksToStorage();
      showToast(`Cleared ${completedCount} completed tasks.`, 'info');
      updateUI();
    }
  }

  // --- Reset Demo / Wipe Storage ---
  function handleResetDemoTasks() {
    if (window.confirm('Reset all tasks back to default sample demo data? Your existing tasks will be replaced.')) {
      tasks = [...DEMO_TASKS];
      saveTasksToStorage();
      showToast('Demo study tasks restored! 🔄', 'success');
      updateUI();
    }
  }

  function handleWipeAllData() {
    if (window.confirm('WARNING: Are you sure you want to delete ALL tasks and clear LocalStorage completely?')) {
      tasks = [];
      localStorage.removeItem(STORAGE_KEY);
      showToast('All storage data wiped. 🧹', 'danger');
      updateUI();
    }
  }

  // --- Filter & Search Logic ---
  function getFilteredTasks() {
    return tasks.filter(task => {
      // 1. Status Filter
      if (currentFilterStatus === 'PENDING' && task.status !== 'Pending') return false;
      if (currentFilterStatus === 'COMPLETED' && task.status !== 'Completed') return false;

      // 2. Subject Filter
      if (activeSubjectFilter !== 'ALL' && task.subject !== activeSubjectFilter) return false;

      // 3. Priority Filter
      if (activePriorityFilter !== 'ALL' && task.priority !== activePriorityFilter) return false;

      // 4. Keyword Search
      if (activeSearchTerm) {
        const term = activeSearchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(term);
        const matchSubject = task.subject.toLowerCase().includes(term);
        const matchDesc = task.description && task.description.toLowerCase().includes(term);
        if (!matchTitle && !matchSubject && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort Option
      if (activeSortOption === 'deadline-asc') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (activeSortOption === 'deadline-desc') {
        return new Date(b.deadline) - new Date(a.deadline);
      } else if (activeSortOption === 'priority-desc') {
        const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      } else if (activeSortOption === 'created-desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (activeSortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }

  // --- Relative Deadline Urgency Calculator ---
  function getDeadlineBadge(deadlineStr, isCompleted) {
    if (isCompleted) {
      return `<span class="deadline-badge normal">Finished</span>`;
    }

    if (!deadlineStr) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = deadlineStr.split('-');
    const taskDate = new Date(parts[0], parts[1] - 1, parts[2]);
    taskDate.setHours(0, 0, 0, 0);

    const diffMs = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return `<span class="deadline-badge overdue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        ${daysOverdue === 1 ? 'Overdue by 1 day' : `Overdue (${daysOverdue}d)`}
      </span>`;
    } else if (diffDays === 0) {
      return `<span class="deadline-badge today">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Due Today
      </span>`;
    } else if (diffDays === 1) {
      return `<span class="deadline-badge upcoming">Due Tomorrow</span>`;
    } else if (diffDays <= 3) {
      return `<span class="deadline-badge upcoming">In ${diffDays} days</span>`;
    } else {
      const formatted = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `<span class="deadline-badge normal">Due ${formatted}</span>`;
    }
  }

  // --- UI Render Functions ---
  function updateUI() {
    updateStatistics();
    renderDashboardLists();
    renderAllTasks();
    renderCompletedTasks();
    renderActiveFilterBadges();
  }

  // --- 1. Statistics & Progress Bar ---
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority counts
    const highCount = tasks.filter(t => t.priority === 'High' && t.status === 'Pending').length;
    const medCount = tasks.filter(t => t.priority === 'Medium' && t.status === 'Pending').length;
    const lowCount = tasks.filter(t => t.priority === 'Low' && t.status === 'Pending').length;

    // Update Dashboard Cards
    if (elements.dashTotalTasks) elements.dashTotalTasks.textContent = total;
    if (elements.dashPendingTasks) elements.dashPendingTasks.textContent = pending;
    if (elements.dashCompletedTasks) elements.dashCompletedTasks.textContent = completed;
    if (elements.dashCompletionRate) elements.dashCompletionRate.textContent = `${percentage}%`;

    // Horizontal Progress bar
    if (elements.dashProgressBar) {
      elements.dashProgressBar.style.width = `${percentage}%`;
    }

    // Circular Progress Ring
    if (elements.progressRingCircle && elements.progressRingPercent) {
      const radius = 42;
      const circumference = 2 * Math.PI * radius; // ~263.89
      const offset = circumference - (percentage / 100) * circumference;
      elements.progressRingCircle.style.strokeDashoffset = offset;
      elements.progressRingPercent.textContent = `${percentage}%`;
    }

    // Priority breakdown pills
    if (elements.dashHighCount) elements.dashHighCount.textContent = highCount;
    if (elements.dashMedCount) elements.dashMedCount.textContent = medCount;
    if (elements.dashLowCount) elements.dashLowCount.textContent = lowCount;

    // Sidebar Counts
    if (elements.sidebarPendingCount) elements.sidebarPendingCount.textContent = pending;
    if (elements.sidebarCompletedCount) elements.sidebarCompletedCount.textContent = completed;

    // Filter Tab Counts
    if (elements.countFilterAll) elements.countFilterAll.textContent = total;
    if (elements.countFilterPending) elements.countFilterPending.textContent = pending;
    if (elements.countFilterCompleted) elements.countFilterCompleted.textContent = completed;

    // Completed section badge
    if (elements.completedTotalBadge) elements.completedTotalBadge.textContent = completed;
  }

  // --- 2. Dashboard Recent & Urgent Lists ---
  function renderDashboardLists() {
    // A. Urgent / Upcoming Tasks (Due within 72 hours or overdue, pending only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentTasks = tasks.filter(task => {
      if (task.status !== 'Pending') return false;
      const parts = task.deadline.split('-');
      const taskDate = new Date(parts[0], parts[1] - 1, parts[2]);
      taskDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3; // overdue, today, or next 3 days
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (elements.urgentTasksList) {
      if (urgentTasks.length === 0) {
        elements.urgentTasksList.innerHTML = `
          <div class="empty-list-notice">
            <p>🎉 No urgent tasks due in the next 72 hours. You're well on schedule!</p>
          </div>
        `;
      } else {
        elements.urgentTasksList.innerHTML = urgentTasks.slice(0, 4).map(task => createTaskCardHTML(task, true)).join('');
      }
    }

    // B. Recent Tasks (Latest 4 scheduled)
    const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    if (elements.recentTasksList) {
      if (recent.length === 0) {
        elements.recentTasksList.innerHTML = `
          <div class="empty-list-notice">
            <p>No study tasks yet. Click <strong>+ Add Task</strong> to get started!</p>
          </div>
        `;
      } else {
        elements.recentTasksList.innerHTML = recent.map(task => createTaskCardHTML(task, false)).join('');
      }
    }
  }

  // --- 3. My Tasks List Grid ---
  function renderAllTasks() {
    const filtered = getFilteredTasks();

    if (!elements.allTasksGrid) return;

    if (filtered.length === 0) {
      elements.allTasksGrid.innerHTML = '';
      if (elements.emptyStateContainer) {
        elements.emptyStateContainer.style.display = 'flex';
        if (activeSearchTerm) {
          elements.emptyStateTitle.textContent = 'No Matching Tasks Found';
          elements.emptyStateMessage.textContent = `No assignments matched "${activeSearchTerm}". Try refining your keywords or clearing the search.`;
        } else if (activeSubjectFilter !== 'ALL' || activePriorityFilter !== 'ALL' || currentFilterStatus !== 'ALL') {
          elements.emptyStateTitle.textContent = 'No Tasks in this Filter';
          elements.emptyStateMessage.textContent = 'Try adjusting your subject or priority filters to see other tasks.';
        } else {
          elements.emptyStateTitle.textContent = 'No Tasks Scheduled';
          elements.emptyStateMessage.textContent = 'Your study schedule is currently clear. Add assignments to stay organized!';
        }
      }
    } else {
      if (elements.emptyStateContainer) elements.emptyStateContainer.style.display = 'none';
      elements.allTasksGrid.innerHTML = filtered.map(task => createTaskCardHTML(task)).join('');
    }
  }

  // --- 4. Completed Tasks Grid ---
  function renderCompletedTasks() {
    const completedTasks = tasks.filter(t => t.status === 'Completed')
      .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

    if (!elements.completedTasksGrid) return;

    if (completedTasks.length === 0) {
      elements.completedTasksGrid.innerHTML = '';
      if (elements.emptyCompletedState) elements.emptyCompletedState.style.display = 'flex';
    } else {
      if (elements.emptyCompletedState) elements.emptyCompletedState.style.display = 'none';
      elements.completedTasksGrid.innerHTML = completedTasks.map(task => createTaskCardHTML(task, false, true)).join('');
    }
  }

  // --- Card HTML Generator ---
  function createTaskCardHTML(task, isCompact = false, isCompletedView = false) {
    const isChecked = task.status === 'Completed' ? 'checked' : '';
    const completedClass = task.status === 'Completed' ? 'is-completed' : '';
    const deadlineBadgeHTML = getDeadlineBadge(task.deadline, task.status === 'Completed');
    const hoursText = task.estimatedHours ? `${task.estimatedHours}h` : '';

    return `
      <div class="task-item-card ${completedClass}" data-task-id="${task.id}" data-priority="${task.priority}">
        <div class="task-card-header">
          <div class="task-title-group">
            <label class="custom-checkbox" title="${task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Completed'}">
              <input type="checkbox" class="task-status-checkbox" data-id="${task.id}" ${isChecked}>
              <span class="checkbox-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </label>
            <div>
              <h4 class="task-title">${escapeHTML(task.title)}</h4>
              ${task.description && !isCompact ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
            </div>
          </div>

          <div class="task-actions">
            <button class="btn-icon-action edit-action" data-edit-id="${task.id}" title="Edit Task">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="btn-icon-action delete-action" data-delete-id="${task.id}" title="Delete Task">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="task-card-meta">
          <div class="task-tags-group">
            <span class="subject-tag">${escapeHTML(task.subject)}</span>
            <span class="priority-tag ${task.priority}">${task.priority}</span>
            ${hoursText ? `<span class="subject-tag">⏱ ${hoursText}</span>` : ''}
          </div>
          <div class="task-deadline-wrap">
            ${deadlineBadgeHTML}
          </div>
        </div>
      </div>
    `;
  }

  // --- Active Filter Badges ---
  function renderActiveFilterBadges() {
    if (!elements.activeFiltersRow || !elements.activeFilterTags) return;

    const badges = [];

    if (activeSearchTerm) {
      badges.push(`Search: "${activeSearchTerm}"`);
    }
    if (activeSubjectFilter !== 'ALL') {
      badges.push(`Subject: ${activeSubjectFilter}`);
    }
    if (activePriorityFilter !== 'ALL') {
      badges.push(`Priority: ${activePriorityFilter}`);
    }
    if (currentFilterStatus !== 'ALL') {
      badges.push(`Status: ${currentFilterStatus}`);
    }

    if (badges.length > 0) {
      elements.activeFiltersRow.style.display = 'flex';
      elements.activeFilterTags.innerHTML = badges.map(badge => `
        <span class="filter-tag-pill">
          ${badge}
        </span>
      `).join('');
    } else {
      elements.activeFiltersRow.style.display = 'none';
      elements.activeFilterTags.innerHTML = '';
    }
  }

  function resetAllFilters() {
    activeSearchTerm = '';
    activeSubjectFilter = 'ALL';
    activePriorityFilter = 'ALL';
    currentFilterStatus = 'ALL';
    activeSortOption = 'deadline-asc';

    if (elements.taskSearchInput) elements.taskSearchInput.value = '';
    if (elements.globalSearchInput) elements.globalSearchInput.value = '';
    if (elements.filterSubject) elements.filterSubject.value = 'ALL';
    if (elements.filterPriority) elements.filterPriority.value = 'ALL';
    if (elements.sortBy) elements.sortBy.value = 'deadline-asc';
    if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'none';

    elements.statusTabs.forEach(tab => {
      if (tab.getAttribute('data-status') === 'ALL') {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    updateUI();
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHTML(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto-remove after 3.2 seconds
    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }

  // --- Safe HTML Escape Utility ---
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // 1. Navigation Clicks (Sidebar & Quick Actions)
    document.addEventListener('click', e => {
      const navTarget = e.target.closest('[data-section]');
      if (navTarget) {
        e.preventDefault();
        const section = navTarget.getAttribute('data-section');
        navigateTo(section);
      }
    });

    // 2. Mobile Sidebar Open / Close
    if (elements.openSidebarBtn) {
      elements.openSidebarBtn.addEventListener('click', openMobileSidebar);
    }
    if (elements.closeSidebarBtn) {
      elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    }
    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // 3. Theme Toggle
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 4. Header Quick Add & Search
    if (elements.headerQuickAddBtn) {
      elements.headerQuickAddBtn.addEventListener('click', () => navigateTo('add-task'));
    }

    if (elements.globalSearchInput) {
      elements.globalSearchInput.addEventListener('input', e => {
        activeSearchTerm = e.target.value.trim();
        if (elements.taskSearchInput) {
          elements.taskSearchInput.value = activeSearchTerm;
        }
        if (elements.clearSearchBtn) {
          elements.clearSearchBtn.style.display = activeSearchTerm ? 'flex' : 'none';
        }
        navigateTo('tasks');
        updateUI();
      });
    }

    // 5. My Tasks Toolbar Search & Filters
    if (elements.taskSearchInput) {
      elements.taskSearchInput.addEventListener('input', e => {
        activeSearchTerm = e.target.value.trim();
        if (elements.clearSearchBtn) {
          elements.clearSearchBtn.style.display = activeSearchTerm ? 'flex' : 'none';
        }
        updateUI();
      });
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener('click', () => {
        activeSearchTerm = '';
        if (elements.taskSearchInput) elements.taskSearchInput.value = '';
        if (elements.globalSearchInput) elements.globalSearchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        updateUI();
      });
    }

    if (elements.filterSubject) {
      elements.filterSubject.addEventListener('change', e => {
        activeSubjectFilter = e.target.value;
        updateUI();
      });
    }

    if (elements.filterPriority) {
      elements.filterPriority.addEventListener('change', e => {
        activePriorityFilter = e.target.value;
        updateUI();
      });
    }

    if (elements.sortBy) {
      elements.sortBy.addEventListener('change', e => {
        activeSortOption = e.target.value;
        updateUI();
      });
    }

    // 6. Status Tabs (All, Pending, Completed)
    elements.statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilterStatus = tab.getAttribute('data-status');
        updateUI();
      });
    });

    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // 7. Add Task Form Submit & Reset
    if (elements.addTaskForm) {
      elements.addTaskForm.addEventListener('submit', handleAddTaskSubmit);
    }

    if (elements.resetTaskFormBtn) {
      elements.resetTaskFormBtn.addEventListener('click', () => {
        elements.taskTitle.classList.remove('has-error');
        elements.titleError.classList.remove('visible');
        elements.taskSubject.classList.remove('has-error');
        elements.subjectError.classList.remove('visible');
        elements.taskDeadline.classList.remove('has-error');
        elements.deadlineError.classList.remove('visible');
        setTimeout(initDefaultMinDeadline, 0);
      });
    }

    // 8. Event Delegation for Task Card Actions (Checkbox, Edit, Delete)
    document.addEventListener('change', e => {
      if (e.target.classList.contains('task-status-checkbox')) {
        const taskId = e.target.getAttribute('data-id');
        toggleTaskStatus(taskId);
      }
    });

    document.addEventListener('click', e => {
      const editBtn = e.target.closest('[data-edit-id]');
      if (editBtn) {
        const taskId = editBtn.getAttribute('data-edit-id');
        openEditModal(taskId);
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-id]');
      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-delete-id');
        openDeleteModal(taskId);
        return;
      }
    });

    // 9. Edit Modal Actions
    if (elements.editTaskForm) {
      elements.editTaskForm.addEventListener('submit', handleSaveEditSubmit);
    }
    if (elements.closeEditModalBtn) {
      elements.closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    if (elements.cancelEditModalBtn) {
      elements.cancelEditModalBtn.addEventListener('click', closeEditModal);
    }

    // 10. Delete Modal Actions
    if (elements.confirmDeleteBtn) {
      elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }
    if (elements.closeDeleteModalBtn) {
      elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }
    if (elements.cancelDeleteModalBtn) {
      elements.cancelDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }

    // Close modals on clicking outside backdrop
    window.addEventListener('click', e => {
      if (e.target === elements.editModalBackdrop) closeEditModal();
      if (e.target === elements.deleteModalBackdrop) closeDeleteModal();
    });

    // Close modals on Escape key
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeEditModal();
        closeDeleteModal();
        closeMobileSidebar();
      }
    });

    // 11. Completed Tasks Actions
    if (elements.clearCompletedBtn) {
      elements.clearCompletedBtn.addEventListener('click', handleClearAllCompleted);
    }

    // 12. About Project Demo Buttons
    if (elements.resetDemoTasksBtn) {
      elements.resetDemoTasksBtn.addEventListener('click', handleResetDemoTasks);
    }
    if (elements.wipeAllDataBtn) {
      elements.wipeAllDataBtn.addEventListener('click', handleWipeAllData);
    }
  }

  // --- Initialize on DOM Content Loaded ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

