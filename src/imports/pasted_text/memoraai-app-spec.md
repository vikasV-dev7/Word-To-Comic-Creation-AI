Build a complete production-ready full-stack web application called "MemoraAI".

Project Theme:
An Offline AI-powered Memory-to-Comic Generator where users convert their personal memories into beautiful comics while keeping all AI inference on-device.

The application must have a premium, modern, elegant, and cute UI while maintaining a professional appearance.

=========================================================
GENERAL REQUIREMENTS
=========================================================

• Responsive Web Application
• Dark Login Screen
• Modern Glassmorphism
• Rounded Components
• Organic Blob Cards
• Notebook / Journal Aesthetic
• Smooth Animations
• Clean Typography
• Offline-first Design
• Privacy Focused
• Open Source Ready

=========================================================
TECH STACK
=========================================================

Frontend
---------
React.js
Vite
TypeScript
Tailwind CSS
Framer Motion
React Router
React Hook Form
React Icons
Shadcn UI

Backend
---------
FastAPI

Database
---------
SQLite (local)
SQLAlchemy ORM

Authentication
--------------
JWT Authentication

Storage
--------------
Local File Storage

AI Models
--------------
Small Offline Models Only

Suggested:

• SmolLM2
OR

• Qwen2.5 1.5B Instruct

Comic Script Generation

ONNX Runtime

No OpenAI API
No Gemini API

Everything runs locally.

=========================================================
LOGIN PAGE
=========================================================

Background

Pure Matte Black

Center Glass Card

Application Logo

Title

MemoraAI

Subtitle

"Every Memory Deserves a Story."

Fields

Full Name

Email

Date of Birth

Gender

Gender Options

Female

Male

Begin Journey Button

=========================================================
THEME ENGINE
=========================================================

If Female selected

Dashboard Theme

Pastel Dark Pink

Primary
#D97A9B

Secondary
#F6D7E1

Accent
#7A4A5A

If Male selected

Dashboard Theme

Pastel Dark Blue

Primary
#5878A8

Secondary
#D8E5F7

Accent
#2E4564

Allow changing theme later.

=========================================================
DASHBOARD
=========================================================

Top Navigation

Logo

Welcome User

Search

Notifications

Profile

Settings

Main Area

Display THREE ORGANIC SHAPED CARDS

NOT rectangles.

Use blob style.

Card 1

✨ Memory Canvas

Card 2

🎨 Cover Canvas

Card 3

📖 Flashback

Each card has hover animation.

=========================================================
FLASHBACK
=========================================================

Show complete history.

Each project card contains

Comic Thumbnail

Comic Title

Date

Language

Emotion

Characters

Open

Edit

Download

Delete

Search Memories

Filter

Year

Language

Emotion

Favorite

Everything stored locally.

=========================================================
MEMORY CANVAS
=========================================================

Step 1

Characters

Allow Unlimited Characters

Character Card

Name

Gender

Height

Dress

Dress Color

Upload Character Image

Age (Optional)

Character Description

Add Character Button

Character Preview

=========================================================
Step 2

Memory Prompt

Situation List

User can create

Situation 1

Situation 2

Situation 3

...

Unlimited

Each Situation contains

Location

Situation Description

Emotion

Time

Weather

Dialogue Section

Add Dialogue Button

Each Dialogue

Character Dropdown

Dialogue Textbox

Emotion

Expression

Add Another Dialogue

=========================================================
Step 3

TikTik

Timeline Section

Choose

Date

Time

Year

Optional

Show timeline preview.

=========================================================
Step 4

Comic Pages

Dropdown

1

2

3

...

100

=========================================================
Step 5

Language

Dropdown

English

Tamil

Hindi

Japanese

Chinese

French

Spanish

German

Arabic

Korean

Italian

Russian

Portuguese

Malayalam

Telugu

Kannada

All Languages

=========================================================
GENERATE STORY BUTTON
=========================================================

When clicked

Backend sends

Characters

Situations

Dialogues

Timeline

Language

to Local LLM.

LLM returns

Comic Script

Scene Breakdown

Panel Description

Emotion

Speech Bubbles

Character Consistency

Store in Database.

=========================================================
COVER CANVAS
=========================================================

Front Cover

Comic Title

Author Name

Upload Character Images (Optional)

Character Arrangement

Prompt describing cover

Comic Style

Cover Theme

Background Color

Typography

Generate Cover

=========================================================
Back Cover

Author Name

Author Description Prompt

AI Generate Biography

Digital Signature

Draw Signature

Color Picker

Brush Thickness

Clear Button

Save Signature

=========================================================
AI PIPELINE
=========================================================

Comic Script Generation

↓

Scene Extraction

↓

Dialogue Generation

↓

Panel Planning

↓

Character Consistency

↓

Comic Layout

↓

Cover Generation

↓

PDF Export

Everything Offline

=========================================================
OUTPUT
=========================================================

Generate

Comic PDF

Comic Images

Editable JSON

Speech Bubble Layout

Panel Layout

Cover

=========================================================
DATABASE
=========================================================

Users

Characters

Projects

Situations

Dialogues

Generated Comics

Flashback

Settings

=========================================================
BACKEND API
=========================================================

POST /login

POST /register

GET /profile

POST /character

GET /characters

POST /memory

POST /dialogue

POST /cover

POST /generate-script

POST /generate-cover

POST /generate-comic

GET /flashback

GET /comic/{id}

DELETE /comic/{id}

PUT /comic/{id}

=========================================================
AI WORKFLOW
=========================================================

User Input

↓

Small Offline LLM

↓

Extract

Characters

Events

Location

Emotion

↓

Generate Story

↓

Scene Planner

↓

Comic Panel Generator

↓

Speech Bubble Generator

↓

Cover Generator

↓

Store

↓

Flashback

=========================================================
ANIMATIONS
=========================================================

Page Flip

Notebook Opening

Floating Cards

Blob Morph

Fade In

Smooth Hover

Button Bounce

Comic Opening Animation

=========================================================
DEPLOYMENT
=========================================================

Docker Support

Frontend

Backend

SQLite

One Command

docker compose up

=========================================================
CODE QUALITY
=========================================================

Proper Folder Structure

Reusable Components

Clean APIs

Comments

Error Handling

Loading States

Skeleton UI

Responsive

Accessible

Production Ready

Maintainable

Scalable

User Memory
      ↓
Character Extractor
      ↓
Memory Analyzer
      ↓
Timeline Builder
      ↓
Dialogue Generator
      ↓
Scene Planner
      ↓
Panel Generator
      ↓
Comic Layout Engine
      ↓
Cover Generator
      ↓
PDF / Images / Flashback