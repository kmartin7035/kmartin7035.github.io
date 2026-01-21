// ==========================================
// CONFIGURATION (EDIT YOUR DETAILS HERE)
// ==========================================
const data = {
    "authorName": "Katherine Martin",
    "role": "Data Scientist / Writer",
    "bio": "Katherine Martin is a data scientist and writer. She holds degrees in creative writing and chemistry, and spends her time building predictive models and watering her one particularly large houseplant.",
    "email": "contact@neonspine.net",
    "discord": {
        "text": "I run a gamified critique discord server for writers focused on improving craft through structured feedback.",
        "link": "https://discord.gg/KEU8YqGQGp"
    },
    "works": [
        {
            "year": "2026",
            "title": "Tell Me I’m Alive",
            "publication": "Always Crashing",
            "link": "http://alwayscrashing.com/current/2026/1/5/katherine-martin-tell-me-im-alive"
        }
    ]
};

// ==========================================
// THE LOGIC (DO NOT EDIT BELOW THIS LINE)
// ==========================================

// 1. Populate Simple Text Fields
document.getElementById('author-name').textContent = data.authorName;
document.getElementById('author-role').textContent = data.role;
document.getElementById('bio-text').textContent = data.bio;

// 2. Populate Discord Section
document.getElementById('discord-text').textContent = data.discord.text;
document.getElementById('discord-link').href = data.discord.link;

// 3. Populate Footer
const currentYear = new Date().getFullYear();
document.getElementById('footer-year').textContent = currentYear;
document.getElementById('footer-name').textContent = data.authorName;
document.getElementById('footer-email').href = `mailto:${data.email}`;

// 4. Build the Works List
const workList = document.getElementById('work-list');

data.works.forEach(work => {
    // Create list item
    const li = document.createElement('li');

    // Create date span
    const dateSpan = document.createElement('span');
    dateSpan.className = 'date';
    dateSpan.textContent = `[${work.year}]`;
    li.appendChild(dateSpan);

    // Create title (link or text)
    if (work.link) {
        const a = document.createElement('a');
        a.href = work.link;
        a.textContent = `"${work.title}"`;
        li.appendChild(a);
    } else {
        const span = document.createElement('span');
        span.textContent = work.title;
        li.appendChild(span);
    }

    // Create publication info if it exists
    if (work.publication) {
        const em = document.createElement('em');
        li.appendChild(document.createTextNode(' — ')); 
        em.textContent = `Published in ${work.publication}`;
        li.appendChild(em);
    }

    // Add to the list
    workList.appendChild(li);
});
