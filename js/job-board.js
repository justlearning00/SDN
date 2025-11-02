document.addEventListener("DOMContentLoaded", () => {
  const jobContainer = document.getElementById("jobContainer");
  const toastContainer = document.getElementById("toastContainer");
  const jobSearch = document.getElementById("jobSearch");
  const searchBtn = document.getElementById("searchBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");
  const logoutBtn = document.getElementById("logout-btn");

  // Use sessionStorage for applied jobs in current session
  let appliedJobs = JSON.parse(sessionStorage.getItem("appliedJobs")) || [];
  
  // Store current filter state
  let currentFilter = "All";

  const jobs = [
    { id: 1, title: "Frontend Developer Intern", company: "NamTech Labs", location: "Windhoek", category: "Technology", level: "Beginner", description: "Assist with building UI components using HTML, CSS, and JS. Perfect for students completing Web Dev courses.", duration: "Internship" },
    { id: 2, title: "Junior Business Analyst", company: "NamBiz Consulting", location: "Windhoek", category: "Business", level: "Intermediate", description: "Analyze data and create reports to support business decisions.", duration: "Full-time" },
    { id: 3, title: "Graphic Designer", company: "Creative Agency Namibia", location: "Swakopmund", category: "Design", level: "Intermediate", description: "Design branding materials and social media graphics.", duration: "Contract" },
    { id: 4, title: "Marketing Assistant", company: "BrandLink", location: "Remote", category: "Marketing", level: "Beginner", description: "Plan and execute social media campaigns, create content, and monitor performance.", duration: "Part-time" },
    { id: 5, title: "Data Analyst Intern", company: "DataScience Namibia", location: "Windhoek", category: "Data Science", level: "Advanced", description: "Assist with data visualization and predictive modeling using Python.", duration: "Internship" },
    { id: 6, title: "Software Engineer Trainee", company: "Tech Solutions Namibia", location: "Windhoek", category: "Technology", level: "Advanced", description: "Participate in backend development projects using PHP and Flask.", duration: "Full-time" },
  ];

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        alert("Logged out successfully");
        window.location.href = "index.html";
      }
    });
  }

  function getLevelClass(level) {
    return level === "Beginner"
      ? "level-beginner"
      : level === "Intermediate"
      ? "level-intermediate"
      : "level-advanced";
  }

  function renderJobs(filteredJobs) {
    jobContainer.innerHTML = "";
    
    if (filteredJobs.length === 0) {
      jobContainer.innerHTML = '<p style="text-align: center; color: var(--dark-gray); padding: 2rem;">No jobs found matching your criteria.</p>';
      return;
    }

    filteredJobs.forEach((job) => {
      const card = document.createElement("div");
      card.className = "job-card";

      const isApplied = appliedJobs.includes(job.id);
      card.innerHTML = `
        <h3>${job.title} <span class="level-badge ${getLevelClass(job.level)}">${job.level}</span></h3>
        <p><strong>${job.company}</strong></p>
        <p>${job.location}</p>
        <p><em>${job.duration}</em></p>
        <button class="apply-btn ${isApplied ? "applied" : ""}" data-job-id="${job.id}">${isApplied ? "Applied" : "View Details"}</button>
      `;

      const button = card.querySelector(".apply-btn");
      if (!isApplied) {
        button.addEventListener("click", () => openModal(job));
      }

      jobContainer.appendChild(card);
    });
  }

  renderJobs(jobs);

  // Filter functionality
  document.querySelectorAll(".filter-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      document.querySelectorAll(".filter-icon").forEach(i => i.classList.remove("active"));
      icon.classList.add("active");

      currentFilter = icon.dataset.category;
      const filtered = currentFilter === "All" ? jobs : jobs.filter(j => j.category === currentFilter);
      renderJobs(filtered);
      showToast(currentFilter === "All" ? "Showing all jobs" : `Filtered by ${currentFilter}`, "info");
    });
  });

  // Search functionality
  searchBtn.addEventListener("click", () => {
    const query = jobSearch.value.toLowerCase().trim();
    if (query === "") {
      const filtered = currentFilter === "All" ? jobs : jobs.filter(j => j.category === currentFilter);
      renderJobs(filtered);
      showToast("Showing all jobs", "info");
      return;
    }
    
    let filtered = jobs.filter((j) => 
      j.title.toLowerCase().includes(query) || 
      j.company.toLowerCase().includes(query) ||
      j.location.toLowerCase().includes(query)
    );
    
    if (currentFilter !== "All") {
      filtered = filtered.filter(j => j.category === currentFilter);
    }
    
    renderJobs(filtered);
    showToast(`Showing results for "${query}"`, "info");
  });

  // Allow search on Enter key
  jobSearch.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
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
      <button id="applyBtn" data-job-id="${job.id}">Apply Now</button>
    `;
    modalOverlay.style.display = "flex";

    document.getElementById("applyBtn").addEventListener("click", () => {
      const jobId = parseInt(document.getElementById("applyBtn").dataset.jobId);
      
      if (!appliedJobs.includes(jobId)) {
        // Add to applied jobs
        appliedJobs.push(jobId);
        sessionStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
        
        // Close modal first
        modalOverlay.style.display = "none";
        
        // Show success toast
        showToast("Application successfully submitted!", "success");
        
        // Re-render jobs with current filter to update button immediately
        const filtered = currentFilter === "All" ? jobs : jobs.filter(j => j.category === currentFilter);
        renderJobs(filtered);
      } else {
        modalOverlay.style.display = "none";
        showToast("You have already applied to this job", "info");
      }
    });
  }

  // Close modal handlers
  closeModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });
  
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.style.display === "flex") {
      modalOverlay.style.display = "none";
    }
  });

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Force reflow to trigger animation
    void toast.offsetWidth;
    
    // Add visible class for animation
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }
});