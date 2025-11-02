document.addEventListener("DOMContentLoaded", () => {
  const jobContainer = document.getElementById("jobContainer");
  const toastContainer = document.getElementById("toastContainer");
  const jobSearch = document.getElementById("jobSearch");
  const searchBtn = document.getElementById("searchBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");

  const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];

  const jobs = [
    { id: 1, title: "Frontend Developer Intern", company: "NamTech Labs", location: "Windhoek", category: "Technology", level: "Beginner", description: "Assist with building UI components using HTML, CSS, and JS. Perfect for students completing Web Dev courses.", duration: "Internship" },
    { id: 2, title: "Junior Business Analyst", company: "NamBiz Consulting", location: "Windhoek", category: "Business", level: "Intermediate", description: "Analyze data and create reports to support business decisions.", duration: "Full-time" },
    { id: 3, title: "Graphic Designer", company: "Creative Agency Namibia", location: "Swakopmund", category: "Design", level: "Intermediate", description: "Design branding materials and social media graphics.", duration: "Contract" },
    { id: 4, title: "Marketing Assistant", company: "BrandLink", location: "Remote", category: "Marketing", level: "Beginner", description: "Plan and execute social media campaigns, create content, and monitor performance.", duration: "Part-time" },
    { id: 5, title: "Data Analyst Intern", company: "DataScience Namibia", location: "Windhoek", category: "Data Science", level: "Advanced", description: "Assist with data visualization and predictive modeling using Python.", duration: "Internship" },
    { id: 6, title: "Software Engineer Trainee", company: "Tech Solutions Namibia", location: "Windhoek", category: "Technology", level: "Advanced", description: "Participate in backend development projects using PHP and Flask.", duration: "Full-time" },
  ];

  function getLevelClass(level) {
    return level === "Beginner"
      ? "level-beginner"
      : level === "Intermediate"
      ? "level-intermediate"
      : "level-advanced";
  }

  function renderJobs(filteredJobs) {
    jobContainer.innerHTML = "";
    filteredJobs.forEach((job) => {
      const card = document.createElement("div");
      card.className = "job-card";

      const isApplied = appliedJobs.includes(job.id);
      card.innerHTML = `
        <h3>${job.title} <span class="level-badge ${getLevelClass(job.level)}">${job.level}</span></h3>
        <p><strong>${job.company}</strong></p>
        <p>${job.location}</p>
        <p><em>${job.duration}</em></p>
        <button class="apply-btn ${isApplied ? "applied" : ""}">${isApplied ? "Applied" : "View Details"}</button>
      `;

      const button = card.querySelector(".apply-btn");
      if (!isApplied) {
        button.addEventListener("click", () => openModal(job));
      }

      jobContainer.appendChild(card);
    });
  }

  renderJobs(jobs);

  document.querySelectorAll(".filter-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      document.querySelectorAll(".filter-icon").forEach(i => i.classList.remove("active"));
      icon.classList.add("active");

      const category = icon.dataset.category;
      const filtered = category === "All" ? jobs : jobs.filter(j => j.category === category);
      renderJobs(filtered);
      showToast(category === "All" ? "Showing all jobs" : `Filtered by ${category}`, "info");
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
});
