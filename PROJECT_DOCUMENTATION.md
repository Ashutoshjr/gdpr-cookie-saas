# GDPR Cookie Consent SaaS — Complete Project Documentation

---

## Table of Contents

1. [What Is This App?](#1-what-is-this-app)
2. [Why Does This App Exist? (The Problem)](#2-why-does-this-app-exist-the-problem)
3. [How It Works — Big Picture](#3-how-it-works--big-picture)
4. [The Three Components](#4-the-three-components)
   - [Backend API (.NET 8)](#41-backend-api-net-8)
   - [JavaScript SDK (The Banner)](#42-javascript-sdk-the-banner)
   - [Admin Dashboard (Angular)](#43-admin-dashboard-angular)
5. [Real-World Use Case — Step by Step](#5-real-world-use-case--step-by-step)
6. [GDPR Compliance — What This App Covers](#6-gdpr-compliance--what-this-app-covers)
7. [Database — What Gets Stored](#7-database--what-gets-stored)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [The Script Blocking Engine — How It Works](#9-the-script-blocking-engine--how-it-works)
10. [Security Design](#10-security-design)
11. [Architecture — Clean Architecture Explained](#11-architecture--clean-architecture-explained)
12. [Folder Structure Explained](#12-folder-structure-explained)

---

## 1. What Is This App?

**GDPR Cookie Consent SaaS** is a software-as-a-service product that helps website owners comply with GDPR (General Data Protection Regulation) cookie consent laws.

In simple terms:

> "This app gives any website owner a copy-paste JavaScript snippet that shows a GDPR-compliant cookie banner to their visitors, blocks tracking scripts until visitors give consent, and records every consent decision in a secure audit log."

### Think of it like this:

Imagine you own three websites:
- A blog (`myblog.com`)
- An online store (`myshop.com`)
- A portfolio (`myportfolio.com`)

Instead of building a cookie banner from scratch for each website, you register once on this SaaS platform, add each website, get a unique code snippet per website, paste it in, and you're done. All consent records are stored and viewable in one dashboard.

---

## 2. Why Does This App Exist? (The Problem)

### What is GDPR?
GDPR is a European Union law that requires websites to:
- Ask users for permission **before** running any non-essential tracking scripts (like Google Analytics, Facebook Pixel, etc.)
- Let users **choose** which categories of cookies they allow
- Store a **record** of who consented, when, and what they agreed to
- Allow users to **withdraw** consent at any time

### What happens if you ignore GDPR?
- Fines up to **€20 million or 4% of global revenue** (whichever is higher)
- Regulatory investigations
- Loss of user trust

### The Problem This App Solves
| Without This App | With This App |
|---|---|
| Developers must build a custom banner per site | One-time registration, reusable across all sites |
| No script blocking — trackers fire immediately | Scripts are blocked until user consents |
| No audit trail | Every consent is logged with timestamp, IP, categories |
| Users can't change their mind | "Manage Cookies" button always available |
| No central management | One dashboard manages all websites |

---

## 3. How It Works — Big Picture

```
┌─────────────────────────────────────────────────────────┐
│                    WEBSITE VISITOR                       │
│           (visits myblog.com for the first time)         │
└──────────────────────┬──────────────────────────────────┘
                       │ Page loads
                       ▼
┌─────────────────────────────────────────────────────────┐
│              JS SDK (cookie-consent.js)                  │
│   • Fetches banner config from the API                   │
│   • Shows cookie consent banner                          │
│   • Blocks tracking scripts until user decides           │
└──────────────────────┬──────────────────────────────────┘
                       │ User clicks "Accept All"
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API (.NET 8)                  │
│   • Records the consent (who, when, what categories)     │
│   • Stores it in SQL Server database                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│             ADMIN DASHBOARD (Angular)                    │
│   • Website owner logs in                                │
│   • Views all consent records                            │
│   • Manages websites and cookie categories               │
└─────────────────────────────────────────────────────────┘
```

---

## 4. The Three Components

### 4.1 Backend API (.NET 8)

**What it is:** A REST API built with .NET 8 using Clean Architecture.

**What it does:**
- Handles user registration and login (with JWT tokens)
- Manages websites and their cookie categories
- Records every consent decision from visitors
- Serves banner configuration to the JS SDK
- Provides consent logs to the dashboard

**Key design decisions:**
- **Clean Architecture** (4 layers: Domain → Application → Infrastructure → API) keeps business logic separate from database and web concerns
- **JWT Authentication** — dashboard users log in once and get a token valid for 24 hours
- **IMemoryCache** — the banner config endpoint is cached for 5 minutes because it gets called by every single visitor on every page load across all customer sites
- **EnsureCreated on startup** — database tables are auto-created when the API starts (no manual SQL needed)

**URL:** `http://localhost:5000`
**Swagger UI:** `http://localhost:5000/swagger`

---

### 4.2 JavaScript SDK (The Banner)

**What it is:** A single JavaScript file (~500 lines) that website owners embed on their site.

**File:** `sdk/cookie-consent.js`

**How to embed it:**
```html
<script src="http://localhost:3000/cookie-consent.js"
        data-api-key="YOUR-WEBSITE-API-KEY"
        data-api-url="http://localhost:5000">
</script>
```

**What it does (in order when a visitor lands on the page):**

| Step | What Happens |
|---|---|
| 1 | Script loads, reads `data-api-key` and `data-api-url` from the script tag |
| 2 | Fetches banner configuration from the API (banner text, categories, colors) |
| 3 | Checks localStorage — has this visitor consented before? |
| 4 | **If yes:** silently activates their previously allowed scripts, no banner shown |
| 5 | **If no:** shows the cookie consent banner |
| 6 | Visitor clicks Accept All / Reject All / Customize |
| 7 | Saves choice to localStorage AND posts a consent record to the API |
| 8 | Activates the scripts the visitor allowed |
| 9 | Shows a small "Manage Cookies" button so they can change their mind later |

**Blocking non-essential scripts (the key GDPR feature):**

Instead of writing `<script src="google-analytics.js">` normally, you write:
```html
<!-- BLOCKED until user consents to "analytics" category -->
<script type="text/plain" data-category="analytics" src="google-analytics.js"></script>

<!-- BLOCKED until user consents to "marketing" category -->
<script type="text/plain" data-category="marketing" src="facebook-pixel.js"></script>
```

The `type="text/plain"` tells the browser: **"do not execute this."**
When the user accepts analytics, the SDK replaces the blocked tag with a real `<script>` tag, and the browser runs it.

**Fail-Open Design:**
If the API is unreachable (down for maintenance), the SDK does NOT block the website or show an error. It simply skips the banner and lets scripts run. This prevents your customers' websites from breaking just because your API had downtime.

---

### 4.3 Admin Dashboard (Angular)

**What it is:** A web application for website owners to manage their GDPR consent setup.

**URL:** `http://localhost:4200`

**Pages and what they do:**

#### Login / Register Page
- New users create an account (name, email, password)
- Returning users log in with email + password
- On login, a JWT token is stored in localStorage and sent with every API call

#### Dashboard (Home)
- Shows a quick overview: how many websites you've registered, total consent records collected
- Quick links to main sections

#### Websites List
- Shows all websites you've registered
- Each row shows: Website Name, Domain, API Key (truncated for security), Date Added
- "Copy API Key" button — copies the key to clipboard
- "Delete" button — removes the website and ALL its consent records (cascade delete)

#### Add New Website
- Simple form: Website Name + Domain URL
- On submit: API creates the website AND automatically creates 3 default cookie categories:
  - **Necessary** (required, pre-checked, cannot be turned off)
  - **Analytics** (optional — e.g., Google Analytics)
  - **Marketing** (optional — e.g., Facebook Pixel)

#### Website Detail Page
- Shows full website info
- Lists all cookie categories for this website
- **Embed Snippet Card** — shows the exact `<script>` tag to copy-paste into any HTML page
- Copy button copies the full snippet to clipboard

#### Consent Logs Page
- Select a website from the dropdown
- See a paginated table of every consent record:
  - Session ID (anonymous visitor identifier)
  - Whether consent was given
  - Which categories they accepted
  - Timestamp
  - IP address
  - Browser (User Agent)
- This is your **GDPR audit trail** — proof that consent was properly collected

---

## 5. Real-World Use Case — Step by Step

### Scenario: Ashutosh owns a blog and wants to be GDPR compliant

**Step 1 — Register on the platform**
- Goes to `http://localhost:4200/register`
- Creates account: Name: Ashutosh, Email: ash@email.com, Password: ****

**Step 2 — Add his blog as a website**
- Goes to Websites → Add New Website
- Fills in: Name: "My Tech Blog", Domain: "https://mytechblog.com"
- System creates the website + 3 categories automatically
- Gets API Key: `a1b2c3d4-e5f6-...`

**Step 3 — Get the embed snippet**
- Opens website detail page
- Copies the snippet:
```html
<script src="http://cdn.example.com/cookie-consent.js"
        data-api-key="a1b2c3d4-e5f6-..."
        data-api-url="https://api.example.com">
</script>
```

**Step 4 — Update his blog's HTML**
- Pastes the snippet in the `<head>` of every page
- Changes his Google Analytics script from:
```html
<script src="https://www.googletagmanager.com/gtag/js"></script>
```
to:
```html
<script type="text/plain" data-category="analytics"
        src="https://www.googletagmanager.com/gtag/js"></script>
```

**Step 5 — A visitor lands on the blog**
- Visitor from Germany opens `mytechblog.com`
- Cookie banner appears: "We use cookies. Accept All / Reject All / Customize"
- Visitor clicks **"Customize"**
- Modal opens showing:
  - Necessary ✓ (greyed out — can't disable)
  - Analytics ✓ (visitor turns this ON)
  - Marketing ✗ (visitor leaves this OFF)
- Visitor clicks "Save Preferences"

**Step 6 — What happens behind the scenes**
- Google Analytics script gets activated (user allowed analytics)
- Facebook Pixel stays blocked (user rejected marketing)
- Consent record posted to API:
```json
{
  "websiteId": "a1b2c3d4-...",
  "sessionId": "uuid-visitor-123",
  "consentGiven": true,
  "categories": "{\"necessary\":true, \"analytics\":true, \"marketing\":false}",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows...)",
  "timestamp": "2026-04-15T10:30:00Z"
}
```

**Step 7 — Visitor returns the next day**
- Banner does NOT show again (consent stored in localStorage)
- Scripts activate immediately based on saved preferences
- Seamless experience

**Step 8 — Visitor changes their mind**
- Clicks the small "Manage Cookies" floating button (always visible)
- Modal reopens, pre-filled with their current choices
- They turn OFF Analytics
- New consent record is written to the API (full audit trail of changes)

**Step 9 — Ashutosh checks his audit log**
- Opens Dashboard → Consent Logs
- Selects "My Tech Blog" from dropdown
- Sees a table of all consents collected
- Can prove to regulators: "Yes, I collected proper GDPR consent"

---

## 6. GDPR Compliance — What This App Covers

| GDPR Requirement | How This App Handles It |
|---|---|
| **Ask before tracking** | Banner shown to every new visitor before any non-essential script runs |
| **Granular choice** | Users can accept/reject per category (analytics, marketing separately) |
| **Informed consent** | Each category has a Name and Description explaining what it's for |
| **Easy withdrawal** | "Manage Cookies" button always visible after consent |
| **Audit trail** | Every consent event logged with timestamp, IP, user agent, categories |
| **No dark patterns** | "Necessary" is the only pre-checked category; all others default to off |
| **No pre-ticked optional boxes** | Optional categories start unchecked in "Customize" modal |

---

## 7. Database — What Gets Stored

### Table: `Users`
| Column | Type | Description |
|---|---|---|
| Id | string | Unique user ID |
| Email | string | Login email |
| PasswordHash | string | BCrypt hashed password (never plain text) |
| FullName | string | Display name |
| CreatedAt | datetime | When account was created |

### Table: `Websites`
| Column | Type | Description |
|---|---|---|
| Id | GUID | Unique website ID |
| Name | string | e.g., "My Tech Blog" |
| Domain | string | e.g., "https://mytechblog.com" |
| ApiKey | GUID (unique) | The key embedded in the script tag |
| UserId | string | Owner's user ID |
| CreatedAt | datetime | When website was registered |

### Table: `CookieCategories`
| Column | Type | Description |
|---|---|---|
| Id | int | Auto-increment ID |
| WebsiteId | GUID (FK) | Which website this belongs to |
| Name | string | e.g., "Analytics" |
| Description | string | e.g., "Used for Google Analytics" |
| IsRequired | bool | If true, visitor cannot turn it off |
| CreatedAt | datetime | When category was created |

### Table: `Consents`
| Column | Type | Description |
|---|---|---|
| Id | int | Auto-increment ID |
| WebsiteId | GUID (FK) | Which website the visitor was on |
| SessionId | string | Anonymous visitor identifier (client-generated UUID) |
| ConsentGiven | bool | Did they accept anything? |
| Categories | string (JSON) | `{"analytics":true,"marketing":false}` |
| Timestamp | datetime | When consent was recorded |
| IpAddress | string | Visitor's IP address |
| UserAgent | string | Visitor's browser info |

---

## 8. API Endpoints Reference

### Public Endpoints (No Login Required — Used by the SDK)

#### `GET /api/config/{apiKey}`
Returns the banner configuration for a website.

**Example Request:**
```
GET http://localhost:5000/api/config/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Example Response:**
```json
{
  "websiteId": "a1b2c3d4-...",
  "websiteName": "My Tech Blog",
  "categories": [
    { "id": 1, "name": "Necessary", "description": "Required for the site to work", "isRequired": true },
    { "id": 2, "name": "Analytics", "description": "Helps us understand visitor behavior", "isRequired": false },
    { "id": 3, "name": "Marketing", "description": "Used for targeted advertising", "isRequired": false }
  ]
}
```

**Note:** This response is cached in memory for 5 minutes. This is critical because it gets called on every visitor's page load.

---

#### `POST /api/consent`
Records a visitor's consent decision.

**Example Request Body:**
```json
{
  "websiteId": "a1b2c3d4-...",
  "sessionId": "visitor-uuid-generated-client-side",
  "consentGiven": true,
  "categories": "{\"necessary\":true,\"analytics\":true,\"marketing\":false}"
}
```

**Example Response:**
```json
{ "id": 42 }
```

---

### Auth Endpoints (Account Management)

#### `POST /api/auth/register`
```json
{
  "fullName": "Ashutosh",
  "email": "ash@email.com",
  "password": "SecurePass123!"
}
```

#### `POST /api/auth/login`
```json
{
  "email": "ash@email.com",
  "password": "SecurePass123!"
}
```
**Returns:** `{ "token": "eyJhbGci...", "email": "ash@email.com", "fullName": "Ashutosh", "expiresAt": "..." }`

---

### Authenticated Endpoints (Dashboard — Requires JWT Token)

#### `GET /api/websites` — List all your websites
#### `POST /api/websites` — Register a new website
#### `GET /api/websites/{id}` — Get website details + categories
#### `DELETE /api/websites/{id}` — Delete website + all its data

#### `GET /api/consents?websiteId={id}&page=1&pageSize=20` — Get paginated consent logs

---

## 9. The Script Blocking Engine — How It Works

This is the most technically important part of the SDK. Here's exactly what happens:

### Before User Consents
Your tracking scripts are written with `type="text/plain"` — the browser sees them as inert text, not code:
```html
<!-- Browser IGNORES this — it's just text, not a script -->
<script type="text/plain" data-category="analytics" src="google-analytics.js"></script>
```

### After User Consents to "analytics"
The SDK finds all blocked scripts tagged with `data-category="analytics"` and **replaces** each one with a real `<script>` element:
```javascript
// What the SDK does internally:
const realScript = document.createElement('script');
realScript.src = 'google-analytics.js';
blockedScript.replaceWith(realScript); // Browser now sees a real script and runs it
```

**Why replace instead of just changing `type` to `"text/javascript"`?**
Changing the `type` attribute of an existing script element does NOT re-trigger execution in all browsers. Creating a new `<script>` element and inserting it is the reliable, cross-browser way to activate a script.

### What About Inline Scripts?
Works the same way:
```html
<script type="text/plain" data-category="marketing">
  fbq('init', '123456789');  // Facebook Pixel inline code
  fbq('track', 'PageView');
</script>
```
The SDK copies the `textContent` into a new script element and inserts it.

---

## 10. Security Design

### How Passwords Are Protected
Passwords are never stored as plain text. They are run through **BCrypt** (a one-way hashing algorithm):
```
"MyPassword123" → BCrypt → "$2a$11$5J7Xk2d9Lm3n4o5p6q7r8e..."
```
Even if the database were stolen, passwords cannot be recovered.

### How Authentication Works (JWT)
1. User logs in → server verifies password → generates a **JWT token**
2. The token contains: user ID, email, expiry time — all cryptographically signed
3. The dashboard sends this token with every API request in the `Authorization: Bearer <token>` header
4. The API verifies the token signature before processing any request
5. No cookies used for auth → not vulnerable to CSRF attacks

### API Key vs JWT Token
| | API Key | JWT Token |
|---|---|---|
| **Used by** | JavaScript SDK (public) | Admin dashboard (authenticated) |
| **Visible in** | HTML source of host website | localStorage only |
| **Purpose** | Identifies which website config to load | Proves user identity for admin actions |
| **Is it secret?** | No — it's a public identifier | Yes — never share it |

### How Ownership Is Enforced
When a logged-in user tries to view consents for a website, the API checks:
> "Does this website's `UserId` match the `sub` claim in your JWT token?"

If not, the request is rejected with **403 Forbidden** — even if you know the website ID.

### SQL Injection
All database queries use **Entity Framework Core's parameterized queries** — no raw SQL anywhere in the codebase. User input never goes directly into a SQL string.

### XSS Prevention in the SDK
Any text that comes from the API and is displayed in the banner (like website name or category description) is assigned to `element.textContent`, never `element.innerHTML`. This ensures malicious HTML in the API response cannot be injected into the visitor's page.

---

## 11. Architecture — Clean Architecture Explained

The backend is divided into 4 layers. Each layer only talks to the layer below it, never above:

```
┌────────────────────────────────────────────────┐
│              CookieConsent.API                  │
│  (HTTP Controllers, Middleware, Swagger, CORS)  │
│  Depends on: Application + Infrastructure      │
└──────────────────────┬─────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────┐
│          CookieConsent.Infrastructure           │
│  (Database, EF Core, JWT, BCrypt, Repositories) │
│  Depends on: Application                        │
└──────────────────────┬─────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────┐
│           CookieConsent.Application             │
│  (Business Logic, Services, Validators, DTOs)   │
│  Depends on: Domain                             │
└──────────────────────┬─────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────┐
│             CookieConsent.Domain                │
│  (Entities, Repository Interfaces, Exceptions)  │
│  Depends on: Nothing (pure C# classes)          │
└────────────────────────────────────────────────┘
```

**Why this matters:**
- The `Domain` and `Application` layers have zero dependency on SQL Server, BCrypt, or HTTP
- You could swap SQL Server for PostgreSQL by only changing `Infrastructure`
- Business rules (ownership checks, seeding default categories) live in `Application`, testable without a database

---

## 12. Folder Structure Explained

```
gdpr-cookie-saas/
│
├── backend/                          # .NET 8 Web API
│   └── src/
│       ├── CookieConsent.Domain/
│       │   ├── Entities/             # Data models (User, Website, Consent, CookieCategory)
│       │   └── Interfaces/           # Repository contracts (what operations exist)
│       │
│       ├── CookieConsent.Application/
│       │   ├── DTOs/                 # Data Transfer Objects (request/response shapes)
│       │   ├── Interfaces/           # IJwtService, IPasswordHasher
│       │   ├── Services/             # Business logic (AuthService, WebsiteService, etc.)
│       │   ├── Validators/           # FluentValidation rules
│       │   └── Exceptions/           # NotFoundException, ForbiddenException, etc.
│       │
│       ├── CookieConsent.Infrastructure/
│       │   ├── Data/                 # AppDbContext (EF Core database context)
│       │   ├── Repositories/         # Actual database query implementations
│       │   └── Services/             # JwtService, BcryptPasswordHasher
│       │
│       └── CookieConsent.API/
│           ├── Controllers/          # HTTP endpoint definitions
│           ├── Middleware/           # ExceptionMiddleware (converts exceptions to HTTP responses)
│           ├── Properties/           # launchSettings.json (port config)
│           └── Program.cs            # App startup and configuration
│
├── frontend/
│   └── cookie-dashboard/             # Angular 17+ standalone app
│       └── src/
│           ├── app/
│           │   ├── core/
│           │   │   ├── auth/         # AuthService, AuthGuard
│           │   │   ├── interceptors/ # JWT interceptor (auto-attaches token)
│           │   │   └── services/     # WebsiteService, ConsentService
│           │   ├── features/
│           │   │   ├── auth/         # Login + Register pages
│           │   │   ├── dashboard/    # Home overview page
│           │   │   ├── websites/     # List, New, Detail pages
│           │   │   └── consents/     # Consent logs page
│           │   ├── layout/
│           │   │   └── shell/        # Sidebar + nav wrapper
│           │   └── shared/           # Reusable components and pipes
│           └── environments/         # API URL config per environment
│
├── sdk/
│   ├── cookie-consent.js             # The embeddable banner (single IIFE file)
│   └── test.html                     # Manual test page to try the SDK locally
│
├── docker-compose.yml                # Runs SQL Server in Docker
└── .gitignore
```

---

## Quick Start Checklist

| Step | Command | URL |
|---|---|---|
| Start SQL Server | `docker-compose up -d` | — |
| Start Backend API | `dotnet run --project src/CookieConsent.API` | http://localhost:5000/swagger |
| Serve SDK locally | `npx http-server sdk/ -p 3000 --cors` | http://localhost:3000 |
| Start Dashboard | `npx ng serve` | http://localhost:4200 |

---

*This document covers the full scope of the GDPR Cookie Consent SaaS — from the visitor's first page load to the website owner's audit log review.*
