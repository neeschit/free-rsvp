# 📄 Kiddobash App – Product Requirements Document (Living PRD)

*Last updated: [Insert date here]*

---

## 🎯 Vision

Kiddobash makes children's party planning simple and stress-free, from invitations to event coordination.

---

## 📌 Target Audience

- **Primary:** Parents and guardians planning birthday parties for kids aged 1–12.
- **Secondary:** Extended family, friends, and event attendees.

---

## 📦 Core Product Features

### ✅ Event Creation & Management

- Simple event setup: Date, time, location, theme selection.
- Real-time RSVP tracking (Going, Not Going, Maybe).
- Editable event details post-creation.

### 🎨 Invitations & Themes

- Library of customizable, playful invitation themes.
- Animated, visually appealing invite previews.
- Ability to personalize invites with child's name, photo, and special notes.

### 📋 Guest Management

- Anonymous RSVP feature to protect privacy.
- Easy-to-use guest lists with attendance statuses.
- Exportable guest lists (CSV, PDF).

### 🎈 Party Coordination

- Optional modules for managing food, gifts, and activities.
- Potluck-style coordination (who's bringing what).
- Integration with popular digital calendars (Google, Apple).

### 📱 Mobile-first, Responsive Design

- Fully responsive layout optimized for mobile use.
- Tailwind CSS framework for fast, consistent styling.
- Toggleable dark mode support for better user accessibility.

---

## 🖥 App Structure & Pages

### 1. **Landing Page**

- Friendly, whimsical, clear CTAs ("Get Started", "See a Demo").
- Clear showcase of core features.
- Trust-building copy and social proof.

### 2. **Dashboard**

- Overview of upcoming events.
- Quick access to RSVP lists and event editing.
- Notifications of new RSVPs or event updates.

### 3. **Event Page**

- Detailed view of a single event, including guest list and coordination options.
- Edit functionality for host.

### 4. **Invite & RSVP Page**

- Branded invite view for guests.
- Simple, anonymous RSVP submission process.

### 5. **Browse Themes Page**

- Showcase of available invitation and party themes.
- Interactive preview and selection mechanism.

### 6. **About & Contact Pages**

- Company info, mission statement, and contact form.

---

## 🎛 Component Architecture

### Reusable Components

- Header (Logo, navigation, CTA)
- HeroSection (Key messaging, CTA)
- FeatureGrid (Icon cards)
- EventCard (Dashboard overview)
- Footer (Navigation links, social media)

### Component Guidelines

- Built with semantic HTML and Tailwind CSS.
- Highly modular and composable.
- Include responsive behavior by default.

---

## 🚀 Technical Stack
- **Frontend:** React with Server-Side Rendering (SSR) using React Router v7, Tailwind CSS, TypeScript
- **Backend:** AWS Lambda functions
- **Database:** DynamoDB
- **Hosting:** CloudFront
- **Production URL:** [https://www.kiddobash.com](https://www.kiddobash.com)

---

## 📈 Success Metrics

- User sign-ups and active monthly users.
- Event creation and RSVP rates.
- User feedback and satisfaction scores.

---

## 🛠 Implementation & Maintenance

- Regular code reviews and PR-based workflow.
- Automated testing (unit, integration, E2E).
- Regular user feedback loops for iterative improvement.

---

## 🔮 Future Enhancements (Backlog)

- Premium themes and custom designs.
- Direct integration with popular messaging apps.
- User accounts and personalized dashboards.
- Advanced event analytics for hosts.

---

## 📅 Document Update Process

- Update after each major release cycle.
- Record updates in a clear "Last updated" timestamp.
- Solicit feedback from stakeholders regularly.

---

## 📃 Disclaimer & Terms (Draft)

- Kiddobash is a free tool created to help parents plan and manage children's parties with ease.
- Kiddobash does not collect or sell personal data beyond what is required for RSVP functionality.
- All event data is publicly accessible right now, but is not crawleable to bots.
- Kiddobash is not responsible for the actions of event attendees or the outcomes of events.
- All content (themes, invites, illustrations) is for personal, non-commercial use only.
- Terms may be updated over time and will be reflected here.


