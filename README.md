# 📋 Taskbox: Agile Project Management Workspace

## Overview
Taskbox is a comprehensive, Kanban-style project management platform inspired by tools like Trello and Jira. Designed to streamline team workflows, it allows users to create workspaces, manage customized columns, and track tasks through interactive boards. 

The project demonstrates advanced frontend engineering, specifically focusing on complex state management, modern UI/UX principles, and seamless integration with a robust Backend-as-a-Service (BaaS).

## 🧠 Technical Highlights & Architecture

Building a Kanban board requires meticulous state synchronization between the UI and the database. Taskbox tackles these challenges through the following architectural decisions:

### 1. Complex State Management (Redux Toolkit)
Managing nested data structures (Boards → Columns → Tasks) requires a highly predictable state container to prevent UI desyncs. 
* Taskbox utilizes **Redux Toolkit (RTK)** to centralize the application state (`boardsSlice`, `boardDetailSlice`, `authSlice`). 
* This ensures that complex interactions—such as moving all tasks between columns, duplicating columns, or updating specific task labels—are processed predictably and reflect instantly on the UI without requiring heavy, full-page reloads.

### 2. Robust Backend & Authentication (Supabase)
Instead of building a bespoke backend from scratch, Taskbox leverages **Supabase** (an open-source Firebase alternative powered by PostgreSQL) to handle critical infrastructure:
* **Authentication:** Seamless user onboarding utilizing Supabase Auth, featuring both secure Email/Password registration and OAuth (Google) integration.
* **Database & Row Level Security (RLS):** Ensures that users can only access, edit, or delete boards and tasks that they are explicitly authorized to see.

### 3. Team Collaboration & Access Control
The platform extends beyond personal task management by introducing team mechanics:
* Features a dedicated member management system, allowing board owners to invite collaborators, assign members to specific tasks via interactive popovers, and revoke access when necessary.

### 4. Modern, Accessible UI (Tailwind & Shadcn)
The interface is built with **Tailwind CSS** and **Shadcn UI** (Radix UI primitives). This combination ensures that the application is not only visually polished and fully responsive but also adheres strictly to web accessibility standards (WAI-ARIA). The app makes extensive use of complex UI patterns like Dialogs, Popovers, Context Menus, and Sheets for a highly interactive, desktop-like experience on the web.

## 💻 Tech Stack
* **Frontend Framework:** React, TypeScript, Vite.
* **State Management:** Redux Toolkit.
* **Backend & Database:** Supabase (PostgreSQL, Auth).
* **Styling & Components:** Tailwind CSS, Shadcn UI (Accessible Primitives).
* **Routing:** React Router DOM (with protected route wrappers).
