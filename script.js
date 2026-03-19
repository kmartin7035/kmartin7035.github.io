const siteConfig = window.authorSiteConfig;

if (!siteConfig) {
    throw new Error("Missing authorSiteConfig. Load site-config.js before script.js.");
}

const workSectionsByKey = new Map(siteConfig.works.sections.map((section) => [section.key, section]));
const workSectionsByPath = new Map(siteConfig.works.sections.map((section) => [`/works/${section.fileName}`, section]));
const commandSheet = siteConfig.terminal.commandSheet || {};
const configuredAliases = commandSheet.aliases || {};
const configuredCommands = commandSheet.customCommands || {};
const hiddenFiles = commandSheet.hiddenFiles || [];
const navigationCommands = commandSheet.navigationCommands || {};
const processCommands = commandSheet.processCommands || {};
const removalCommands = commandSheet.removalCommands || {};
const editCommands = commandSheet.editCommands || {};
const writeCommands = commandSheet.writeCommands || {};
const searchCommands = commandSheet.searchCommands || {};
const sudoCommands = commandSheet.sudoCommands || {};
const configuredCommandMap = new Map(
    Object.entries(configuredCommands).map(([command, definition]) => [normalizeLookupValue(command), definition])
);
const removalCommandNames = new Set((removalCommands.names || []).map((command) => normalizeLookupValue(command)));
const editCommandNames = new Set((editCommands.names || []).map((command) => normalizeLookupValue(command)));
const writeCommandNames = new Set((writeCommands.names || []).map((command) => normalizeLookupValue(command)));
const searchCommandNames = new Set((searchCommands.names || []).map((command) => normalizeLookupValue(command)));
const processCommandNames = new Set((processCommands.names || []).map((command) => normalizeLookupValue(command)));

const protocolEntries = [
    {
        label: "bio.txt",
        view: "bio",
        command: "cat /protocols/bio.txt",
        className: "protocol-link protocol-link--file"
    },
    {
        label: "mail.sh",
        view: "mail",
        command: "cat /protocols/mail.sh",
        className: "protocol-link protocol-link--exec"
    },
    {
        label: "server@",
        view: "server",
        command: "open server",
        className: "protocol-link protocol-link--symlink"
    },
    {
        label: "works/",
        view: "works",
        command: "ls /works",
        className: "protocol-link protocol-link--dir"
    }
];

const directories = {
    "/": ["protocols/", "works/"],
    "/protocols": protocolEntries.map((entry) => entry.label),
    "/works": siteConfig.works.sections.map((section) => section.fileName)
};

const commandAliases = Object.fromEntries(
    Object.entries(configuredAliases).map(([command, target]) => [normalizeLookupValue(command), target])
);

const output = document.getElementById("terminal-output");
const form = document.getElementById("terminal-form");
const input = document.getElementById("command-input");
const prompt = document.getElementById("active-prompt");
const tabHint = document.getElementById("tab-hint");
const submitButton = form?.querySelector(".submit-command");
const terminalTitle = document.getElementById("terminal-title");

const typeSettings = {
    bootDelay: 8,
    passwordDelay: 28,
    commandDelay: 9,
    linePause: 85
};

let commandQueue = [];
let isProcessing = false;
let bootComplete = false;
let currentPath = "/";
let viewPanel = null;
let autocompleteState = null;

const builtinCommandNames = ["--help", "help", "pwd", "ls", "cd", "cat", "clear", "open", "ssh", "sudo"];
const commandNameCatalog = Array.from(new Set([
    ...builtinCommandNames,
    ...Array.from(processCommandNames),
    ...Array.from(removalCommandNames),
    ...Array.from(editCommandNames),
    ...Array.from(writeCommandNames),
    ...Array.from(searchCommandNames),
    ...Object.keys(configuredAliases).map((command) => command.split(/\s+/)[0]),
    ...Object.keys(configuredCommands).map((command) => command.split(/\s+/)[0])
]));
const pathCompletionCommandNames = new Set([
    "ls",
    "cd",
    "cat",
    ...Array.from(removalCommandNames),
    ...Array.from(editCommandNames),
    ...Array.from(writeCommandNames),
    ...Array.from(searchCommandNames)
]);
const openResourceCatalog = ["server", "system"];

const completionCatalog = Array.from(new Set([
    "--help",
    "clear",
    "pwd",
    "ls",
    "ls /",
    "ls /protocols",
    "ls /works",
    "cd /",
    "cd /protocols",
    "cd /works",
    "cat /protocols/bio.txt",
    "cat /protocols/mail.sh",
    ...siteConfig.works.sections.map((section) => `cat /works/${section.fileName}`),
    "open server",
    ...(processCommands.examples || []),
    ...(removalCommands.examples || []),
    ...(editCommands.examples || []),
    ...(writeCommands.examples || []),
    ...(searchCommands.examples || []),
    ...(sudoCommands.examples || []),
    ...Object.keys(configuredAliases),
    ...Object.keys(configuredCommands)
]));

function collectHelpLines(...entries) {
    return entries.reduce((lines, entry) => {
        if (Array.isArray(entry)) {
            return lines.concat(entry.filter(Boolean));
        }

        if (entry) {
            lines.push(entry);
        }

        return lines;
    }, []);
}

function normalizeLookupValue(value = "") {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatTemplate(template, values = {}) {
    return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

function getConfiguredError(key, values, fallback) {
    const template = commandSheet.errors?.[key] || fallback;
    return formatTemplate(template, values);
}

function applySiteChrome() {
    document.title = siteConfig.meta.pageTitle;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
        description.setAttribute("content", siteConfig.meta.description);
    }

    if (terminalTitle) {
        terminalTitle.textContent = siteConfig.terminal.windowTitle;
    }

    if (input && commandSheet.placeholder) {
        input.placeholder = commandSheet.placeholder;
    }
}

function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getLastLoginStamp(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (value) => String(value).padStart(2, "0");
    return `Last login: ${days[date.getDay()]} ${months[date.getMonth()]} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} from 127.0.0.1`;
}

function getCollapsedLoginStamp(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (value) => String(value).padStart(2, "0");
    return `Last login: ${days[date.getDay()]} ${months[date.getMonth()]} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} on ttys008`;
}

function scrollOutputToBottom() {
    output.scrollTop = output.scrollHeight;
}

function setTabHint(text = "") {
    if (tabHint) {
        tabHint.textContent = text;
    }
}

function moveCaretToEnd(element) {
    const length = element.value.length;
    element.setSelectionRange(length, length);
}

function resetAutocompleteState() {
    autocompleteState = null;
}

function getTokenBounds(value, caretPosition = value.length) {
    let start = caretPosition;
    let end = caretPosition;

    while (start > 0 && !/\s/.test(value[start - 1])) {
        start -= 1;
    }

    while (end < value.length && !/\s/.test(value[end])) {
        end += 1;
    }

    return { start, end };
}

function replaceInputRange(value, start, end, replacement) {
    return `${value.slice(0, start)}${replacement}${value.slice(end)}`;
}

function getSharedPrefix(values = []) {
    if (values.length === 0) {
        return "";
    }

    let prefix = values[0];

    values.slice(1).forEach((value) => {
        while (prefix && !value.toLowerCase().startsWith(prefix.toLowerCase())) {
            prefix = prefix.slice(0, -1);
        }
    });

    return prefix;
}

function sortMatches(matches = []) {
    return [...matches].sort((left, right) => left.value.localeCompare(right.value));
}

function getCompletableEntriesForDirectory(path, includeHidden = false) {
    const visibleEntries = {
        "/": ["protocols/", "works/"],
        "/protocols": ["bio.txt", "mail.sh"],
        "/works": siteConfig.works.sections.map((section) => section.fileName)
    };

    const entries = visibleEntries[path] ? [...visibleEntries[path]] : [];
    return entries.concat(getHiddenEntriesForDirectory(path, includeHidden));
}

function getPathCompletionCandidates(rawPrefix = "", options = {}) {
    const { directoriesOnly = false } = options;
    const prefix = rawPrefix || "";
    const isHomeRelative = prefix.startsWith("~/");
    const normalizedPrefix = isHomeRelative ? `/${prefix.slice(2)}` : prefix;
    const isAbsolute = normalizedPrefix.startsWith("/");
    const endsWithSlash = normalizedPrefix.endsWith("/");
    const lastSlashIndex = normalizedPrefix.lastIndexOf("/");

    let basePath = currentPath;
    let fragment = normalizedPrefix;

    if (prefix === "") {
        fragment = "";
    } else if (endsWithSlash) {
        basePath = resolvePath(prefix);
        fragment = "";
    } else if (lastSlashIndex >= 0) {
        const directoryPrefix = prefix.slice(0, lastSlashIndex + 1);
        basePath = resolvePath(directoryPrefix);
        fragment = prefix.slice(lastSlashIndex + 1);
    }

    if (!directories[basePath]) {
        return [];
    }

    const includeHidden = fragment.startsWith(".");
    const typedDirectoryPrefix = prefix === ""
        ? ""
        : endsWithSlash
            ? prefix
            : lastSlashIndex >= 0
                ? prefix.slice(0, lastSlashIndex + 1)
                : "";

    return sortMatches(
        getCompletableEntriesForDirectory(basePath, includeHidden)
            .filter((entry) => !directoriesOnly || entry.endsWith("/"))
            .filter((entry) => entry.toLowerCase().startsWith(fragment.toLowerCase()))
            .map((entry) => ({
                value: `${typedDirectoryPrefix}${entry}`,
                display: `${isAbsolute || isHomeRelative ? "" : "./"}${typedDirectoryPrefix}${entry}`.replace(/^\.\//, ""),
                isDirectory: entry.endsWith("/")
            }))
    );
}

function getCommandCompletionCandidates(fragment = "") {
    return sortMatches(
        commandNameCatalog
            .filter((command) => command.toLowerCase().startsWith(fragment.toLowerCase()))
            .map((command) => ({ value: command, display: command, appendSpace: true }))
    );
}

function getOpenCompletionCandidates(fragment = "") {
    return sortMatches(
        openResourceCatalog
            .filter((resource) => resource.toLowerCase().startsWith(fragment.toLowerCase()))
            .map((resource) => ({ value: resource, display: resource, appendSpace: true }))
    );
}

function getFullCommandCompletionCandidates(fragment = "") {
    const normalizedFragment = normalizeLookupValue(fragment);
    return sortMatches(
        completionCatalog
            .filter((candidate) => normalizeLookupValue(candidate).startsWith(normalizedFragment))
            .map((candidate) => ({ value: candidate, display: candidate, fullCommand: true }))
    );
}

function getCompletionContext() {
    const value = input.value;
    const caret = input.selectionStart ?? value.length;
    const bounds = getTokenBounds(value, caret);
    const token = value.slice(bounds.start, bounds.end);
    const leadingText = value.slice(0, bounds.start);
    const precedingTokens = leadingText.trim() ? leadingText.trim().split(/\s+/) : [];

    return {
        value,
        caret,
        bounds,
        token,
        leadingText,
        trailingText: value.slice(bounds.end),
        precedingTokens,
        isFirstToken: precedingTokens.length === 0,
        commandName: (precedingTokens[0] || "").toLowerCase()
    };
}

function buildCompletionResult() {
    const context = getCompletionContext();
    const trimmedValue = context.value.trim();

    if (!trimmedValue) {
        return { context, mode: "empty", matches: [] };
    }

    if (context.isFirstToken) {
        return {
            context,
            mode: "token",
            label: "command",
            matches: getCommandCompletionCandidates(context.token)
        };
    }

    if (pathCompletionCommandNames.has(context.commandName) && !context.token.startsWith("-")) {
        const matches = getPathCompletionCandidates(context.token, { directoriesOnly: context.commandName === "cd" });
        if (matches.length > 0) {
            return {
                context,
                mode: "token",
                label: "path",
                matches
            };
        }
    }

    if (context.commandName === "open") {
        const matches = getOpenCompletionCandidates(context.token);
        if (matches.length > 0) {
            return {
                context,
                mode: "token",
                label: "resource",
                matches
            };
        }
    }

    return {
        context,
        mode: "full-command",
        label: "command",
        matches: getFullCommandCompletionCandidates(trimmedValue)
    };
}

function describeCompletionMatches(matches = [], label = "command") {
    const preview = matches.slice(0, 4).map((match) => match.display).join("   ");
    const suffix = matches.length > 4 ? "   …" : "";
    return `tab-complete ${label}: ${preview}${suffix}`;
}

function getAutocompleteKey(result) {
    return [
        result.mode,
        result.context.bounds.start,
        result.context.bounds.end,
        result.context.leadingText,
        result.context.trailingText,
        result.matches.map((match) => match.value).join("\u0000")
    ].join("\u0001");
}

function applyTokenCompletion(context, match, appendSpace = false) {
    const suffix = appendSpace && !match.isDirectory && !/^\s/.test(context.trailingText) ? " " : appendSpace && !match.isDirectory ? " " : "";
    const replacement = `${match.value}${suffix}`;
    const nextValue = replaceInputRange(context.value, context.bounds.start, context.bounds.end, replacement);
    const nextCaret = context.bounds.start + replacement.length;

    input.value = nextValue;
    input.setSelectionRange(nextCaret, nextCaret);
}

function applyFullCommandCompletion(match) {
    input.value = match.value;
    moveCaretToEnd(input);
}

function pathToDisplay(path) {
    return path === "/" ? `${siteConfig.terminal.promptHome}%` : `${path}%`;
}

function updateActivePrompt() {
    if (!prompt) {
        return;
    }

    const host = prompt.querySelector(".prompt-host");
    const path = prompt.querySelector(".prompt-path");

    if (host) {
        host.textContent = `(base) ${siteConfig.terminal.promptUser}@${siteConfig.terminal.promptHost}`;
    }

    if (path) {
        path.textContent = pathToDisplay(currentPath);
    }
}

function createBlock(className = "history-block") {
    const block = document.createElement("section");
    block.className = className;
    output.appendChild(block);
    scrollOutputToBottom();
    return block;
}

function ensureViewPanel() {
    if (!viewPanel) {
        viewPanel = createBlock("history-block view-shell");
    }

    return viewPanel;
}

async function typeTextInto(element, text, delay) {
    for (const character of text) {
        element.textContent += character;
        scrollOutputToBottom();
        await sleep(delay);
    }
}

function createParagraph(text, className = "history-copy") {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
}

function createCommandGroup() {
    const group = document.createElement("div");
    group.className = "command-group";
    return group;
}

function makePromptRow(command = "") {
    const row = document.createElement("p");
    row.className = "prompt-row";

    const host = document.createElement("span");
    host.className = "prompt-host";
    host.textContent = `(base) ${siteConfig.terminal.promptUser}@${siteConfig.terminal.promptHost}`;

    const path = document.createElement("span");
    path.className = "prompt-path";
    path.textContent = pathToDisplay(currentPath);

    const commandNode = document.createElement("span");
    commandNode.className = "prompt-command";
    commandNode.textContent = command;

    row.append(host, path, commandNode);
    return { row, commandNode };
}

async function appendPromptToBlock(block, command, animated = true) {
    const { row, commandNode } = makePromptRow("");
    block.appendChild(row);

    if (animated) {
        await typeTextInto(commandNode, command, typeSettings.commandDelay);
    } else {
        commandNode.textContent = command;
    }

    scrollOutputToBottom();
    return row;
}

async function appendTypedLineToBlock(block, text, className = "system-line", delay = typeSettings.bootDelay) {
    const line = document.createElement("p");
    line.className = className;
    block.appendChild(line);
    await typeTextInto(line, text, delay);
    await sleep(typeSettings.linePause);
    return line;
}

function collapseSessionBlock(block, keepFromNode, date) {
    if (!block || !keepFromNode) {
        return;
    }

    keepFromNode.textContent = getCollapsedLoginStamp(date);

    while (block.firstChild && block.firstChild !== keepFromNode) {
        block.removeChild(block.firstChild);
    }

    scrollOutputToBottom();
}

function createProtocolList() {
    const row = document.createElement("div");
    row.className = "protocol-list";

    protocolEntries.forEach((item) => {
        const link = document.createElement("a");
        link.className = item.className;
        link.href = `?view=${item.view}`;
        link.dataset.command = item.command;
        link.textContent = item.label;
        row.appendChild(link);
    });

    return row;
}

function renderProtocolDirectory() {
    const group = createCommandGroup();
    group.appendChild(createProtocolList());
    group.appendChild(createParagraph(commandSheet.protocolHint || "session ready. select a protocol above, or run --help for command index.", "protocol-note"));
    return group;
}

function renderHelp() {
    const group = createCommandGroup();
    const builtinLines = [
        "command index:",
        "--help                display this help text",
        "ls [path]             list directories or files",
        "cd <path>             change working directory",
        "cat <file>            read a file node",
        "pwd                   print working directory",
        "clear                 clear the active view",
        "open server           show the Discord invite"
    ];

    builtinLines.forEach((line, index) => {
        group.appendChild(createParagraph(line, index === 0 ? "history-meta" : "history-copy"));
    });

    const customHelpLines = collectHelpLines(
        removalCommands.help,
        editCommands.help,
        writeCommands.help,
        searchCommands.help,
        sudoCommands.help,
        ...Object.values(configuredCommands).map((definition) => definition.help)
    );

    if (commandSheet.showFunExtrasInHelp && customHelpLines.length > 0) {
        group.appendChild(createParagraph("fun extras:", "history-meta"));
        customHelpLines.forEach((line) => {
            group.appendChild(createParagraph(line));
        });
    }

    return group;
}

function renderWorksList(sectionKey = null) {
    const list = document.createElement("ul");
    list.className = "works-list";

    const works = sectionKey
        ? siteConfig.works.items.filter((work) => work.section === sectionKey)
        : siteConfig.works.items;

    if (works.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "works-item";
        emptyItem.textContent = "No entries logged.";
        list.appendChild(emptyItem);
        return list;
    }

    works.forEach((work) => {
        const item = document.createElement("li");
        item.className = "works-item";

        if (!sectionKey) {
            const section = workSectionsByKey.get(work.section);
            const status = document.createElement("span");
            status.className = "work-status";
            status.textContent = `${section?.label || work.section}:`;
            item.appendChild(status);
        }

        if (work.link) {
            const link = document.createElement("a");
            link.className = "work-link";
            link.href = work.link;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = work.title;
            item.appendChild(link);
        } else {
            const title = document.createElement("span");
            title.textContent = work.title;
            item.appendChild(title);
        }

        if (work.descriptor) {
            const descriptor = document.createElement("span");
            descriptor.textContent = `- ${work.descriptor}`;
            item.appendChild(descriptor);
        }

        list.appendChild(item);
    });

    return list;
}

function renderMsgCard() {
    const card = document.createElement("div");
    card.className = "msg-card";
    card.appendChild(createParagraph(siteConfig.msg.text));

    const link = document.createElement("a");
    link.className = "msg-link";
    link.href = siteConfig.msg.href;
    link.textContent = siteConfig.msg.label;
    card.appendChild(link);

    return card;
}

function buildSystemQrUrl() {
    const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
    qrUrl.searchParams.set("size", "160x160");
    qrUrl.searchParams.set("margin", "8");
    qrUrl.searchParams.set("data", siteConfig.system.link);
    return qrUrl.toString();
}

function createExternalLink(href, text, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = text;
    return link;
}

function renderSystemCard() {
    const group = createCommandGroup();
    const card = document.createElement("section");
    card.className = "system-card";

    const copy = document.createElement("div");
    copy.className = "system-copy";
    copy.appendChild(createParagraph("ssh neon-spine", "history-meta"));
    copy.appendChild(createParagraph("NEON SPINE", "system-heading"));
    copy.appendChild(createParagraph(siteConfig.system.description));

    const linkLine = document.createElement("p");
    linkLine.className = "system-linkline";

    const infoLabel = document.createElement("span");
    infoLabel.className = "system-link-label";
    infoLabel.textContent = "invite ::";

    const infoLink = createExternalLink(
        siteConfig.system.link,
        siteConfig.system.label || siteConfig.system.link,
        "system-link"
    );
    infoLink.title = siteConfig.system.link;

    linkLine.append(infoLabel, infoLink);
    copy.appendChild(linkLine);

    const qrLink = createExternalLink(siteConfig.system.link, "", "system-qr");
    qrLink.setAttribute("aria-label", "Join the NEON SPINE Discord server");

    const qrImage = document.createElement("img");
    qrImage.className = "system-qr-image";
    qrImage.src = buildSystemQrUrl();
    qrImage.alt = "QR code to join the NEON SPINE Discord server";
    qrImage.width = 160;
    qrImage.height = 160;

    const qrCaption = document.createElement("span");
    qrCaption.className = "system-qr-caption";
    qrCaption.textContent = "scan to join";

    qrLink.append(qrImage, qrCaption);
    card.append(copy, qrLink);
    group.appendChild(card);

    return group;
}

function getFile(path) {
    const hiddenFile = getHiddenFile(path);
    if (hiddenFile) {
        return hiddenFile;
    }

    if (path === "/protocols/bio.txt") {
        return { type: "text", content: siteConfig.bio.text };
    }

    if (path === "/protocols/mail.sh" || path === "/protocols/msg.txt") {
        return { type: "msg" };
    }

    const workSection = workSectionsByPath.get(path);
    if (workSection) {
        return { type: "work-section", sectionKey: workSection.key };
    }

    return null;
}

function getNode(path) {
    if (directories[path]) {
        return { type: "directory", path };
    }

    const file = getFile(path);
    if (file) {
        return { type: "file", path, file };
    }

    return null;
}

function getDisplayTarget(inputValue, resolvedPath) {
    return inputValue || resolvedPath || "/";
}

function renderConfiguredLines(lines = [], values = {}) {
    const group = createCommandGroup();

    lines.forEach((line) => {
        if (typeof line === "string") {
            group.appendChild(createParagraph(formatTemplate(line, values)));
            return;
        }

        group.appendChild(createParagraph(formatTemplate(line.text || "", values), line.className || "history-copy"));
    });

    return group;
}

function createPreformattedBlock(text, className = "ascii-banner") {
    const block = document.createElement("pre");
    block.className = className;
    block.textContent = text.trim();
    return block;
}

function getHiddenFile(path) {
    return hiddenFiles.find((file) => file.path === path) || null;
}

function getHiddenEntriesForDirectory(path, showHidden = false) {
    if (!showHidden) {
        return [];
    }

    return hiddenFiles
        .filter((file) => file.directory === path && file.revealWithHiddenListing)
        .map((file) => file.name);
}

function parseLsArgs(args = []) {
    const flags = args.filter((arg) => arg.startsWith("-"));
    const targets = args.filter((arg) => !arg.startsWith("-"));

    return {
        showHidden: flags.some((flag) => flag.includes("a")),
        target: resolvePath(targets[0] || currentPath),
        rawTarget: targets[0]
    };
}

function renderConfiguredCommand(command) {
    const definition = configuredCommandMap.get(normalizeLookupValue(command));

    if (!definition) {
        return null;
    }

    switch (definition.render || "lines") {
        case "file":
            return renderFile(definition.target);
        case "directory":
            return renderDirectoryListing(definition.target);
        case "system":
            return renderSystemCard();
        case "msg": {
            const group = createCommandGroup();
            group.appendChild(renderMsgCard());
            return group;
        }
        case "lines":
        default:
            return renderConfiguredLines(definition.lines);
    }
}

function isProtectedTarget(target, protectedTargets) {
    const normalizedTarget = normalizeLookupValue(target);
    const resolvedTarget = normalizeLookupValue(resolvePath(target));

    return Array.from(protectedTargets).some((pattern) => {
        const normalizedPattern = normalizeLookupValue(pattern);

        if (normalizedPattern.endsWith("*")) {
            const prefix = normalizedPattern.slice(0, -1);
            return normalizedTarget.startsWith(prefix) || resolvedTarget.startsWith(prefix);
        }

        return normalizedTarget === normalizedPattern || resolvedTarget === normalizedPattern;
    });
}

function getProtectedTarget(targets = [], protectedTargets = new Set()) {
    return targets.find((target) => isProtectedTarget(target, protectedTargets));
}

function renderRemovalCommand(name, args) {
    if (!removalCommandNames.has(name)) {
        return null;
    }

    const targets = args.filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((removalCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));
    const values = {
        command: name,
        count: targets.length,
        target: targets.join(" "),
        targets: targets.join(", ")
    };

    if (targets.length === 0) {
        return renderConfiguredLines(removalCommands.responses?.missingOperand || [
            { text: "{command}: missing operand", className: "history-meta" },
            { text: "You must name what you wish to dramatically banish.", className: "protocol-note" }
        ], values);
    }

    const protectedTarget = getProtectedTarget(targets, protectedTargets);
    if (protectedTarget) {
        return renderConfiguredLines(removalCommands.responses?.protectedTarget || [
            { text: "{command}: cannot remove {target}", className: "history-meta" },
            { text: "Even chaos needs a load-bearing wall.", className: "protocol-note" }
        ], { ...values, target: protectedTarget });
    }

    if (targets.length > 1) {
        return renderConfiguredLines(removalCommands.responses?.multipleTargets || [
            { text: "{command}: refusing to remove {targets}", className: "history-meta" },
            { text: "A bold sweep of the arm, but nothing leaves the stage tonight.", className: "protocol-note" }
        ], values);
    }

    return renderConfiguredLines(removalCommands.responses?.singleTarget || [
        { text: "{command}: refusing to remove {target}", className: "history-meta" },
        { text: "The terminal is weirdly attached to {target} and will not elaborate.", className: "protocol-note" }
    ], values);
}

function renderEditCommand(name, args) {
    if (!editCommandNames.has(name)) {
        return null;
    }

    const targets = args.filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((editCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));
    const target = targets[targets.length - 1] || "";
    const values = {
        command: name,
        count: targets.length,
        target,
        targets: targets.join(", ")
    };

    if (targets.length === 0) {
        return renderConfiguredLines(editCommands.responses?.missingOperand || [
            { text: "{command}: missing file operand", className: "history-meta" },
            { text: "Even chaos needs a filename.", className: "protocol-note" }
        ], values);
    }

    if (targets.length > 1) {
        return renderConfiguredLines(editCommands.responses?.multipleTargets || [
            { text: "{command}: refusing to edit {targets}", className: "history-meta" },
            { text: "Too many manuscripts. The copy desk has fainted.", className: "protocol-note" }
        ], values);
    }

    const protectedTarget = getProtectedTarget(targets, protectedTargets);

    if (protectedTarget) {
        return renderConfiguredLines(editCommands.responses?.protectedTarget || [
            { text: "{command}: {target}: Permission denied", className: "history-meta" },
            { text: "The bio has entered read-only diva mode.", className: "protocol-note" }
        ], { ...values, target: protectedTarget });
    }

    return renderConfiguredLines(editCommands.responses?.singleTarget || [
        { text: "{command}: {target}: Permission denied", className: "history-meta" },
        { text: "The editor opens a tiny velvet rope and then closes it again.", className: "protocol-note" }
    ], values);
}

function renderWriteCommand(name, args) {
    if (!writeCommandNames.has(name)) {
        return null;
    }

    const targets = args.filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((writeCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));
    const target = targets[targets.length - 1] || "";
    const values = {
        command: name,
        count: targets.length,
        target,
        targets: targets.join(", ")
    };

    if (targets.length === 0) {
        return renderConfiguredLines(writeCommands.responses?.missingOperand || [
            { text: "{command}: missing file operand", className: "history-meta" },
            { text: "A bold editorial instinct, but no file to haunt.", className: "protocol-note" }
        ], values);
    }

    const protectedTarget = getProtectedTarget(targets, protectedTargets);
    if (protectedTarget) {
        return renderConfiguredLines(writeCommands.responses?.protectedTarget || [
            { text: "{command}: cannot modify {target}", className: "history-meta" },
            { text: "The bio has a union rep and impeccable boundaries.", className: "protocol-note" }
        ], { ...values, target: protectedTarget });
    }

    return renderConfiguredLines(writeCommands.responses?.singleTarget || [
        { text: "{command}: {target}: Operation not permitted", className: "history-meta" },
        { text: "The file has retained counsel and declines your revisions.", className: "protocol-note" }
    ], values);
}

function renderSearchCommand(name, args) {
    if (!searchCommandNames.has(name)) {
        return null;
    }

    const targets = args.filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((searchCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));
    const target = getProtectedTarget(targets, protectedTargets) || targets[targets.length - 1] || "";
    const values = {
        command: name,
        count: targets.length,
        target,
        targets: targets.join(", ")
    };

    if (targets.length === 0) {
        return renderConfiguredLines(searchCommands.responses?.missingOperand || [
            { text: "{command}: missing search target", className: "history-meta" },
            { text: "You cannot interrogate the void without a lead.", className: "protocol-note" }
        ], values);
    }

    const protectedTarget = getProtectedTarget(targets, protectedTargets);
    if (protectedTarget) {
        return renderConfiguredLines(searchCommands.responses?.protectedTarget || [
            { text: "{command}: {target}: results classified", className: "history-meta" },
            { text: "The bio sensed surveillance and arranged its own redactions.", className: "protocol-note" }
        ], { ...values, target: protectedTarget });
    }

    return renderConfiguredLines(searchCommands.responses?.generic || [
        { text: "{command}: no suitably dramatic matches found", className: "history-meta" },
        { text: "Nothing in the filesystem felt seen enough to respond.", className: "protocol-note" }
    ], values);
}

function renderSudoCommand(args) {
    if (args.length === 0) {
        return renderConfiguredLines(sudoCommands.responses?.noArgs || [
            { text: "sudo: a password is required", className: "history-meta" },
            { text: "Sadly, authority remains a social construct.", className: "protocol-note" }
        ]);
    }

    const subcommand = normalizeLookupValue(args[0]);
    const targets = args.slice(1).filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((sudoCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));
    const protectedTarget = getProtectedTarget(targets, protectedTargets);

    if (protectedTarget) {
        return renderConfiguredLines(sudoCommands.responses?.protectedTarget || [
            { text: "sudo: unable to alter {target}", className: "history-meta" },
            { text: "Even root cannot negotiate with a self-aware manuscript.", className: "protocol-note" }
        ], { subcommand, target: protectedTarget, targets: targets.join(", ") });
    }

    return renderConfiguredLines(sudoCommands.responses?.generic || [
        { text: "sudo: permission theatrically denied", className: "history-meta" },
        { text: "The terminal squints at your ambition and says, 'cute.'", className: "protocol-note" }
    ], { subcommand, target: targets[targets.length - 1] || "", targets: targets.join(", ") });
}

function renderProcessCommand(name, args) {
    if (!processCommandNames.has(name)) {
        return null;
    }

    const targets = args.filter((arg) => !arg.startsWith("-"));
    const protectedTargets = new Set((processCommands.protectedTargets || []).map((target) => normalizeLookupValue(target)));

    if (targets.length === 0) {
        return renderConfiguredLines(processCommands.responses?.missingOperand || [
            { text: "kill: not enough arguments", className: "history-meta" },
            { text: "You must name the process you wish to dramatically fail to stop.", className: "protocol-note" }
        ]);
    }

    const protectedTarget = getProtectedTarget(targets, protectedTargets) || targets[targets.length - 1];

    return renderConfiguredLines(processCommands.responses?.generic || [
        { text: "Error: The oversized houseplant cannot be terminated.", className: "history-meta" }
    ], { command: name, target: protectedTarget, targets: targets.join(", ") });
}

function renderFile(path) {
    const file = getFile(path);
    const group = createCommandGroup();

    if (!file) {
        group.appendChild(createParagraph(getConfiguredError("missingFile", { path }, `cat: ${path}: No such file or directory`), "history-meta"));
        return group;
    }

    if (file.type === "msg") {
        group.appendChild(renderMsgCard());
        return group;
    }

    if (file.type === "work-section") {
        group.appendChild(renderWorksList(file.sectionKey));
        return group;
    }

    if (file.type === "ascii") {
        group.appendChild(createPreformattedBlock(file.content, "ascii-banner"));
        return group;
    }

    group.appendChild(createParagraph(file.content));
    return group;
}

function normalizeInput(rawCommand) {
    const trimmed = rawCommand.trim().replace(/\s+/g, " ");
    if (!trimmed) {
        return "";
    }

    return commandAliases[normalizeLookupValue(trimmed)] || trimmed;
}

function splitCommand(command) {
    const parts = command.trim().split(/\s+/);
    return {
        name: (parts.shift() || "").toLowerCase(),
        args: parts
    };
}

function resolvePath(inputPath = "") {
    if (!inputPath || inputPath === "~") {
        return "/";
    }

    if (inputPath === ".") {
        return currentPath;
    }

    if (inputPath === "..") {
        if (currentPath === "/") {
            return "/";
        }

        const segments = currentPath.split("/").filter(Boolean);
        segments.pop();
        return segments.length ? `/${segments.join("/")}` : "/";
    }

    if (inputPath.startsWith("/")) {
        return inputPath.replace(/\/$/, "") || "/";
    }

    if (inputPath.startsWith("~/")) {
        return `/${inputPath.slice(2)}`.replace(/\/$/, "") || "/";
    }

    const base = currentPath === "/" ? "" : currentPath;
    return `${base}/${inputPath}`.replace(/\/$/, "") || "/";
}

function renderDirectoryListing(path, options = {}) {
    const group = createCommandGroup();
    const showHidden = options.showHidden || false;

    if (path === "/protocols") {
        return renderProtocolDirectory();
    }

    const entries = directories[path];
    if (!entries) {
        group.appendChild(createParagraph(getConfiguredError("missingListPath", { path }, `ls: cannot access '${path}': No such file or directory`), "history-meta"));
        return group;
    }

    if (path === "/works") {
        group.appendChild(renderWorksList());
        return group;
    }

    const displayEntries = showHidden
        ? [".", "..", ...entries, ...getHiddenEntriesForDirectory(path, showHidden)]
        : entries;

    group.appendChild(createParagraph(displayEntries.join("   ")));
    return group;
}

function resolveCommandOutput(command) {
    const configuredOutput = renderConfiguredCommand(command);
    if (configuredOutput) {
        return configuredOutput;
    }

    const { name, args } = splitCommand(command);

    const processOutput = renderProcessCommand(name, args);
    if (processOutput) {
        return processOutput;
    }

    if (name === "sudo") {
        return renderSudoCommand(args);
    }

    const removalOutput = renderRemovalCommand(name, args);
    if (removalOutput) {
        return removalOutput;
    }

    const editOutput = renderEditCommand(name, args);
    if (editOutput) {
        return editOutput;
    }

    const writeOutput = renderWriteCommand(name, args);
    if (writeOutput) {
        return writeOutput;
    }

    const searchOutput = renderSearchCommand(name, args);
    if (searchOutput) {
        return searchOutput;
    }

    switch (name) {
        case "--help":
        case "help":
            return renderHelp();
        case "pwd": {
            const group = createCommandGroup();
            group.appendChild(createParagraph(currentPath));
            return group;
        }
        case "ls": {
            const { showHidden, target, rawTarget } = parseLsArgs(args);
            const node = getNode(target);

            if (node?.type === "file") {
                const group = createCommandGroup();
                group.appendChild(createParagraph(getDisplayTarget(rawTarget, target)));
                return group;
            }

            return renderDirectoryListing(target, { showHidden });
        }
        case "cd": {
            const group = createCommandGroup();
            const inputTarget = args[0] || "~";

            if (args.length > 1) {
                group.appendChild(createParagraph(getConfiguredError("cdTooManyArguments", {}, "cd: too many arguments"), "history-meta"));
                return group;
            }

            if (inputTarget === ".." && navigationCommands.trapParentTraversal) {
                return renderConfiguredLines(navigationCommands.parentDenied || [
                    { text: "bash: cd: permission denied. you are already where you belong.", className: "history-meta" }
                ]);
            }

            const target = resolvePath(inputTarget);
            const node = getNode(target);

            if (node?.type === "directory") {
                currentPath = target;
                updateActivePrompt();
                group.appendChild(createParagraph(`cwd: ${currentPath}`, "history-meta"));
            } else if (node?.type === "file") {
                group.appendChild(createParagraph(
                    getConfiguredError("notDirectory", { target: getDisplayTarget(args[0], target) }, `cd: not a directory: ${getDisplayTarget(args[0], target)}`),
                    "history-meta"
                ));
            } else {
                group.appendChild(createParagraph(
                    getConfiguredError("missingDirectory", { target: getDisplayTarget(args[0], target) }, `cd: no such file or directory: ${getDisplayTarget(args[0], target)}`),
                    "history-meta"
                ));
            }

            return group;
        }
        case "cat": {
            const group = createCommandGroup();

            if (!args[0]) {
                group.appendChild(createParagraph(getConfiguredError("catMissingOperand", {}, "cat: missing file operand"), "history-meta"));
                return group;
            }

            const inputTarget = args[0];
            const target = resolvePath(inputTarget);
            const node = getNode(target);

            if (!node) {
                group.appendChild(createParagraph(
                    getConfiguredError("missingFile", { path: getDisplayTarget(inputTarget, target) }, `cat: ${getDisplayTarget(inputTarget, target)}: No such file or directory`),
                    "history-meta"
                ));
                return group;
            }

            if (node.type === "directory") {
                group.appendChild(createParagraph(
                    getConfiguredError("isDirectory", { path: getDisplayTarget(inputTarget, target) }, `cat: ${getDisplayTarget(inputTarget, target)}: Is a directory`),
                    "history-meta"
                ));
                return group;
            }

            return renderFile(target);
        }
        case "open": {
            if (["server", "system"].includes((args[0] || "").toLowerCase())) {
                return renderSystemCard();
            }

            const group = createCommandGroup();
            group.appendChild(createParagraph(
                getConfiguredError("openNotFound", { target: args[0] || "" }, `open: ${args[0] || ""}: No such file or resource`),
                "history-meta"
            ));
            return group;
        }
        default:
            break;
    }

    if (["ssh /msg", "ssh /mail"].includes(command.toLowerCase())) {
        return renderFile("/protocols/mail.sh");
    }

    const group = createCommandGroup();
    group.appendChild(createParagraph(
        getConfiguredError("commandNotFound", { command: name || command }, `${name || command}: command not found`),
        "history-meta"
    ));
    group.appendChild(createParagraph(
        getConfiguredError("commandNotFoundHint", {}, "run --help for available commands."),
        "protocol-note"
    ));
    return group;
}

async function renderViewCommand(command, animated = true) {
    const panel = ensureViewPanel();
    panel.innerHTML = "";

    const { row, commandNode } = makePromptRow("");
    panel.appendChild(row);

    if (animated) {
        await typeTextInto(commandNode, command, typeSettings.commandDelay);
    } else {
        commandNode.textContent = command;
    }

    await sleep(100);
    const response = resolveCommandOutput(command);
    if (response) {
        panel.appendChild(response);
    }

    scrollOutputToBottom();
}

async function executeCommand(rawCommand, animated = true) {
    const normalized = normalizeInput(rawCommand);
    input.value = "";
    setTabHint("");
    resetAutocompleteState();

    if (!normalized) {
        return;
    }

    if (normalized.toLowerCase() === "clear") {
        const panel = ensureViewPanel();
        panel.innerHTML = "";
        scrollOutputToBottom();
        return;
    }

    await renderViewCommand(normalized, animated);
}

function setInputEnabled(enabled) {
    const disabled = !enabled;
    input.disabled = disabled;
    submitButton.disabled = disabled;
    document.querySelectorAll("[data-command]").forEach((trigger) => {
        if (trigger instanceof HTMLButtonElement) {
            trigger.disabled = disabled;
        } else {
            trigger.setAttribute("aria-disabled", String(disabled));
            trigger.tabIndex = disabled ? -1 : 0;
        }
    });
}

async function processQueue() {
    if (isProcessing || commandQueue.length === 0) {
        return;
    }

    isProcessing = true;
    setInputEnabled(false);

    while (commandQueue.length > 0) {
        const next = commandQueue.shift();
        await executeCommand(next.command, next.animated);
    }

    isProcessing = false;
    setInputEnabled(true);
    input.focus();
}

function enqueueCommand(command, animated = true) {
    commandQueue.push({ command, animated });
    processQueue();
}

function handleTabCompletion() {
    const result = buildCompletionResult();

    if (result.mode === "empty") {
        resetAutocompleteState();
        setTabHint(commandSheet.emptyTabHint || "tab-complete: try --help, ls /protocols, or cat /protocols/bio.txt");
        return;
    }

    const { context, matches, mode, label } = result;

    if (matches.length === 0) {
        resetAutocompleteState();
        setTabHint("tab-complete: no matches");
        return;
    }

    if (matches.length === 1) {
        if (mode === "full-command") {
            applyFullCommandCompletion(matches[0]);
        } else {
            applyTokenCompletion(context, matches[0], matches[0].appendSpace !== false);
        }

        resetAutocompleteState();
        setTabHint(`tab-complete: ${matches[0].display}`);
        return;
    }

    const commonPrefix = getSharedPrefix(matches.map((match) => match.value));
    const currentValue = mode === "full-command" ? context.value.trim() : context.token;

    if (commonPrefix && commonPrefix.length > currentValue.length) {
        if (mode === "full-command") {
            input.value = commonPrefix;
            moveCaretToEnd(input);
        } else {
            applyTokenCompletion(context, { ...matches[0], value: commonPrefix }, false);
        }

        resetAutocompleteState();
        setTabHint(describeCompletionMatches(matches, label));
        return;
    }

    const autocompleteKey = getAutocompleteKey(result);

    if (!autocompleteState || autocompleteState.key !== autocompleteKey) {
        autocompleteState = { key: autocompleteKey, index: -1 };
        setTabHint(`${describeCompletionMatches(matches, label)}   ↹ again to cycle`);
        return;
    }

    autocompleteState.index = (autocompleteState.index + 1) % matches.length;
    const selectedMatch = matches[autocompleteState.index];

    if (mode === "full-command") {
        applyFullCommandCompletion(selectedMatch);
    } else {
        applyTokenCompletion(context, selectedMatch, false);
    }

    setTabHint(`tab-complete ${label} ${autocompleteState.index + 1}/${matches.length}: ${selectedMatch.display}`);
}

function resolveInitialCommand() {
    const url = new URL(window.location.href);
    const requestedView = (url.searchParams.get("view") || url.hash.replace("#", "")).toLowerCase();
    const viewMap = {
        bio: "cat /protocols/bio.txt",
        works: "ls /works",
        server: "open server",
        system: "open server",
        mail: "cat /protocols/mail.sh",
        msg: "cat /protocols/mail.sh"
    };

    return viewMap[requestedView] || null;
}

async function runBootSequence() {
    currentPath = "/";
    updateActivePrompt();
    const bootDate = new Date();

    const sessionBlock = createBlock();
    await appendPromptToBlock(sessionBlock, `ssh ${siteConfig.terminal.sessionHost}`);
    await appendTypedLineToBlock(sessionBlock, `The authenticity of host '${siteConfig.terminal.sessionHost} (${siteConfig.terminal.sessionAddress})' can't be established.`);
    await appendTypedLineToBlock(sessionBlock, "ED25519 key fingerprint is SHA256:Q7mK2xV9pL4nD8rT1cF6hJ3sW5uB0yNqZ8eR2aC4vM1.");
    await appendTypedLineToBlock(sessionBlock, "This key is not known by any other names.");
    await appendTypedLineToBlock(sessionBlock, "Are you sure you want to continue connecting (yes/no/[fingerprint])? yes");
    await appendTypedLineToBlock(sessionBlock, `Warning: Permanently added '${siteConfig.terminal.sessionHost}' (ED25519) to the list of known hosts.`);

    const passwordLine = document.createElement("p");
    passwordLine.className = "system-line";
    sessionBlock.appendChild(passwordLine);
    await typeTextInto(passwordLine, `${siteConfig.terminal.promptUser}@${siteConfig.terminal.sessionHost}'s password: `, typeSettings.bootDelay);
    await typeTextInto(passwordLine, "****", typeSettings.passwordDelay);
    await sleep(typeSettings.linePause);

    const welcomeLines = [
        "Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-41-generic x86_64)",
        " * Documentation:  https://help.ubuntu.com",
        " * System load:    0.08",
        " * Memory usage:   18%",
        ` * ${getLastLoginStamp(bootDate)}`
    ];

    let lastLoginLine = null;

    for (let index = 0; index < welcomeLines.length; index += 1) {
        const line = await appendTypedLineToBlock(sessionBlock, welcomeLines[index]);
        if (index === welcomeLines.length - 1) {
            lastLoginLine = line;
        }
    }

    await appendPromptToBlock(sessionBlock, "./hello_world");
    await appendTypedLineToBlock(sessionBlock, "hello, world");

    const banner = document.createElement("pre");
    banner.className = "ascii-banner";
    banner.textContent = siteConfig.terminal.titleAscii.trim();
    sessionBlock.appendChild(banner);
    scrollOutputToBottom();
    await sleep(260);
    collapseSessionBlock(sessionBlock, lastLoginLine, bootDate);

    const protocolBlock = createBlock();
    await appendPromptToBlock(protocolBlock, "ls /protocols");
    protocolBlock.appendChild(renderProtocolDirectory());

    ensureViewPanel();
    bootComplete = true;
    setInputEnabled(true);
    input.focus();
    scrollOutputToBottom();

    const initialCommand = resolveInitialCommand();
    if (initialCommand) {
        enqueueCommand(initialCommand, true);
    }
}

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!bootComplete || !input.value.trim()) {
            return;
        }

        enqueueCommand(input.value, false);
    });
}

if (input) {
    input.addEventListener("input", () => {
        resetAutocompleteState();
        setTabHint("");
    });

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") {
            return;
        }

        event.preventDefault();

        if (!bootComplete || input.disabled) {
            return;
        }

        handleTabCompletion();
    });
}

applySiteChrome();
updateActivePrompt();

document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-command]");
    if (!trigger || !bootComplete) {
        return;
    }

    event.preventDefault();

    if (trigger.getAttribute("aria-disabled") === "true") {
        return;
    }

    input.value = "";
    setTabHint("");
    enqueueCommand(trigger.dataset.command || "--help", true);
});

window.addEventListener("load", () => {
    setInputEnabled(false);
    runBootSequence();
});
