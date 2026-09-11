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

const AI_CHAT_ENDPOINT =
    "https://boskolab-ai-assistant.boskoj23.workers.dev/chat";

const AI_CHAT_STORAGE_KEY = "boskolab-ai-chat-history";

const aiChat = document.querySelector(".ai-chat");
const aiChatToggle = document.querySelector(".ai-chat-toggle");
const aiChatPanel = document.querySelector(".ai-chat-panel");
const aiChatMinimize = document.querySelector(".ai-chat-minimize");
const aiChatClose = document.querySelector(".ai-chat-close");
const aiChatBody = document.querySelector(".ai-chat-body");
const aiChatInput = document.querySelector("#ai-chat-input");
const aiChatForm = document.querySelector(".ai-chat-form");
const aiChatSend = aiChatForm?.querySelector('button[type="submit"]');
const aiChatSuggestions = document.querySelectorAll(
    ".ai-chat-suggestions button"
);

let aiChatBusy = false;
let aiChatHistory = [];

const loadAiChatHistory = () => {
    try {
        const storedHistory = sessionStorage.getItem(
            AI_CHAT_STORAGE_KEY
        );

        if (!storedHistory) {
            return [];
        }

        const parsedHistory = JSON.parse(storedHistory);

        if (!Array.isArray(parsedHistory)) {
            return [];
        }

        return parsedHistory.filter((message) => {
            return (
                message &&
                typeof message.text === "string" &&
                (
                    message.type === "user" ||
                    message.type === "assistant"
                )
            );
        });
    } catch (error) {
        return [];
    }
};

const saveAiChatHistory = () => {
    try {
        sessionStorage.setItem(
            AI_CHAT_STORAGE_KEY,
            JSON.stringify(aiChatHistory)
        );
    } catch (error) {
        // Ignore storage errors so the chatbot can still work normally.
    }
};

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

const scrollAiChatToBottom = () => {
    if (aiChatBody) {
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }
};

const addAiMessage = (text, type) => {
    if (!aiChatBody) {
        return null;
    }

    const message = document.createElement("div");
    message.className = `ai-message ai-message-${type}`;
    message.textContent = text;

    const suggestions = aiChatBody.querySelector(
        ".ai-chat-suggestions"
    );

    if (suggestions) {
        aiChatBody.insertBefore(message, suggestions);
    } else {
        aiChatBody.appendChild(message);
    }

    scrollAiChatToBottom();

    return message;
};

const restoreAiChatHistory = () => {
    aiChatHistory = loadAiChatHistory();

    if (!aiChatHistory.length) {
        return;
    }

    aiChatHistory.forEach((message) => {
        addAiMessage(message.text, message.type);
    });
};

const setAiChatBusy = (isBusy) => {
    aiChatBusy = isBusy;

    if (aiChatInput) {
        aiChatInput.disabled = isBusy;
    }

    if (aiChatSend) {
        aiChatSend.disabled = isBusy;
    }

    aiChatSuggestions.forEach((button) => {
        button.disabled = isBusy;
    });
};

const sendAiMessage = async (messageText) => {
    const message = messageText.trim();

    if (!message || aiChatBusy) {
        return;
    }

    setAiChatOpen(true);
    addAiMessage(message, "user");

    if (aiChatInput) {
        aiChatInput.value = "";
    }

    setAiChatBusy(true);

    const thinkingMessage = addAiMessage("", "assistant");

    if (thinkingMessage) {
        thinkingMessage.classList.add("ai-message-typing");
        thinkingMessage.setAttribute(
            "aria-label",
            "BoskoLab AI is typing"
        );

        for (let i = 0; i < 3; i += 1) {
            const dot = document.createElement("span");
            dot.className = "ai-typing-dot";
            thinkingMessage.appendChild(dot);
        }
    }

    try {
        const response = await fetch(AI_CHAT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message
            })
        });

        const data = await response.json();

        if (!response.ok || !data.reply) {
            throw new Error(
                data.error || "AI request failed."
            );
        }

        if (thinkingMessage) {
            thinkingMessage.classList.remove(
                "ai-message-typing"
            );
            thinkingMessage.removeAttribute("aria-label");
            thinkingMessage.textContent = data.reply;
        }

        aiChatHistory.push(
            {
                text: message,
                type: "user"
            },
            {
                text: data.reply,
                type: "assistant"
            }
        );

        saveAiChatHistory();
    } catch (error) {
        if (thinkingMessage) {
            thinkingMessage.classList.remove(
                "ai-message-typing"
            );
            thinkingMessage.removeAttribute("aria-label");
            thinkingMessage.textContent =
                "Sorry, the BoskoLab AI Assistant is temporarily unavailable. Please try again.";
        }
    } finally {
        setAiChatBusy(false);
        scrollAiChatToBottom();

        if (aiChatInput) {
            aiChatInput.focus();
        }
    }
};

restoreAiChatHistory();

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
            sendAiMessage(button.textContent.trim());
        });
    });

    if (aiChatForm) {
        aiChatForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (aiChatInput) {
                sendAiMessage(aiChatInput.value);
            }
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
