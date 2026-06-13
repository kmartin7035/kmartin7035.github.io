const siteConfig = window.authorSiteConfig;

if (!siteConfig) {
    throw new Error("Missing authorSiteConfig. Load site-config.js before script.js.");
}

const terminalViews = [
    { key: "bio", label: "bio" },
    { key: "works", label: "works" },
    { key: "server", label: "server" },
    { key: "mail", label: "mail" }
];

const terminalTitle = document.getElementById("terminal-title");
const terminalName = document.getElementById("terminal-name");
const jellyfishArt = document.getElementById("jellyfish-art");
const sessionTranscript = document.getElementById("session-transcript");
const welcomeBox = document.getElementById("welcome-box");
const promptText = document.getElementById("prompt-text");
const terminalDivider = document.getElementById("terminal-divider");
const recordNav = document.getElementById("record-nav");
const recordPanels = document.getElementById("record-panels");

let activeView = null;

function applySiteChrome() {
    document.title = siteConfig.meta.pageTitle;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
        description.setAttribute("content", siteConfig.meta.description);
    }

    if (terminalTitle) {
        terminalTitle.textContent = siteConfig.terminal.windowTitle;
    }
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatLastLogin(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `Last login: ${days[date.getDay()]} ${months[date.getMonth()]} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} on tty1`;
}

function buildHashBox(lines) {
    const contentLines = lines.map((line) => String(line));
    const verticalBeam = "###";
    const horizontalPadding = 2;
    const contentWidth = Math.max(...contentLines.map((line) => line.length), 0);
    const interiorWidth = contentWidth + (horizontalPadding * 2);
    const horizontalRule = "#".repeat(interiorWidth + (verticalBeam.length * 2));

    return [
        horizontalRule,
        ...contentLines.map((line) => `${verticalBeam}${" ".repeat(horizontalPadding)}${line.padEnd(contentWidth, " ")}${" ".repeat(horizontalPadding)}${verticalBeam}`),
        horizontalRule
    ].join("\n");
}

function createParagraph(text, className = "record-copy") {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
}

function createExternalLink(href, text, className = "record-link") {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = text;
    return link;
}

function renderBioContent() {
    const wrapper = document.createElement("div");
    wrapper.className = "record-copy-stack";
    wrapper.appendChild(createParagraph(siteConfig.bio.text));
    return wrapper;
}

function renderWorksContent() {
    const wrapper = document.createElement("div");
    wrapper.className = "record-copy-stack";

    siteConfig.works.sections.forEach((section) => {
        const works = siteConfig.works.items.filter((item) => item.section === section.key);

        if (!works.length) {
            return;
        }

        const block = document.createElement("section");
        block.className = "works-section";

        const list = document.createElement("ul");
        list.className = "works-list";

        works.forEach((work) => {
            const item = document.createElement("li");
            item.className = "works-item";

            const titleNode = work.link
                ? createExternalLink(work.link, work.title, "record-link")
                : document.createElement("span");

            if (!work.link) {
                titleNode.textContent = work.title;
            }

            const metaBits = [work.year, work.descriptor].filter(Boolean).join(" // ");
            item.append(titleNode);

            if (metaBits) {
                const descriptor = document.createElement("span");
                descriptor.className = "works-meta";
                descriptor.textContent = `- ${metaBits}`;
                item.appendChild(descriptor);
            }

            list.appendChild(item);
        });

        block.appendChild(list);
        wrapper.appendChild(block);
    });

    return wrapper;
}

function renderServerContent() {
    const wrapper = document.createElement("div");
    wrapper.className = "record-copy-stack";
    wrapper.appendChild(createParagraph(siteConfig.system.description));

    const invite = document.createElement("p");
    invite.className = "record-copy";
    invite.append("invite :: ", createExternalLink(siteConfig.system.link, siteConfig.system.label || siteConfig.system.link));
    wrapper.appendChild(invite);

    return wrapper;
}

function renderMailContent() {
    const wrapper = document.createElement("div");
    wrapper.className = "record-copy-stack";

    const line = document.createElement("p");
    line.className = "record-copy";
    line.append(`${siteConfig.msg.text} `, createExternalLink(siteConfig.msg.href, siteConfig.msg.label));
    wrapper.appendChild(line);

    return wrapper;
}

function renderPanelContent(view) {
    switch (view) {
        case "works":
            return renderWorksContent();
        case "server":
            return renderServerContent();
        case "mail":
            return renderMailContent();
        case "bio":
        default:
            return renderBioContent();
    }
}

function resolveInitialView() {
    const url = new URL(window.location.href);
    const requestedView = (url.searchParams.get("view") || url.hash.replace("#", "") || "").toLowerCase();
    return terminalViews.some((view) => view.key === requestedView) ? requestedView : null;
}

function updateViewUrl(view) {
    const url = new URL(window.location.href);

    if (view) {
        url.searchParams.set("view", view);
    } else {
        url.searchParams.delete("view");
        url.hash = "";
    }

    window.history.replaceState({}, "", url);
}

function syncPanelHeights() {
    const panels = recordPanels?.querySelectorAll(".record-panel") || [];

    panels.forEach((panel) => {
        const inner = panel.querySelector(".record-panel__inner");
        const isOpen = panel.dataset.view === activeView;
        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
        panel.style.maxHeight = isOpen && inner ? `${inner.scrollHeight}px` : "0px";
    });
}

function setActiveView(view) {
    activeView = view;

    const triggers = recordNav?.querySelectorAll("[data-view]") || [];
    triggers.forEach((trigger) => {
        const isActive = trigger.dataset.view === activeView;
        trigger.setAttribute("aria-expanded", String(isActive));
        trigger.setAttribute("aria-pressed", String(isActive));
        trigger.classList.toggle("is-active", isActive);
    });

    syncPanelHeights();
    updateViewUrl(activeView);
}

function renderRecordNav() {
    if (!recordNav) {
        return;
    }

    recordNav.innerHTML = "";

    terminalViews.forEach((view) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "record-trigger";
        button.dataset.view = view.key;
        button.setAttribute("aria-controls", `panel-${view.key}`);
        button.textContent = view.label;
        recordNav.appendChild(button);
    });
}

function renderRecordPanels() {
    if (!recordPanels) {
        return;
    }

    recordPanels.innerHTML = "";

    terminalViews.forEach((view) => {
        const panel = document.createElement("section");
        panel.className = "record-panel";
        panel.dataset.view = view.key;
        panel.id = `panel-${view.key}`;

        const inner = document.createElement("div");
        inner.className = "record-panel__inner";
        inner.appendChild(renderPanelContent(view.key));

        panel.appendChild(inner);
        recordPanels.appendChild(panel);
    });
}

function renderStaticShell() {
    if (terminalName) {
        terminalName.textContent = siteConfig.terminal.titleAscii.trim();
    }

    if (jellyfishArt) {
        jellyfishArt.textContent = siteConfig.terminal.jellyfishAscii.trim();
    }

    if (sessionTranscript) {
        sessionTranscript.textContent = [
            siteConfig.terminal.ttyLine,
            `${siteConfig.terminal.sessionHost} login: ${siteConfig.terminal.promptUser}`,
            `Password: ${siteConfig.terminal.passwordMask}`,
            formatLastLogin(new Date())
        ].join("\n");
    }

    if (welcomeBox) {
        welcomeBox.textContent = buildHashBox(siteConfig.terminal.welcomeBox.lines);
    }

    if (promptText) {
        promptText.textContent = siteConfig.terminal.commandPrompt;
    }

    if (terminalDivider) {
        terminalDivider.textContent = "-".repeat(siteConfig.terminal.dividerLength);
    }
}

applySiteChrome();
renderStaticShell();
renderRecordNav();
renderRecordPanels();
setActiveView(resolveInitialView());

document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) {
        return;
    }

    const requestedView = trigger.dataset.view || null;
    setActiveView(requestedView === activeView ? null : requestedView);
});

window.addEventListener("resize", () => {
    syncPanelHeights();
});

window.addEventListener("load", () => {
    syncPanelHeights();
});
