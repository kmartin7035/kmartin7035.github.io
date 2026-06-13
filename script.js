const siteConfig = window.authorSiteConfig;

if (!siteConfig) {
    throw new Error("Missing authorSiteConfig. Load site-config.js before script.js.");
}

const terminalTitle = document.getElementById("terminal-title");
const terminalName = document.getElementById("terminal-name");
const jellyfishArt = document.getElementById("jellyfish-art");
const sessionTranscript = document.getElementById("session-transcript");
const welcomeBox = document.getElementById("welcome-box");
const promptText = document.getElementById("prompt-text");
const terminalDivider = document.getElementById("terminal-divider");
const recordNav = document.getElementById("record-nav");
const recordPanels = document.getElementById("record-panels");

const enhancedClassName = "js-enhanced";
let activeView = null;

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

function getViews() {
    return Array.from(recordNav?.querySelectorAll("[data-view]") || [])
        .map((trigger) => trigger.dataset.view || "")
        .filter(Boolean);
}

function applySiteChrome() {
    if (terminalTitle) {
        terminalTitle.textContent = siteConfig.terminal.windowTitle;
    }
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

function resolveInitialView(views) {
    const url = new URL(window.location.href);
    const requestedView = (url.searchParams.get("view") || url.hash.replace("#", "") || "").toLowerCase();
    return views.includes(requestedView) ? requestedView : null;
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
    const isEnhanced = document.documentElement.classList.contains(enhancedClassName);

    panels.forEach((panel) => {
        const inner = panel.querySelector(".record-panel__inner");
        const isOpen = panel.dataset.view === activeView;

        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));

        if (isEnhanced && inner) {
            panel.style.maxHeight = isOpen ? `${inner.scrollHeight}px` : "0px";
        } else {
            panel.style.maxHeight = "";
        }
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

function initProgressiveEnhancement() {
    const views = getViews();
    const fallbackView = views.includes("bio") ? "bio" : (views[0] || null);

    document.documentElement.classList.add(enhancedClassName);
    setActiveView(resolveInitialView(views) || fallbackView);
}

applySiteChrome();
renderStaticShell();
initProgressiveEnhancement();

document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger || !recordNav?.contains(trigger)) {
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
