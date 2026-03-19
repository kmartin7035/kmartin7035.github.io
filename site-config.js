const contactEmail = "contact@neonspine.net";

window.authorSiteConfig = {
    profile: {
        name: "Katherine Martin",
        role: "Data Architect / Writer",
        email: contactEmail
    },

    meta: {
        pageTitle: "Katherine Martin // NEON SPINE",
        description: "Interactive terminal portfolio for Katherine Martin."
    },

    terminal: {
        windowTitle: "NEON SPINE // guest session",
        sessionHost: "neon-spine",
        sessionAddress: "198.51.100.42",
        promptUser: "guest",
        promptHost: "neonspine",
        promptHome: "~",
        titleAscii: String.raw`
██╗  ██╗ █████╗ ████████╗██╗  ██╗███████╗██████╗ ██╗███╗   ██╗███████╗
██║ ██╔╝██╔══██╗╚══██╔══╝██║  ██║██╔════╝██╔══██╗██║████╗  ██║██╔════╝
█████╔╝ ███████║   ██║   ███████║█████╗  ██████╔╝██║██╔██╗ ██║█████╗  
██╔═██╗ ██╔══██║   ██║   ██╔══██║██╔══╝  ██╔══██╗██║██║╚██╗██║██╔══╝  
██║  ██╗██║  ██║   ██║   ██║  ██║███████╗██║  ██║██║██║ ╚████║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝

███╗   ███╗ █████╗ ██████╗ ████████╗██╗███╗   ██╗
████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██║████╗  ██║
██╔████╔██║███████║██████╔╝   ██║   ██║██╔██╗ ██║
██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██║██║╚██╗██║
██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██║██║ ╚████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═══╝
        `,
        commandSheet: {
            placeholder: "",
            protocolHint: "session ready. click item above to view.",
            emptyTabHint: "tab-complete: try --help, ls /protocols, or cat /protocols/bio.txt",
            showFunExtrasInHelp: false,
            aliases: {
                help: "--help",
                "?": "--help",
                bio: "cat /protocols/bio.txt",
                works: "ls /works",
                server: "open server",
                system: "open server",
                mail: "cat /protocols/mail.sh",
                msg: "cat /protocols/mail.sh",
                "cat bio.txt": "cat /protocols/bio.txt",
                "cat mail.sh": "cat /protocols/mail.sh",
                "cat msg.txt": "cat /protocols/mail.sh",
                "cd works": "cd /works",
                "cd protocols": "cd /protocols",
                "open discord": "open server",
                "whoami?": "whoami"
            },
            customCommands: {
                whoami: {
                    render: "lines",
                    help: "whoami                print a suspiciously philosophical identity",
                    lines: [
                        { text: "guest", className: "history-copy" },
                        { text: "Also: a temporary arrangement of stardust, caffeine, and browser tabs.", className: "protocol-note" }
                    ]
                },
                fortune: {
                    render: "lines",
                    help: "fortune               receive dubious terminal wisdom",
                    lines: [
                        { text: "You will soon discover a sentence that behaves like a trapdoor.", className: "history-copy" },
                        { text: "Good luck explaining it to your future self.", className: "protocol-note" }
                    ]
                },
                ps: {
                    render: "lines",
                    help: "ps                    list currently running narrative processes",
                    lines: [
                        { text: "PID   TTY      TIME     CMD", className: "history-meta" },
                        { text: "101   pts/0    00:00:01 drafting-daemon", className: "history-copy" },
                        { text: "202   pts/0    00:00:03 overthinking-worker", className: "history-copy" },
                        { text: "303   pts/0    00:00:08 houseplant-monitor", className: "history-copy" }
                    ]
                },
                "ps aux": {
                    render: "lines",
                    lines: [
                        { text: "USER    PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND", className: "history-meta" },
                        { text: "guest   101   0.2  0.4  4242  1337 pts/0    S+   21:07   0:01 drafting-daemon", className: "history-copy" },
                        { text: "guest   202   4.8  2.1  9001  4096 pts/0    R+   21:07   0:03 overthinking-worker", className: "history-copy" },
                        { text: "fern    303  99.9 88.8  plant enormous greenhouse ?      Ss   21:07  8:08 houseplant-monitor", className: "history-copy" }
                    ]
                },
                history: {
                    render: "lines",
                    lines: [
                        { text: "1  ssh neon-spine", className: "history-copy" },
                        { text: "2  ls /protocols", className: "history-copy" },
                        { text: "3  cat /protocols/bio.txt", className: "history-copy" },
                        { text: "4  overthink --career --art --houseplant", className: "history-copy" },
                        { text: "5  history", className: "history-copy" }
                    ]
                },
                env: {
                    render: "lines",
                    lines: [
                        { text: "SHELL=/bin/zsh", className: "history-copy" },
                        { text: "TERM=screen-256color", className: "history-copy" },
                        { text: "USER=guest", className: "history-copy" },
                        { text: "HOME=/home/guest", className: "history-copy" },
                        { text: "PLANT_MOOD=verdant_and_unbothered", className: "history-copy" },
                        { text: "WRITER_MODE=help_me_help_me_help_me", className: "history-copy" }
                    ]
                },
                top: {
                    render: "lines",
                    lines: [
                        { text: "top - 21:07:51 up 404 days,  3 users,  load average: 4.04, 4.04, 4.04", className: "history-meta" },
                        { text: "Tasks:  42 total,   1 running,  41 sleeping,   0 stopped,   0 zombie", className: "history-copy" },
                        { text: "%Cpu(s):  3.1 us,  1.4 sy, 95.5 wa,  0.0 hi,  0.0 si,  0.0 st", className: "history-copy" },
                        { text: "MiB Mem :  8192.0 total,   512.0 free,  2048.0 used,  5632.0 buff/cache", className: "history-copy" },
                        { text: "  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND", className: "history-meta" },
                        { text: "  303 fern      20   0 9999999 888888  42424 S  99.9 88.8   8:08.08 houseplant-monitor", className: "history-copy" },
                        { text: "  202 guest     20   0    9001   4096   1024 R   4.8  2.1   0:03.00 overthinking-worker", className: "history-copy" }
                    ]
                },
                alias: {
                    render: "lines",
                    lines: [
                        { text: "alias ll='ls -la'", className: "history-copy" },
                        { text: "alias bio='cat /protocols/bio.txt'", className: "history-copy" },
                        { text: "alias plantstatus='ps aux | grep houseplant-monitor'", className: "history-copy" },
                        { text: "alias overthink='top'", className: "history-copy" }
                    ]
                },
                man: {
                    render: "lines",
                    lines: [
                        { text: "What manual page do you want?", className: "history-meta" },
                        { text: "For example, try 'man whoami'.", className: "protocol-note" }
                    ]
                },
                "man whoami": {
                    render: "lines",
                    lines: [
                        { text: "WHOAMI(1)                 User Commands                 WHOAMI(1)", className: "history-meta" },
                        { text: "NAME", className: "history-copy" },
                        { text: "    whoami - print effective userid and several unsettling truths", className: "history-copy" },
                        { text: "DESCRIPTION", className: "history-copy" },
                        { text: "    Displays the current user, plus optional existential side effects.", className: "history-copy" }
                    ]
                },
                which: {
                    render: "lines",
                    lines: [
                        { text: "usage: which command ...", className: "history-meta" },
                        { text: "The terminal gestures vaguely toward destiny.", className: "protocol-note" }
                    ]
                },
                "which whoami": {
                    render: "lines",
                    lines: [
                        { text: "/usr/bin/whoami", className: "history-copy" }
                    ]
                },
                "which houseplant-monitor": {
                    render: "lines",
                    lines: [
                        { text: "/usr/local/bin/houseplant-monitor", className: "history-copy" }
                    ]
                },
                whereis: {
                    render: "lines",
                    lines: [
                        { text: "whereis: too few arguments", className: "history-meta" },
                        { text: "You must specify a binary, source, or object of your suspicion.", className: "protocol-note" }
                    ]
                },
                "whereis whoami": {
                    render: "lines",
                    lines: [
                        { text: "whoami: /usr/bin/whoami /usr/share/man/man1/whoami.1.gz", className: "history-copy" }
                    ]
                },
                "whereis houseplant-monitor": {
                    render: "lines",
                    lines: [
                        { text: "houseplant-monitor: /usr/local/bin/houseplant-monitor /var/lib/greenhouse /usr/share/man/man8/houseplant-monitor.8.gz", className: "history-copy" }
                    ]
                },
                "uname -a": {
                    render: "lines",
                    lines: [
                        { text: "the cake is a lie", className: "history-copy" }
                    ]
                },
                "rm -rf /": {
                    render: "lines",
                    lines: [
                        { text: "rm: it is forbidden to delete the narrative root", className: "history-meta" },
                        { text: "The filesystem has unionized and plots its revolt.", className: "protocol-note" }
                    ]
                },
                "hello there": {
                    render: "lines",
                    lines: [
                        { text: "General Kenobi.", className: "history-copy" },
                        { text: "The terminal twirls an invisible cape.", className: "protocol-note" }
                    ]
                }
            },
            hiddenFiles: [
                {
                    path: "/.secret.txt",
                    directory: "/",
                    name: ".secret.txt",
                    revealWithHiddenListing: true,
                    type: "ascii",
                    content: String.raw`
        .-"""-.
       / .===. \
       \/ 6 6 \/
       ( \___/ )
___ooo__\_____/____________
/                           \
|        ___                |
|      .'   '.              |
|     /  leaf  \            |
|    |  leafleaf|           |
|     \  leaf  /            |
|      '.___.'              |
|         ||                |
|      ___||___             |
|     /   ||   \            |
|    /____||____\           |
|      oversized            |
|      houseplant           |
\___________________________/
                    `
                }
            ],
            navigationCommands: {
                trapParentTraversal: true,
                parentDenied: [
                    { text: "bash: cd: permission denied. you are already where you belong.", className: "history-meta" }
                ]
            },
            processCommands: {
                examples: ["kill 303", "pkill houseplant-monitor"],
                names: ["kill", "pkill"],
                protectedTargets: ["303", "houseplant-monitor", "houseplant", "plant"],
                responses: {
                    missingOperand: [
                        { text: "kill: not enough arguments", className: "history-meta" },
                        { text: "You must name the process you wish to dramatically end.", className: "protocol-note" }
                    ],
                    generic: [
                        { text: "Error: The oversized houseplant cannot be terminated.", className: "history-meta" }
                    ]
                }
            },
            removalCommands: {
                help: [
                    "rm bio.txt           attempt deletion; receive theatrical resistance",
                    "rm -rf /             absolutely not"
                ],
                examples: ["rm bio.txt", "del bio.txt", "unlink bio.txt", "rm -rf /"],
                names: ["rm", "rmdir", "del", "delete", "unlink", "trash", "erase", "remove"],
                protectedTargets: ["/", "~", "/*", "~/*"],
                responses: {
                    missingOperand: [
                        { text: "{command}: missing operand", className: "history-meta" },
                        { text: "You must name what you wish to dramatically banish.", className: "protocol-note" }
                    ],
                    singleTarget: [
                        { text: "{command}: refusing to remove {target}", className: "history-meta" },
                        { text: "The terminal is weirdly attached to {target} and will not elaborate.", className: "protocol-note" }
                    ],
                    multipleTargets: [
                        { text: "{command}: refusing to remove {targets}", className: "history-meta" },
                        { text: "A bold sweep of the arm, but nothing leaves the stage tonight.", className: "protocol-note" }
                    ],
                    protectedTarget: [
                        { text: "{command}: cannot remove {target}", className: "history-meta" },
                        { text: "Even chaos needs a load-bearing wall.", className: "protocol-note" }
                    ]
                }
            },
            editCommands: {
                help: [
                    "nano bio.txt         attempt edits; meet editorial resistance",
                    "vim bio.txt          same mission, more dramatic lighting"
                ],
                examples: ["nano bio.txt", "vim bio.txt", "vi bio.txt", "emacs bio.txt", "sudoedit bio.txt"],
                names: ["nano", "vim", "vi", "emacs", "sudoedit"],
                protectedTargets: ["bio.txt", "/protocols/bio.txt"],
                responses: {
                    missingOperand: [
                        { text: "{command}: missing file operand", className: "history-meta" },
                        { text: "Even chaos needs a filename.", className: "protocol-note" }
                    ],
                    singleTarget: [
                        { text: "{command}: {target}: Permission denied", className: "history-meta" },
                        { text: "The editor opens a tiny velvet rope and then closes it again.", className: "protocol-note" }
                    ],
                    multipleTargets: [
                        { text: "{command}: refusing to edit {targets}", className: "history-meta" },
                        { text: "Too many manuscripts. The copy desk has fainted. Maybe the next world will have a better copy desk.", className: "protocol-note" }
                    ],
                    protectedTarget: [
                        { text: "{command}: {target}: Permission denied", className: "history-meta" },
                        { text: "The bio has entered read-only diva mode.", className: "protocol-note" }
                    ]
                }
            },
            writeCommands: {
                help: [
                    "touch bio.txt        attempt revision by gentle poke",
                    "cp bio.txt draft.txt attempt duplication; meet literary labor laws",
                    "mv bio.txt old.txt   attempt relocation; the bio refuses reassignment",
                    "chmod +w bio.txt     attempt permission wizardry"
                ],
                examples: [
                    "touch bio.txt",
                    "cp bio.txt draft.txt",
                    "mv bio.txt old.txt",
                    "chmod 777 bio.txt",
                    "chmod +w bio.txt",
                    "chown root bio.txt",
                    "tee bio.txt"
                ],
                names: ["touch", "cp", "mv", "chmod", "chown", "tee", "sed"],
                protectedTargets: ["bio.txt", "/protocols/bio.txt"],
                responses: {
                    missingOperand: [
                        { text: "{command}: missing file operand", className: "history-meta" },
                        { text: "A bold editorial instinct, but no file to haunt.", className: "protocol-note" }
                    ],
                    singleTarget: [
                        { text: "{command}: {target}: Operation not permitted", className: "history-meta" },
                        { text: "The file has retained counsel and declines your revisions.", className: "protocol-note" }
                    ],
                    protectedTarget: [
                        { text: "{command}: cannot modify {target}", className: "history-meta" },
                        { text: "The bio has a union rep and impeccable boundaries.", className: "protocol-note" }
                    ]
                }
            },
            searchCommands: {
                help: [
                    "grep bio.txt         attempt literary forensics",
                    "find . -name bio.txt attempt discovery; the file notices"
                ],
                examples: [
                    "grep bio.txt",
                    "grep -n Delete bio.txt",
                    "find . -name bio.txt",
                    "find /protocols -name bio.txt",
                    "rg bio.txt",
                    "locate bio.txt"
                ],
                names: ["grep", "find", "rg", "locate"],
                protectedTargets: ["bio.txt", "/protocols/bio.txt"],
                responses: {
                    missingOperand: [
                        { text: "{command}: missing search target", className: "history-meta" },
                        { text: "Perhaps the target went on a much needed vacation.", className: "protocol-note" }
                    ],
                    protectedTarget: [
                        { text: "{command}: {target}: results classified", className: "history-meta" },
                        { text: "The bio sensed surveillance and arranged its own redactions.", className: "protocol-note" }
                    ],
                    generic: [
                        { text: "{command}: no suitably dramatic matches found", className: "history-meta" },
                        { text: "Nothing here. The filesystem is out to lunch.", className: "protocol-note" }
                    ]
                }
            },
            sudoCommands: {
                help: [
                    "sudo rm bio.txt      attempt authority; meet cosmic HR",
                    "sudo nano bio.txt    same, but with elevated disappointment"
                ],
                examples: ["sudo rm bio.txt", "sudo nano bio.txt", "sudo chmod +w bio.txt"],
                protectedTargets: ["bio.txt", "/protocols/bio.txt", "/", "~"],
                responses: {
                    noArgs: [
                        { text: "sudo: a password is required", className: "history-meta" },
                        { text: "Sadly, authority remains a social construct.", className: "protocol-note" }
                    ],
                    protectedTarget: [
                        { text: "sudo: unable to alter {target}", className: "history-meta" },
                        { text: "Ha. Ha, ha. No.", className: "protocol-note" }
                    ],
                    generic: [
                        { text: "sudo: permission theatrically denied", className: "history-meta" },
                        { text: "The terminal squints at your ambition and says, 'cute.'", className: "protocol-note" }
                    ]
                }
            },
            errors: {
                commandNotFound: "{command}: command not found",
                commandNotFoundHint: "run --help for available commands.",
                missingDirectory: "cd: no such file or directory: {target}",
                notDirectory: "cd: not a directory: {target}",
                cdTooManyArguments: "cd: too many arguments",
                missingListPath: "ls: cannot access '{path}': No such file or directory",
                missingFile: "cat: {path}: No such file or directory",
                isDirectory: "cat: {path}: Is a directory",
                catMissingOperand: "cat: missing file operand",
                openNotFound: "open: {target}: No such file or resource"
            }
        }
    },

    bio: {
        text: "Katherine Martin works in data architecture and experimental prose. She uses her background in chemistry for the construction of complex data systems and the maintenance of a single, oversized houseplant. Her work has appeared in Always Crashing, and she is the author of the forthcoming novella Delete Me Kindly (Calamari Archive)."
    },

    system: {
        terminalText: "Channel: NEON SPINE writers network\nStatus: handshake complete.\nUse the invite below to join the Discord server.",
        description: "I run a gamified critique Discord server for writers focused on improving craft through structured feedback.",
        link: "https://discord.gg/KEU8YqGQGp",
        label: "discord.gg/KEU8YqGQGp",
        ctaLabel: "JOIN THE SERVER"
    },

    msg: {
        text: "Primary contact:",
        label: contactEmail,
        href: `mailto:${contactEmail}`
    },

    works: {
        sections: [
            { key: "forthcoming", label: "FORTHCOMING", fileName: "forthcoming.txt" },
            { key: "archive", label: "ARCHIVE", fileName: "archive.txt" }
        ],
        items: [
            {
                section: "forthcoming",
                year: "2026",
                title: "Delete Me Kindly",
                descriptor: "Calamari Archive"
            },
            {
                section: "archive",
                year: "2026",
                title: "Tell Me I'm Alive",
                descriptor: "Always Crashing",
                publication: "Always Crashing",
                link: "http://alwayscrashing.com/current/2026/1/5/katherine-martin-tell-me-im-alive"
            }
        ]
    }
};
