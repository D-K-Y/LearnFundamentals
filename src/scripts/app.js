document.addEventListener("DOMContentLoaded", () => {
    console.log("Welcome to the main Algorithms and Design Patterns index page!");

    // Dynamic year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Section fade-in animation on scroll
    function revealSections() {
        const sections = document.querySelectorAll('.section-fade');
        const trigger = window.innerHeight * 0.8; // Adjusted trigger point
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < trigger && rect.bottom >= 0) { // Check if section is in viewport
                section.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', revealSections);
    window.addEventListener('load', () => {
        revealSections(); // Initial check on load
        // Smooth scroll for nav links on the main page
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    });
});