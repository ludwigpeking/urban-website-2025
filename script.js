let currentChapter = 0;
let currentSection = 'algorithms'; // 'algorithms', 'history', 'about'

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadLogo();
});

function initializeApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const chapter = urlParams.get("chapter");
  const section = urlParams.get("section") || 'algorithms';
  
  currentSection = section;
  currentChapter = chapter ? parseInt(chapter, 10) : 0;
  
  // Show appropriate layout based on screen size
  if (window.innerWidth <= 768) {
    showMobileLanding();
  } else {
    showMainContent();
    loadSection(currentSection);
  }
}

function setupEventListeners() {
  // Mobile navigation buttons
  document.getElementById("mobile-algorithms-btn").addEventListener("click", () => {
    currentSection = 'algorithms';
    showMainContent();
    loadSection('algorithms');
  });
  
  document.getElementById("mobile-history-btn").addEventListener("click", () => {
    currentSection = 'history';
    showMainContent();
    loadSection('history');
  });
  
  document.getElementById("mobile-about-btn").addEventListener("click", () => {
    currentSection = 'about';
    showMainContent();
    loadSection('about');
  });

  // Desktop navigation buttons
  document.getElementById("algorithms-btn").addEventListener("click", () => {
    loadSection('algorithms');
  });
  
  document.getElementById("history-btn").addEventListener("click", () => {
    loadSection('history');
  });
  
  document.getElementById("about-btn").addEventListener("click", () => {
    loadSection('about');
  });

  // Chapter navigation
  document.getElementById("tocButton").addEventListener("click", () => {
    currentChapter = 0;
    loadChapter(currentChapter);
  });

  document.getElementById("prevButton").addEventListener("click", () => {
    if (currentChapter > 0) {
      currentChapter -= 1;
      loadChapter(currentChapter);
    }
  });

  document.getElementById("nextButton").addEventListener("click", () => {
    const maxChapter = currentSection === 'algorithms' ? 38 : 10;
    if (currentChapter < maxChapter) {
      currentChapter += 1;
      loadChapter(currentChapter);
    }
  });

  // Content link clicks
  document.getElementById("content").addEventListener("click", handleContentClick);
  document.getElementById("links-container").addEventListener("click", handleContentClick);

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && document.querySelector('.mobile-landing').style.display !== 'none') {
      showMainContent();
      loadSection(currentSection);
    }
  });
}

function handleContentClick(event) {
  if (event.target && event.target.matches(".nav-link")) {
    event.preventDefault();
    let chapterNumber = event.target.getAttribute("data-chapter");
    
    // Handle both numeric and string chapter identifiers
    if (chapterNumber && (chapterNumber.match(/^\d+$/) || chapterNumber.startsWith('n') || chapterNumber === 'a0')) {
      // Convert numeric strings to numbers for backward compatibility
      if (chapterNumber.match(/^\d+$/)) {
        chapterNumber = parseInt(chapterNumber, 10);
      }
      loadChapter(chapterNumber);
    }
  }
}

function showMobileLanding() {
  document.querySelector('.mobile-landing').style.display = 'flex';
  document.querySelector('.main-content').style.display = 'none';
}

function showMainContent() {
  document.querySelector('.mobile-landing').style.display = 'none';
  document.querySelector('.main-content').style.display = 'flex';
}

function loadSection(section) {
  currentSection = section;
  currentChapter = 0;
  
  // Update active navigation button
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${section}-btn`).classList.add('active');
  
  // Show/hide sidebar and chapter navigation based on section
  const leftColumn = document.getElementById("left-column");
  const content = document.getElementById("content");
  const chapterNav = document.getElementById("chapter-nav");
  
  if (section === 'about') {
    leftColumn.classList.add('hidden');
    content.classList.add('full-width');
    chapterNav.classList.remove('visible');
    loadAboutContent();
  } else {
    leftColumn.classList.remove('hidden');
    content.classList.remove('full-width');
    chapterNav.classList.add('visible');
    loadTOC(section);
  }
  
  // Update URL
  history.pushState({}, "", `?section=${section}&chapter=${currentChapter}`);
}

function loadTOC(section) {
  const linksContainer = document.getElementById("links-container");
  const contentDiv = document.getElementById("content");
  
  if (section === 'algorithms') {
    // Load algorithms TOC
    fetch("algorithms-links.html")
      .then(response => response.text())
      .then(linksData => {
        linksContainer.innerHTML = linksData;
        contentDiv.innerHTML = '<h1>[The Algorithms on Urbanism and Architecture]</h1><br>' + linksData;
        contentDiv.scrollTop = 0;
      }).catch(error => console.error("Error loading algorithms content:", error));
  } else if (section === 'history') {
    // Load history TOC and introduction
    Promise.all([
      fetch("links.html").then(response => response.text()),
      fetch("chapters/history/00.html").then(response => response.text())
    ]).then(([linksData, introData]) => {
      linksContainer.innerHTML = linksData;
      contentDiv.innerHTML = introData;
      contentDiv.scrollTop = 0;
    }).catch(error => console.error("Error loading history content:", error));
  }
}

function loadAboutContent() {
  const contentDiv = document.getElementById("content");
  
  fetch("about.html")
    .then(response => response.text())
    .then(data => {
      contentDiv.innerHTML = data;
      contentDiv.scrollTop = 0;
    }).catch(error => console.error("Error loading about content:", error));
}

function loadChapter(chapterNumber) {
  currentChapter = chapterNumber;
  const contentDiv = document.getElementById("content");
  
  let chapterFile;
  if (currentSection === 'algorithms') {
    // Handle special chapter naming for algorithms book
    if (chapterNumber === 'a0') {
      chapterFile = `chapters/algorithms/a0.html`;
    } else if (typeof chapterNumber === 'string' && chapterNumber.startsWith('n')) {
      chapterFile = `chapters/algorithms/${chapterNumber}.html`;
    } else {
      const formattedChapterNumber = chapterNumber.toString().padStart(2, "0");
      chapterFile = `chapters/algorithms/${formattedChapterNumber}.html`;
    }
  } else {
    // For history section
    const formattedChapterNumber = chapterNumber.toString().padStart(2, "0");
    chapterFile = `chapters/history/${formattedChapterNumber}.html`;
  }

  fetch(chapterFile)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Chapter ${chapterNumber} not found`);
      }
      return response.text();
    })
    .then(data => {
      contentDiv.innerHTML = data;
      contentDiv.scrollTop = 0;
      
      // Show TOC content if chapter 0
      if (chapterNumber === 0 || chapterNumber === '0') {
        loadTOC(currentSection);
      }
      
      // Update URL
      history.pushState({}, "", `?section=${currentSection}&chapter=${chapterNumber}`);
    })
    .catch(error => {
      console.error("Error loading chapter:", error);
      contentDiv.innerHTML = `<h2>Chapter ${chapterNumber}</h2><p>This chapter is not yet available.</p>`;
    });
}

function loadLogo() {
  // Load SVG logo into both mobile and desktop logo containers
  fetch("SVG/Asset 1.svg")
    .then(response => response.text())
    .then(svgData => {
      document.querySelector('.mobile-logo').innerHTML = svgData;
      // For header logo, preserve the subtitle
      const headerLogo = document.querySelector('.header-logo');
      const subtitle = headerLogo.querySelector('.header-subtitle');
      headerLogo.innerHTML = svgData;
      if (subtitle) {
        headerLogo.appendChild(subtitle);
      } else {
        // Create subtitle if it doesn't exist
        const newSubtitle = document.createElement('div');
        newSubtitle.className = 'header-subtitle';
        newSubtitle.textContent = "Richard Qian Li's Site on Algorithms and Urbanism";
        headerLogo.appendChild(newSubtitle);
      }
    })
    .catch(error => {
      console.error("Error loading logo:", error);
      // Fallback to text logo
      const fallbackLogo = '<div style="font-size: 24px; font-weight: bold;">LOGO</div>';
      document.querySelector('.mobile-logo').innerHTML = fallbackLogo;
      
      // For header, preserve subtitle with fallback logo
      const headerLogo = document.querySelector('.header-logo');
      const subtitle = headerLogo.querySelector('.header-subtitle');
      headerLogo.innerHTML = fallbackLogo;
      if (subtitle) {
        headerLogo.appendChild(subtitle);
      } else {
        // Create subtitle if it doesn't exist
        const newSubtitle = document.createElement('div');
        newSubtitle.className = 'header-subtitle';
        newSubtitle.textContent = "Richard Qian Li's Site on Algorithms and Urbanism";
        headerLogo.appendChild(newSubtitle);
      }
    });
}
// loadChapter(0);

document.querySelectorAll(".left-column, .content").forEach((div) => {
  div.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault(); // Prevent default scroll behavior

      var scrollAmount = e.deltaY * 0.6; // Adjust the 0.1 value to control the scroll speed
      this.scrollBy(0, scrollAmount);
    },
    { passive: false }
  );
});

document.addEventListener("keydown", function (event) {
  // Check if the left arrow key (key code 37) was pressed
  if (event.keyCode === 37) {
    // Trigger the click event for the Previous Chapter button
    if (currentChapter > 0) {
      currentChapter -= 1;
      loadChapter(currentChapter);
    } else {
      console.log("Already at the first chapter");
    }
  }

  // Check if the right arrow key (key code 39) was pressed
  if (event.keyCode === 39) {
    // Trigger the click event for the Next Chapter button
    if (currentChapter < 38) {
      currentChapter += 1;
      loadChapter(currentChapter);
    } else {
      console.log("Already at the last chapter");
    }
  }
});
