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
    // Create a URL-friendly name part (limited to 20 chars)
    const namePart = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/^-|-$/g, '')       // Remove leading/trailing dashes
        .slice(0, 20);               // Limit length
    
    // Add a timestamp component
    const timestamp = Date.now().toString(36);
    
    // Add a random component (browser-safe)
    const randomPart = Math.random().toString(36).substring(2, 10);
    
    // Combine all components
    return `${namePart}-${timestamp}-${randomPart}`;
}