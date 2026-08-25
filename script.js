const revealElements = document.querySelectorAll(
    ".services, .projects, .about, .contact, .footer"
);

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});


const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll(
    "#services, #projects, #about, #contact"
);

const navigationObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    link.removeAttribute("aria-current");
                });

                const activeLink = document.querySelector(
                    `.nav-links a[href="#${entry.target.id}"]`
                );

                if (activeLink) {
                    activeLink.classList.add("active");
                    activeLink.setAttribute("aria-current", "page");
                }
            }
        });
    },
    {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
    }
);

sections.forEach((section) => {
    navigationObserver.observe(section);
});

const siteNav = document.querySelector(".site-nav");

const updateNavigationState = () => {
    if (window.scrollY > 20) {
        siteNav.classList.add("scrolled");
    } else {
        siteNav.classList.remove("scrolled");
    }
};

window.addEventListener("scroll", updateNavigationState);

updateNavigationState();
