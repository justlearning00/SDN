/* job-board.js
   - Icon filters
   - Search + level + location filters
   - Toasts with color types (info, success, error)
   - Employer form to add jobs (localStorage)
   - Bounce animation on render
*/

// ---------------------- Sample user & mapping ----------------------
const user = {
  id: 1,
  name: "Jane Doe",
  completedCourses: [
    "Web Development Basics",
    "Digital Marketing Fundamentals",
    "Data Analysis with Python"
  ]
};

const courseToCategory = {
  "Web Development Basics": "IT",
  "Digital Marketing Fundamentals": "Business",
  "Data Analysis with Python": "IT",
  "Business Communication": "Business",
  "Engineering Essentials": "Engineering"
};

// ---------------------- DOM Elements ----------------------
const jobsGrid = document.getElementById('jobs-grid');
const iconBar = document.getElementById('icon-bar');
const suggestionEl = document.getElementById('suggestion');
const suggestionCatEl = document.getElementById('suggest-cat');
const searchInput = document.getElementById('search-input');
const levelFilter = document.getElementById('level-filter');
const locationFilter = document.getElementById('location-filter');
const resultsInfo = document.getElementById('results-info');
const toastContainer = document.getElementById('toast-container');
const employerFormWrap = document.getElementById('employer-form');
const toggleEmployerBtn = document.getElementById('toggle-employer');
const closeEmployerBtn = document.getElementById('close-employer');
const addJobForm = document.getElementById('add-job-form');
const loadMoreBtn = document.getElementById('load-more');

// ---------------------- Default jobs (seed) ----------------------
const seedJobs = [
  { id: 1, title: "Junior Web Developer", company: "Tech Solutions Namibia", category: "IT", location: "Windhoek", level: "Junior", desc: "Frontend + basic backend. Good for web dev grads." },
  { id: 2, title: "Marketing Intern", company: "Namibia Business Hub", category: "Business", location: "Remote", level: "Internship", desc: "Assist with campaigns and analytics." },
  { id: 3, title: "Data Analyst (Entry)", company: "Insight Labs", category: "IT", location: "Windhoek", level: "Junior", desc: "Work with Python and Excel to generate reports." },
  { id: 4, title: "Civil Engineering Assistant", company: "BuildCo", category: "Engineering", location: "Swakopmund", level: "Mid", desc: "Support site planning and drafting." },
  { id: 5, title: "Junior Accountant", company: "AccountsPlus", category: "Finance", location: "Windhoek", level: "Junior", desc: "Assist with bookkeeping and payroll." },
  { id: 6, title: "Graphic Designer (Remote)", company: "Brandmakers", category: "Design", location: "Remote", level: "Internship", desc: "Create social assets and UI mockups." },
  { id: 7, title: "Frontend Engineer (React)", company: "WebWorks", category: "IT", location: "Windhoek", level: "Mid", desc: "React + modern frontend stack." },
  { id: 8, title: "Business Analyst (Junior)", company: "ConsultCo", category: "Business", location: "Windhoek", level: "Junior", desc: "Assist with client reports and dashboards." },
  { id: 9, title: "UX Designer", company: "Pixel Labs", category: "Design", location: "Swakopmund", level: "Junior", desc: "Wireframing and prototype testing." },
  { id: 10, title: "IT Support Intern", company: "Campus IT", category: "IT", location: "Windhoek", level: "Internship", desc: "Helpdesk, basic networking and support." }
];

// ---------------------- Storage helpers ----------------------
function loadJobs() {
  const raw = localStorage.getItem('skilllink_jobs');
  if (!raw) {
    localStorage.setItem('skilllink_jobs', JSON.stringify(seedJobs));
    return seedJobs.slice();
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem('skilllink_jobs', JSON.stringify(seedJobs));
    return seedJobs.slice();
  }
}
function saveJobs(jobs) {
  localStorage.setItem('skilllink_jobs', JSON.stringify(jobs));
}

// ---------------------- Toast (notifications) ----------------------
function showToast(message, type = 'info', duration = 2800) {
  if (!toastContainer) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  // remove after duration
  setTimeout(() => {
    t.style.opacity = 0;
    t.style.transform = 'translateY(-6px)';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ---------------------- Render jobs ----------------------
let jobs = loadJobs();
let visibleCount = 6; // initial number of cards to show for Load More demo

function renderJobs(list) {
  jobsGrid.innerHTML = '';
  if (!list.length) {
    resultsInfo.textContent = 'No jobs found — try different filters.';
    return;
  }
  resultsInfo.textContent = `${list.length} job(s) found`;
//inspo
  // Show first visibleCount jobs (simple pagination)
  const showList = list.slice(0, visibleCount);
  showList.forEach(job => {
    const card = document.createElement('article');
    card.className = `job-card level-${job.level.toLowerCase()}`;
    if (job.level === 'Internship') card.classList.add('level-intern');
    if (job.level === 'Junior') card.classList.add('level-junior');
    if (job.level === 'Mid') card.classList.add('level-mid');

    card.innerHTML = `
      <div class="job-meta">
        <div class="job-title">${job.title}</div>
        <div class="job-company">${job.company}</div>
        <div class="job-details">${job.location} • ${job.category} • ${job.level}</div>
        <div class="job-desc">${job.desc || ''}</div>
      </div>
      <div class="job-actions">
        <button class="btn btn-secondary btn-apply" data-id="${job.id}">Apply</button>
        <button class="btn btn-primary btn-save" data-id="${job.id}">Save</button>
      </div>
    `;
    jobsGrid.appendChild(card);
    // animate
    requestAnimationFrame(() => card.classList.add('animate'));
  });

  // Attach event listeners for apply/save
  document.querySelectorAll('.btn-apply').forEach(b => b.addEventListener('click', handleApply));
  document.querySelectorAll('.btn-save').forEach(b => b.addEventListener('click', handleSaveJob));
}

// ---------------------- Filter logic ----------------------
let activeCategories = new Set(['All']);

function getActiveCategories() {
  // If 'All' is in set return null to mean all categories allowed
  if (activeCategories.has('All')) return null;
  return [...activeCategories];
}

function applyFilters() {
  const keyword = (searchInput.value || '').toLowerCase().trim();
  const level = levelFilter.value;
  const location = locationFilter.value;
  const cats = getActiveCategories();

  const filtered = jobs.filter(j => {
    if (cats && cats.length > 0 && !cats.includes(j.category)) return false;
    if (level !== 'Any' && level && j.level !== level) return false;
    if (location !== 'Any' && location && j.location !== location) return false;
    if (keyword) {
      const hay = `${j.title} ${j.company} ${j.location} ${j.category} ${j.desc}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });

  // reset visibleCount on new filter so user sees top matches
  visibleCount = Math.max(6, Math.min(12, filtered.length));
  renderJobs(filtered);
  showToast(`${filtered.length} match(es)`, 'info', 1000);
}

// ---------------------- Icon filter setup ----------------------
function setupIconFilters() {
  const buttons = iconBar.querySelectorAll('.icon-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      // Toggle behaviour: All resets selection
      if (cat === 'All') {
        activeCategories = new Set(['All']);
        buttons.forEach(b => b.classList.toggle('active', b.dataset.cat === 'All'));
      } else {
        // remove All
        activeCategories.delete('All');
        // toggle this category
        const wasActive = btn.classList.contains('active');
        btn.classList.toggle('active', !wasActive);
        if (!wasActive) activeCategories.add(cat);
        else activeCategories.delete(cat);
        // if no category selected, choose All
        if (activeCategories.size === 0) {
          activeCategories.add('All');
          buttons.forEach(b => b.classList.toggle('active', b.dataset.cat === 'All'));
        } else {
          // ensure All is not active
          buttons.forEach(b => {
            if (b.dataset.cat === 'All') b.classList.remove('active');
          });
        }
      }
      applyFilters();
    });
  });

  searchBtn.addEventListener("click", () => {
    const query = jobSearch.value.toLowerCase();
    const filtered = jobs.filter((j) => j.title.toLowerCase().includes(query));
    renderJobs(filtered);
    showToast(`Showing results for "${query}"`, "info");
  });

  function openModal(job) {
    modalContent.innerHTML = `
      <h2>${job.title}</h2>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Level:</strong> <span class="${getLevelClass(job.level)} level-badge">${job.level}</span></p>
      <p><strong>Duration:</strong> ${job.duration}</p>
      <p style="margin-top:1rem;">${job.description}</p>
      <button id="applyBtn">Apply Now</button>
    `;
    modalOverlay.style.display = "flex";

    document.getElementById("applyBtn").addEventListener("click", () => {
      if (!appliedJobs.includes(job.id)) {
        appliedJobs.push(job.id);
        localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
        showToast("Application successfully submitted.", "success");
        renderJobs(jobs);
      }
      modalOverlay.style.display = "none";
    });
  }

  closeModal.addEventListener("click", () => (modalOverlay.style.display = "none"));
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = "none";
  });

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};
