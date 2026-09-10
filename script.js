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


// BoskoLab AI Assistant

const aiChat = document.querySelector(".ai-chat");
const aiChatToggle = document.querySelector(".ai-chat-toggle");
const aiChatPanel = document.querySelector(".ai-chat-panel");
const aiChatMinimize = document.querySelector(".ai-chat-minimize");
const aiChatClose = document.querySelector(".ai-chat-close");
const aiChatInput = document.querySelector("#ai-chat-input");
const aiChatForm = document.querySelector(".ai-chat-form");
const aiChatSuggestions = document.querySelectorAll(
    ".ai-chat-suggestions button"
);

const setAiChatOpen = (isOpen) => {
    if (!aiChat || !aiChatToggle || !aiChatPanel) {
        return;
    }

    aiChatPanel.classList.toggle("is-open", isOpen);
    aiChatPanel.setAttribute("aria-hidden", String(!isOpen));
    aiChatToggle.setAttribute("aria-expanded", String(isOpen));

    if (isOpen && aiChatInput) {
        aiChatInput.focus();
    }
};

if (aiChat && aiChatToggle && aiChatPanel) {
    aiChatToggle.addEventListener("click", () => {
        const isOpen =
            aiChatToggle.getAttribute("aria-expanded") === "true";

        setAiChatOpen(!isOpen);
    });

    if (aiChatMinimize) {
        aiChatMinimize.addEventListener("click", () => {
            setAiChatOpen(false);
            aiChatToggle.focus();
        });
    }

    if (aiChatClose) {
        aiChatClose.addEventListener("click", () => {
            setAiChatOpen(false);
            aiChat.hidden = true;
        });
    }

    aiChatSuggestions.forEach((button) => {
        button.addEventListener("click", () => {
            if (!aiChatInput) {
                return;
            }

            aiChatInput.value = button.textContent.trim();
            aiChatInput.focus();
        });
    });

    if (aiChatForm) {
        aiChatForm.addEventListener("submit", (event) => {
            event.preventDefault();
        });
    }

    window.addEventListener("keydown", (event) => {
        const isOpen =
            aiChatToggle.getAttribute("aria-expanded") === "true";

        if (event.key === "Escape" && isOpen) {
            setAiChatOpen(false);
            aiChatToggle.focus();
        }
    });
}
