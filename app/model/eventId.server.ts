const randomizers = [
    "gleam",
    "pulse",
    "buzz",
    "chime",
    "echo",
    "wink",
    "dash",
    "flair",
    "zest",
    "spark",
    "glow",
    "vibe",
    "aura",
    "zest",
    "flair",
    "blitz",
    "pop",
    "zoom",
    "click",
    "tap",
    "flock",
    "crew",
    "tribe",
    "gang",
    "squad",
    "circle",
    "posse",
    "clique",
    "cohort",
    "group",
    "meet",
    "join",
    "unite",
    "bond",
    "share",
    "gather",
    "connect",
    "engage",
    "mingle",
    "fete",
    "gala",
    "bash",
    "party",
    "soiree",
    "affair",
    "meetup",
    "gig",
    "jam",
    "fest",
    "shindig",
    "rendezvous",
    "meetup",
    "hangout",
    "chill",
    "relax",
    "enjoy",
    "celebrate",
    "synergy",
    "fusion",
    "blend",
    "mix",
    "merge",
    "collide",
    "intersect",
    "connect",
    "link",
    "bond",
    "echo",
    "reflect",
    "resonate",
    "amplify",
    "amplify",
    "elevate",
    "inspire",
    "ignite",
    "evolve",
    "transform"
  ];

export function getEventId(name: string) {
    const count = 3;
    const formattedName = name.toLocaleLowerCase().replaceAll(' ', '-');
    let result = `${formattedName}-`;

    for (let i = 0; i < count; i ++) {
        const item = Math.floor((Math.random() * 100000) % randomizers.length);
        result += `${randomizers[item]}-`
    }

    result += crypto.randomUUID().slice(0, 8);

    return result;
}