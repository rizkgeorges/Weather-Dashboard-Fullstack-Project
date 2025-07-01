// ========== Mobile Sidebar ==========
(function() {
  const sidebar = document.getElementById('mobileSidebar');
  const openBtn = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('closeMobileSidebar');
  const body = document.body;
  
  if (openBtn && sidebar) {
    openBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('open');
      sidebar.classList.toggle('open');
      body.classList.toggle('sidebar-open');
    });
  }
  
  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      body.classList.remove('sidebar-open');
    });
  }
  
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        body.classList.remove('sidebar-open');
      }
    }
  });
})();

// ========== Custom Smooth Scroll-to-Top Button ==========
// Smoothly scrolls to the top of the page
function smoothScrollToTop() {
  const startPosition = window.pageYOffset;
  const distance = -startPosition;
  const duration = 1200;
  let start = null;

  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  requestAnimationFrame(animation);
}

// ========== Weather Dashboard ==========
// Handles fetching and displaying weather data for multiple cities
class WeatherDashboard {
  constructor() {
    // List of cities to display in the dashboard
    this.cities = [
      { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
      { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', country: 'JP', lat: 35.6895, lon: 139.6917 },
      { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
      { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
      { name: 'Rio de Janeiro', country: 'BR', lat: -22.9068, lon: -43.1729 }
    ];
    this.weatherCards = document.getElementById('weather-cards');
    this.loading = document.getElementById('weather-loading');
    this.modal = document.getElementById('weatherModal');
    this.modalBody = document.getElementById('weatherModalBody');
    if (this.weatherCards) {
      this.fetchWeather();
    }
  }
  // Fetches weather data for all cities using Open-Meteo API
  async fetchWeather() {
    this.loading.style.display = 'block';
    this.weatherCards.innerHTML = '';
    try {
      const promises = this.cities.map(city =>
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
          .then(res => res.json())
          .then(data => {
            return data;
          })
      );
      const data = await Promise.all(promises);
      this.renderCards(data);
    } catch (err) {
      this.weatherCards.innerHTML = `<div class="alert alert-danger">Failed to load weather data. Please try again later.</div>`;
    } finally {
      this.loading.style.display = 'none';
    }
  }
  // Renders weather cards for each city
  renderCards(data) {
    this.weatherCards.innerHTML = '';
    data.forEach((cityData, idx) => {
      if (!cityData.current_weather) {
        this.weatherCards.innerHTML += `
          <div class="col-md-4">
            <div class="card border-danger">
              <div class="card-body">
                <h5 class="card-title">${this.cities[idx].name}</h5>
                <p class="card-text text-danger">Error: No data available</p>
              </div>
            </div>
          </div>
        `;
        return;
      }
      this.weatherCards.innerHTML += `
        <div class="col-md-4">
          <div class="card weather-card" data-city-idx="${idx}">
            <div class="card-body">
              <h5 class="card-title">${this.cities[idx].name}, ${this.cities[idx].country}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${this.getWeatherDescription(cityData.current_weather.weathercode)}</h6>
              <p class="card-text display-6">${Math.round(cityData.current_weather.temperature)}&deg;C</p>
              <p class="card-text"><i class="bi bi-wind"></i> ${cityData.current_weather.windspeed} km/h</p>
              <p class="card-text"><i class="bi bi-thermometer-half"></i> Max: ${Math.round(cityData.daily.temperature_2m_max[0])}&deg;C, Min: ${Math.round(cityData.daily.temperature_2m_min[0])}&deg;C</p>
            </div>
          </div>
        </div>
      `;
    });
    // Add event listeners for modals
    document.querySelectorAll('.weather-card').forEach(card => {
      card.addEventListener('click', (e) => this.showDetails(e.currentTarget.dataset.cityIdx));
    });
  }
  // Maps weather codes to human-readable descriptions
  getWeatherDescription(code) {
    // Open-Meteo weathercode mapping (simplified)
    const map = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Dense drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Slight rain',
      63: 'Rain',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Freezing rain',
      71: 'Slight snow',
      73: 'Snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm w/ hail',
      99: 'Thunderstorm w/ heavy hail'
    };
    return map[code] || 'Unknown';
  }
  // Shows detailed 7-day forecast in a modal for a city
  async showDetails(cityIdx) {
    const city = this.cities[cityIdx];
    this.modalBody.innerHTML = `<div class="text-center my-4"><div class="spinner-border text-primary"></div><p>Loading details...</p></div>`;
    const modal = new bootstrap.Modal(this.modal);
    modal.show();
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await res.json();
      if (!data.daily) {
        this.modalBody.innerHTML = `<div class="alert alert-danger">Failed to load forecast: No data available</div>`;
        return;
      }
      // Weather code to emoji/icon mapping (simple fallback)
      const codeToIcon = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌧️', 57: '🌧️',
        61: '🌦️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '❄️', 77: '❄️',
        80: '🌦️', 81: '🌧️', 82: '🌧️', 85: '🌨️', 86: '🌨️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
      };
      // Helper: animated weather markup
      function getWeatherAnimation(code) {
        if ([0, 1].includes(code)) {
          // Sun animation
          return `<div class="mini-anim sun-anim"><div class="mini-sun"></div></div>`;
        } else if ([2, 3, 45, 48].includes(code)) {
          // Cloud animation
          return `<div class="mini-anim cloud-anim"><div class="mini-cloud"></div></div>`;
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
          // Rain animation
          return `<div class="mini-anim rain-anim"><div class="mini-cloud"></div><div class="mini-rain"></div></div>`;
        } else if ([95, 96, 99].includes(code)) {
          // Thunderstorm animation
          return `<div class="mini-anim storm-anim"><div class="mini-cloud"></div><div class="mini-lightning"></div></div>`;
        } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
          // Snow animation
          return `<div class="mini-anim snow-anim"><div class="mini-cloud"></div><div class="mini-snow"></div></div>`;
        }
        return '';
      }
      let forecastHtml = `<h5 class="mb-4">7-Day Forecast for ${city.name}</h5><div class="row row-cols-1 row-cols-md-4 g-3 justify-content-center">`;
      for (let i = 0; i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i]);
        const day = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const icon = codeToIcon[data.daily.weathercode[i]] || '❓';
        const anim = getWeatherAnimation(data.daily.weathercode[i]);
        forecastHtml += `
          <div class="col">
            <div class="card shadow-sm h-100 text-center forecast-card">
              <div class="card-body py-3">
                <div class="mb-2">${anim}</div>
                <div class="mb-2" style="font-size:2rem;">${icon}</div>
                <h6 class="card-title mb-1">${day}</h6>
                <div class="mb-1"><span class="fw-bold">${Math.round(data.daily.temperature_2m_max[i])}°C</span> / <span class="text-muted">${Math.round(data.daily.temperature_2m_min[i])}°C</span></div>
                <div class="small text-muted">${this.getWeatherDescription(data.daily.weathercode[i])}</div>
              </div>
            </div>
          </div>
        `;
      }
      forecastHtml += `</div>`;
      this.modalBody.innerHTML = forecastHtml;
    } catch (err) {
      this.modalBody.innerHTML = `<div class="alert alert-danger">Failed to load forecast details.</div>`;
    }
  }
}

// ================= FeaturedCarousel =================
// Fetches and displays featured city images from Unsplash API
class FeaturedCarousel {
  constructor() {
    this.carousel = document.getElementById('carouselImages');
    this.apiKey = 'LhvKfZKsQ3pCj4bDBvD4uOyKYzUxsk0DbczZz3l4KXI'; // <-- Insert your Unsplash API key
    if (this.carousel) {
      this.fetchImages();
    }
  }
  // Fetches images from Unsplash API
  async fetchImages() {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=cityscape&per_page=5&client_id=${this.apiKey}`);
      const data = await res.json();
      this.renderImages(data.results);
    } catch (err) {
      this.carousel.innerHTML = `<div class="carousel-item active"><div class="text-center p-5">Failed to load images.</div></div>`;
    }
  }
  // Renders carousel images
  renderImages(images) {
    if (!images || images.length === 0) {
      this.carousel.innerHTML = `<div class="carousel-item active"><div class="text-center p-5">No images found.</div></div>`;
      return;
    }
    this.carousel.innerHTML = images.map((img, idx) => `
      <div class="carousel-item${idx === 0 ? ' active' : ''}">
        <img src="${img.urls.regular}" class="d-block w-100" alt="${img.alt_description || 'Cityscape'}">
        <div class="carousel-caption d-none d-md-block">
          <h5>${img.alt_description || 'Cityscape'}</h5>
        </div>
      </div>
    `).join('');
  }
}

// ================= Gallery =================
// Handles gallery card setup, image loading, and modals
class Gallery {
  constructor() {
    this.init();
  }

  // Initializes gallery cards and image loading
  init() {
    this.setupGalleryCards();
    this.setupImageLoading();
  }

  // Sets up gallery card click/keyboard events
  setupGalleryCards() {
    const galleryCards = document.querySelectorAll('.gallery-card');
    
    galleryCards.forEach(card => {
      // Add click handler for view details
      const viewBtn = card.querySelector('.gallery-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showImageDetails(card);
        });
      }

      // Add click handler for the entire card
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('gallery-btn')) {
          this.showImageModal(card);
        }
      });

      // Add keyboard navigation
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.showImageModal(card);
        }
      });

      // Make cards focusable
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${card.querySelector('h3')?.textContent || 'image'} details`);
    });
  }

  // Handles image loading states and errors
  setupImageLoading() {
    const images = document.querySelectorAll('.gallery-image');
    
    images.forEach(img => {
      const card = img.closest('.gallery-card');
      
      // Add loading state
      card.classList.add('loading');
      
      img.addEventListener('load', () => {
        card.classList.remove('loading');
        card.style.opacity = '1';
      });
      
      img.addEventListener('error', () => {
        card.classList.remove('loading');
        card.style.opacity = '0.7';
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTI3LjYxNCA2MCAxNTAgODIuMzg2IDE1MCAxMTBDMTUwIDEzNy42MTQgMTI3LjYxNCAxNjAgMTAwIDE2MEM3Mi4zODYgMTYwIDUwIDEzNy42MTQgNTAgMTEwQzUwIDgyLjM4NiA3Mi4zODYgNjAgMTAwIDYwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K';
      });
    });
  }

  // Shows image details in an alert (can be enhanced to modal)
  showImageDetails(card) {
    const city = card.dataset.city;
    const title = card.querySelector('h3')?.textContent || 'City';
    const description = card.querySelector('p')?.textContent || 'Beautiful cityscape';
    
    // Create a simple alert for now - you can enhance this with a modal
    alert(`${title}\n\n${description}\n\nCity: ${city.charAt(0).toUpperCase() + city.slice(1)}`);
  }

  // Shows image modal with details
  showImageModal(card) {
    const img = card.querySelector('.gallery-image');
    const title = card.querySelector('h3')?.textContent || 'City';
    const description = card.querySelector('p')?.textContent || 'Beautiful cityscape';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <div class="gallery-modal-content">
        <div class="gallery-modal-header">
          <h3>${title}</h3>
          <button class="gallery-modal-close">&times;</button>
        </div>
        <div class="gallery-modal-body">
          <img src="${img.src}" alt="${img.alt}" class="gallery-modal-image">
          <p>${description}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.gallery-modal-close');
    closeBtn.addEventListener('click', () => this.closeModal(modal));
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
    
    // Add escape key listener
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Closes the image modal
  closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
}

// ================= ContactForm =================
// Handles multi-step contact form, validation, and alerts
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.alert = document.getElementById('formAlert');
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  // Handles form submission, shows alert, and resets form
  handleSubmit(e) {
    e.preventDefault();
    // Show success alert
    if (this.alert) {
      this.alert.className = 'alert alert-success form-alert-fade';
      this.alert.textContent = 'Message sent successfully!';
      this.alert.classList.remove('d-none');
      setTimeout(() => {
        this.alert.classList.add('d-none');
      }, 3500);
    }
    // Clear form fields
    this.form.reset();
    // Remove validation classes if any
    Array.from(this.form.querySelectorAll('.is-valid, .is-invalid')).forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
  }
}

// ================= HeroButton =================
// Adds ripple, click, and hover effects to hero button
class HeroButton {
  constructor() {
    this.button = document.querySelector('.hero-btn');
    this.init();
  }

  // Initializes button effects
  init() {
    if (this.button) {
      this.addRippleEffect();
      this.addClickAnimation();
      this.addHoverEffects();
    }
  }

  // Adds ripple effect on click
  addRippleEffect() {
    this.button.addEventListener('click', (e) => {
      // Ripple effect only
      const ripple = document.createElement('span');
      const rect = this.button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      this.button.appendChild(ripple);
      setTimeout(() => { ripple.remove(); }, 600);
    });
  }

  // Adds click animation
  addClickAnimation() {
    this.button.addEventListener('mousedown', () => {
      this.button.style.transform = 'translateY(-2px) scale(0.98)';
    });

    this.button.addEventListener('mouseup', () => {
      this.button.style.transform = 'translateY(-5px) scale(1.05)';
    });

    this.button.addEventListener('mouseleave', () => {
      this.button.style.transform = '';
    });
  }

  // Adds hover particle effects
  addHoverEffects() {
    this.button.addEventListener('mouseenter', () => {
      this.createFloatingParticles();
    });
  }

  // Creates floating particles on hover
  createFloatingParticles() {
    const container = this.button.closest('.hero-btn-container');
    if (!container) return;
    for (let i = 0; i < 3; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      const left = Math.round(Math.random() * 100) + '%';
      particle.style.cssText = 'position: absolute;width: 6px;height: 6px;background: linear-gradient(45deg, #63a4ff, #42a5f5);border-radius: 50%;pointer-events: none;z-index: 1000;left: ' + left + ';top: 100%;animation: particleFloatUp 2s ease-out forwards;';
      container.appendChild(particle);
      setTimeout(function() { particle.remove(); }, 2000);
    }
  }
}

// Add CSS for floating particles
const particleStyles = `
  @keyframes particleFloatUp {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0);
    }
  }
  
  .floating-particle {
    box-shadow: 0 0 10px rgba(99, 164, 255, 0.6);
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = particleStyles;
document.head.appendChild(styleSheet);

// Initialize hero button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HeroButton();
  
  // Initialize weather animation
  initWeatherAnimation();
  
  // Initialize smooth scrolling for all navigation
  initSmoothScrolling();

  new ContactForm();
});

// ========== Weather Animation Initialization ==========
// Animates weather elements in the hero section
function initWeatherAnimation() {
  const container = document.querySelector('.weather-container');
  if (!container) return; // Only run if container exists
  
  // Check if weather elements exist
  const sun = container.querySelector('.sun');
  const clouds = container.querySelectorAll('.cloud');
  const lightning = container.querySelector('.lightning');
  const weatherInfo = container.querySelector('.weather-info');
  
  // Create rain drops dynamically
  function createRain() {
    const container = document.querySelector('.weather-container');
    if (!container) {
      return;
    }
    
    const rainDrop = document.createElement('div');
    rainDrop.className = 'rain';
    rainDrop.style.left = Math.random() * 100 + '%';
    rainDrop.style.animationDelay = Math.random() * 2 + 's';
    rainDrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
    container.appendChild(rainDrop);
    
    setTimeout(() => {
      if (rainDrop.parentNode) {
        rainDrop.parentNode.removeChild(rainDrop);
      }
    }, 2000);
  }
  
  // Start creating rain drops
  setInterval(createRain, 100);
  
  // Weather condition cycling
  const conditions = [
    { temp: '22°C', condition: 'Partly Cloudy' },
    { temp: '18°C', condition: 'Light Rain' },
    { temp: '25°C', condition: 'Sunny' },
    { temp: '16°C', condition: 'Stormy' }
  ];
  
  let currentCondition = 0;
  setInterval(() => {
    currentCondition = (currentCondition + 1) % conditions.length;
    const tempElement = document.querySelector('.weather-container .temp');
    const conditionElement = document.querySelector('.weather-container .condition');
    if (tempElement && conditionElement) {
      tempElement.textContent = conditions[currentCondition].temp;
      conditionElement.textContent = conditions[currentCondition].condition;
    }
  }, 6000);
  
  // Dynamic cloud generation
  function createRandomCloud() {
    const container = document.querySelector('.weather-container');
    if (!container) return;
    
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const size = Math.random() * 60 + 40;
    cloud.style.width = size + 'px';
    cloud.style.height = size * 0.6 + 'px';
    cloud.style.top = Math.random() * 150 + 50 + 'px';
    cloud.style.left = '-100px';
    cloud.style.animation = `floatRight ${Math.random() * 10 + 15}s linear infinite`;
    cloud.style.opacity = Math.random() * 0.3 + 0.6;
    container.appendChild(cloud);
    
    setTimeout(() => {
      if (cloud.parentNode) {
        cloud.parentNode.removeChild(cloud);
      }
    }, 25000);
  }
  
  setInterval(createRandomCloud, 8000);
}

// ========== Smooth Scrolling for Navigation ==========
// Enables smooth scrolling for all navigation links
function initSmoothScrolling() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        smoothScrollToElement(targetElement);
      }
    });
  });
  
  // Also handle navigation links to other pages with smooth scroll
  const pageLinks = document.querySelectorAll('a[href*=".html"]');
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Add smooth transition before page change
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '0.8';
      
      // Reset opacity after a short delay
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  });
}

// ========== Smooth Scroll to Element ==========
// Smoothly scrolls to a specific element and highlights dashboard
function smoothScrollToElement(element) {
  const offsetTop = element.offsetTop - 80; // Account for navbar height
  const startPosition = window.pageYOffset;
  const distance = offsetTop - startPosition;
  const duration = 1200; // 1.2 seconds
  let start = null;
  
  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  // Smooth easing function
  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }
  
  requestAnimationFrame(animation);
  
  // Add highlight effect for dashboard section
  if (element.id === 'dashboard') {
    setTimeout(() => {
      element.classList.add('scroll-highlight');
      setTimeout(() => {
        element.classList.remove('scroll-highlight');
      }, 1500);
    }, duration + 200);
  }
}

// ========== Featured City Panel Update ==========
// Cycles through featured cities and updates the panel
function updateFeaturedCity(idx) {
  const city = featuredCities[idx];
  const iconElem = document.getElementById('featuredWeatherIcon');
  if (iconElem) iconElem.textContent = city.icon;
  const img = document.getElementById('featuredCityImg');
  if (img) {
    img.src = city.img;
    img.alt = city.name;
  }
  const titleElem = document.getElementById('featuredCityTitle');
  if (titleElem) titleElem.innerHTML = `🌟 Featured City: ${city.name}`;
  const descElem = document.getElementById('featuredCityDesc');
  if (descElem) descElem.textContent = city.desc;
  const stats = document.getElementById('featuredCityStats');
  if (stats) stats.innerHTML = city.stats.map(s => `<li>${s}</li>`).join('');
}

// Initialize featured cities
const featuredCities = [
  {
    img: 'Paris.jpg',
    icon: '⛅',
    name: 'Paris',
    desc: 'The City of Light, known for its art, fashion, gastronomy, and culture. Enjoy a live look at the weather in Paris!',
    stats: [
      '<strong>Current:</strong> 18°C, Partly Cloudy',
      '<strong>Humidity:</strong> 62%',
      '<strong>Wind:</strong> 12 km/h'
    ]
  },
  {
    img: 'Tokyo.jpg',
    icon: '🌤️',
    name: 'Tokyo',
    desc: 'A vibrant metropolis blending tradition and technology. Experience Tokyo\'s dynamic weather and skyline!',
    stats: [
      '<strong>Current:</strong> 22°C, Mostly Sunny',
      '<strong>Humidity:</strong> 54%',
      '<strong>Wind:</strong> 9 km/h'
    ]
  },
  {
    img: 'Rio.jpg',
    icon: '🌦️',
    name: 'Rio de Janeiro',
    desc: 'Famous for its beaches and Carnival, Rio offers tropical vibes and stunning views. Check out the weather in Rio!',
    stats: [
      '<strong>Current:</strong> 27°C, Showers',
      '<strong>Humidity:</strong> 78%',
      '<strong>Wind:</strong> 15 km/h'
    ]
  },
  {
    img: 'Tokyo2.jpg',
    icon: '🌧️',
    name: 'Tokyo (Night)',
    desc: 'Tokyo at night is magical, with neon lights and occasional rain. See the city\'s weather after dark!',
    stats: [
      '<strong>Current:</strong> 19°C, Light Rain',
      '<strong>Humidity:</strong> 70%',
      '<strong>Wind:</strong> 7 km/h'
    ]
  }
];

document.addEventListener('DOMContentLoaded', function() {
  // Scroll-to-Top Button
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });
    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToTop();
    });
  }

  // View Dashboard smooth scroll
  const viewDashboardBtn = document.getElementById('viewDashboardBtn');
  if (viewDashboardBtn) {
    viewDashboardBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const dashboard = document.getElementById('dashboard');
      if (dashboard) smoothScrollToElement(dashboard);
    });
  }

  // Auto-update copyright year
  const yearSpan = document.getElementById('copyrightYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Featured City Panel
  let idx = 0;
  if (typeof updateFeaturedCity === 'function') {
    updateFeaturedCity(idx);
    setInterval(() => {
      idx = (idx + 1) % featuredCities.length;
      updateFeaturedCity(idx);
    }, 8000);
  }

  if (document.getElementById('weather-cards')) new WeatherDashboard();
}); 