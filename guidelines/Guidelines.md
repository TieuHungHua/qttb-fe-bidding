# QTTB Design System Guidelines

## 1. Brand context

**QTTB** (Equipment & Procurement Management) is an internal B2B platform that digitalises the full procurement and tendering lifecycle for public schools. The system includes **two distinct portals**: the Staff Portal (internal employees) and the Supplier Portal (external vendors).

This is **not** a consumer app, not a startup dashboard, and not a generic e-commerce platform.  
The design system must balance:

- **Compliance-first** — every critical state transition must be explicit, auditable, and confirmed
- **Trust for financial transactions** — budgets, contracts, performance bonds, payment schedules
- **Process transparency** — all 15 bidding project states must always be visible
- **Operational efficiency** — staff use this daily and need fast, low-click workflows

The visual language must communicate:

- **certainty** — users trust every decision they make
- **structure** — complex multi-step processes are presented with clarity
- **restrained formality** — serious B2B without feeling cold or bureaucratic
- **consistency** — no visual surprises
- **transparency** — status, permissions, and available actions are always explicit

Brand metaphor: **clear structure, transparent process**.

---

## 2. Core design principles

### 2.1. Compliance-first visibility

Every critical state transition (approve, reject, cancel, terminate) must trigger a ConfirmDialog that records a reason. Destructive actions must use a clearly destructive color and explicitly describe the consequences before the user confirms.

### 2.2. Status is always visible

Every entity with a workflow must display a color-coded StatusBadge at all times. Plain text status labels are not permitted. A WorkflowTimeline must appear on every detail screen.

### 2.3. Desktop-first, controlled density

The system targets screens ≥1280px. Staff work at desks with high volumes of information — density is acceptable, but hierarchy and order must always be maintained.

### 2.4. Dual-portal differentiation

The Staff Portal and Supplier Portal must be visually distinct so users never confuse their environment. Different primary colors serve as the primary orientation signal.

### 2.5. Forms and tables are the heart of the system

Unlike consumer apps, users spend most of their time in data entry forms and DataTables. These two patterns must be designed with exceptional care — readable, scannable, and error-resistant.

### 2.6. Workflow buttons use conditional visibility

Action buttons (Submit / Approve / Reject / Cancel) only render when the entity is in the correct state and the user holds the required permission. Never render disabled buttons to "indicate existence" — hide them completely when unavailable.

---

## 3. Color system

### 3.1. Color intent

Every color has a clear responsibility:

- **Staff Primary** — trust, authority, internal actions
- **Supplier Primary** — portal differentiation, approachable, lower authority level
- **Secondary** — structural support, section backgrounds, borders
- **Tertiary** — positive highlights, featured states, important badges
- **Error / Destructive** — cancel, reject, blacklist, irreversible actions
- **Warning** — standstill period, approaching deadlines, attention required
- **Success** — approved, completed, contract signed, bid won
- **Neutral** — page backgrounds, card surfaces, body text

Staff Primary and Neutral should dominate the visual area.  
Tertiary, Warning, and Success must be used sparingly and intentionally.  
Error must be used decisively and only for destructive actions.

---

### 3.2. Core palette

#### Staff Portal Primary

- `#1D4ED8` — trustworthy institutional blue

#### Supplier Portal Primary

- `#0F766E` — teal, approachable, clearly distinct from Staff

#### Secondary

- `#475569` — cool-neutral slate, structural support

#### Tertiary (positive highlight)

- `#D97706` — warm amber, for featured / recommended / important badges

#### Error / Destructive

- `#DC2626` — standard red for cancel / reject / blacklist

#### Warning

- `#B45309` — warm brown-orange, for standstill / expiring deadlines / attention states

#### Success

- `#15803D` — green for approved / completed / bid awarded

#### Neutral (page background base)

- `#F8FAFC`

---

### 3.3. Extended scales

#### Staff Primary scale

- 10: `#0C2461`
- 20: `#1E3A8A`
- 30: `#1D4ED8`
- 40: `#3B82F6`
- 50: `#60A5FA`
- 60: `#93C5FD`
- 70: `#BFDBFE`
- 80: `#DBEAFE`
- 90: `#EFF6FF`

#### Supplier Primary scale

- 10: `#042F2E`
- 20: `#134E4A`
- 30: `#0F766E`
- 40: `#0D9488`
- 50: `#14B8A6`
- 60: `#5EEAD4`
- 70: `#99F6E4`
- 80: `#CCFBF1`
- 90: `#F0FDFA`

#### Secondary scale

- 10: `#0F172A`
- 20: `#1E293B`
- 30: `#334155`
- 40: `#475569`
- 50: `#64748B`
- 60: `#94A3B8`
- 70: `#CBD5E1`
- 80: `#E2E8F0`
- 90: `#F1F5F9`

#### Tertiary scale

- 10: `#451A03`
- 20: `#78350F`
- 30: `#92400E`
- 40: `#B45309`
- 50: `#D97706`
- 60: `#F59E0B`
- 70: `#FCD34D`
- 80: `#FDE68A`
- 90: `#FEF3C7`

#### Error scale

- 10: `#450A0A`
- 20: `#7F1D1D`
- 30: `#991B1B`
- 40: `#B91C1C`
- 50: `#DC2626`
- 60: `#F87171`
- 70: `#FCA5A5`
- 80: `#FECACA`
- 90: `#FEF2F2`

#### Success scale

- 10: `#052E16`
- 20: `#14532D`
- 30: `#166534`
- 40: `#15803D`
- 50: `#16A34A`
- 60: `#4ADE80`
- 70: `#86EFAC`
- 80: `#BBF7D0`
- 90: `#F0FDF4`

#### Warning scale

- 10: `#1C0A00`
- 20: `#431407`
- 30: `#7C2D12`
- 40: `#9A3412`
- 50: `#B45309`
- 60: `#D97706`
- 70: `#FCD34D`
- 80: `#FDE68A`
- 90: `#FFFBEB`

#### Neutral scale

- 0: `#FFFFFF`
- 10: `#F8FAFC`
- 20: `#F1F5F9`
- 30: `#E2E8F0`
- 40: `#CBD5E1`
- 50: `#94A3B8`
- 60: `#64748B`
- 70: `#475569`
- 80: `#1E293B`
- 90: `#0F172A`

---

### 3.4. Color usage rules

#### Backgrounds

- Main page background: Neutral 10 (`#F8FAFC`)
- Card / panel surface: Neutral 0 (`#FFFFFF`)
- Alternating sections or sidebar: Secondary 90 (`#F1F5F9`)
- Staff app header: Staff Primary 20 (`#1E3A8A`) or 30
- Supplier app header: Supplier Primary 30 (`#0F766E`)
- Never use pure white as the full-page background — it creates a blank, empty feeling

#### Text

- Primary body text: Neutral 80 (`#1E293B`)
- Secondary text / metadata: Secondary 40 (`#475569`) or Neutral 60
- Text on dark primary surfaces: Neutral 0 (`#FFFFFF`)
- Form labels: Neutral 70 (`#475569`), weight medium
- Placeholder text: Secondary 60 (`#94A3B8`)

#### Actions

- Primary CTA (Staff): Staff Primary 30, white text. Hover: Primary 20
- Primary CTA (Supplier): Supplier Primary 30, white text. Hover: Supplier Primary 20
- Secondary CTA: Secondary 90 background, Secondary 40 text, Secondary 70 border
- Destructive button: Error 50, white text. Hover: Error 40
- Disabled: Neutral 30 background, Neutral 50 text — never use opacity

#### Status badge color map

| Status                        | Background       | Text / Border    |
| ----------------------------- | ---------------- | ---------------- |
| `draft`                       | Secondary 90     | Secondary 40     |
| `pending` / `submitted`       | Tertiary 90      | Tertiary 40      |
| `approved` / `reviewed`       | Success 90       | Success 40       |
| `published` / `open`          | Staff Primary 90 | Staff Primary 30 |
| `closed` / `evaluating`       | Warning 90       | Warning 40       |
| `ranked` / `result_pending`   | Tertiary 80      | Tertiary 30      |
| `announced` / `standstill`    | Warning 80       | Warning 30       |
| `has_complaint`               | Error 90         | Error 40         |
| `contract_signed` / `awarded` | Success 80       | Success 30       |
| `cancelled` / `terminated`    | Error 90         | Error 50         |
| `blacklisted`                 | Error 80         | Error 40         |

#### Highlights / Featured

- Background: Tertiary 90 (`#FEF3C7`)
- Icon / text accent: Tertiary 40–50
- Use for: rank-1 bidder, recommended supplier, priority procurement package

#### Error states

- Error field background: Error 90
- Error field border: Error 50
- Error message text: Error 40
- Errors must appear immediately below the field — no delay

#### Focus ring

- Color: Staff Primary 60 (`#93C5FD`) for Staff Portal
- Color: Supplier Primary 60 (`#5EEAD4`) for Supplier Portal
- Style: 2px solid, 2px offset — visible but not neon

---

## 4. Typography

### 4.1. Typographic personality

Typography must convey:

- **precision** — users need to read figures, dates, and reference codes quickly
- **structure** — hierarchy must be clear from display down to caption
- **restrained formality** — serious B2B without feeling like a government portal
- **legibility at high density** — multiple data points on the same screen at all times

Avoid fonts that are:

- overly decorative or editorial
- too thin or light at small sizes
- monospace for body text
- associated with startup or consumer products

---

### 4.2. Typographic strategy

Use a **single high-quality sans-serif** throughout the entire UI. No serif is needed — this is an operational system, not an editorial platform.

Recommended fonts in order of preference:

1. **Plus Jakarta Sans** — modern, slightly distinctive, excellent legibility at all sizes
2. **DM Sans** — clean without being soulless, strong for data-heavy UI
3. **IBM Plex Sans** — formal feel, excellent readability, fits institutional context
4. **Fallback**: `system-ui, -apple-system, sans-serif`

Use **monospace** (IBM Plex Mono or JetBrains Mono) ONLY for:

- Bidding project codes, contract numbers, supplier codes
- Financial amounts in summary/financial tables
- UUIDs or technical reference codes displayed to users

---

### 4.3. Type scale

| Token     | Size | Weight | Line height | Used for                              |
| --------- | ---- | ------ | ----------- | ------------------------------------- |
| `display` | 28px | 700    | 1.2         | Main page title, page header          |
| `h1`      | 24px | 600    | 1.3         | Primary section heading               |
| `h2`      | 20px | 600    | 1.35        | Sub-section, modal title, tab heading |
| `h3`      | 16px | 600    | 1.4         | Card heading, group label             |
| `body-lg` | 15px | 400    | 1.6         | Primary body text, descriptions       |
| `body`    | 14px | 400    | 1.6         | Table cell, form value, default text  |
| `body-sm` | 13px | 400    | 1.5         | Metadata, helper text                 |
| `label`   | 13px | 500    | 1.4         | Form label, table column header       |
| `caption` | 12px | 400    | 1.4         | Timestamp, footnote, tooltip          |
| `badge`   | 11px | 600    | 1           | StatusBadge text                      |
| `mono`    | 13px | 400    | 1.4         | Codes, important financial numbers    |

---

### 4.4. Numbers and dates

- Currency: `1,234,567,890 ₫` — comma thousand separator, Vietnamese Đồng symbol at end
- Date: `dd/MM/yyyy` — Vietnamese standard
- Date + time: `dd/MM/yyyy HH:mm`
- Amounts in tables: right-aligned, monospace font, no color unless emphasis is needed
- Large amounts (contract value, budget): size `body-lg` or `h3`, weight semibold

---

## 5. Shape language

### 5.1. Corner radius

Use moderate rounding — not bubbly, not sharp:

- Small buttons, inputs, badges: `6px`
- Cards, panels, dropdowns: `8px`
- Modals, dialogs, sheets: `12px`
- Tooltips: `4px`

Never use `border-radius: 9999px` on cards or panels — reserve pill-shape for badges, chips, and avatars only.

### 5.2. Borders

- Default border: `1px solid` Secondary 80 (`#E2E8F0`)
- Hover / focused container border: Secondary 60 (`#94A3B8`)
- Section divider: Secondary 90 (`#F1F5F9`) — very subtle
- Never use thick `2px` borders as dividers — use background color contrast instead

### 5.3. Geometry

Layout must feel:

- grid-aligned (12-column or sidebar + content)
- consistently aligned across all components
- systematically spaced with no arbitrary gaps
- no element "floating" outside the established grid

---

## 6. Elevation and shadows

Use subtle, purposeful shadows — never dramatic:

```
shadow-xs:  0 1px 2px rgba(15,23,42,0.06)
shadow-sm:  0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)
shadow-md:  0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.04)
shadow-lg:  0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04)
```

Usage:

- `shadow-xs` — resting input
- `shadow-sm` — card, panel
- `shadow-md` — dropdown, popover, tooltip
- `shadow-lg` — modal, dialog

Avoid:

- Colored shadows (blue, primary-tinted)
- Heavy shadows that make cards appear detached
- Multiple stacked shadows on the same element
- Shadows on flat elements like badges or dividers

---

## 7. Spacing system

Base: 4px grid

| Token      | Value | Used for                                  |
| ---------- | ----- | ----------------------------------------- |
| `space-1`  | 4px   | Smallest inline gap (icon–text)           |
| `space-2`  | 8px   | Badge padding, gap between small elements |
| `space-3`  | 12px  | Small button padding, compact row gap     |
| `space-4`  | 16px  | Default button padding, table row gap     |
| `space-5`  | 20px  | Small card padding                        |
| `space-6`  | 24px  | Standard card padding, small section gap  |
| `space-8`  | 32px  | Gap between sections                      |
| `space-10` | 40px  | Page content padding                      |
| `space-12` | 48px  | Large section spacing                     |
| `space-16` | 64px  | Gap between major layout blocks           |

Prefer generous vertical rhythm — do not compress too much information into a single block.

---

## 8. Layout

### 8.1. Staff Portal layout

```
┌─────────────────────────────────────────────┐
│  Top Navigation (64px)                       │
├────────────┬────────────────────────────────┤
│  Sidebar   │  Main Content                   │
│  (240px    │  (flex-fill)                    │
│  expanded) │                                 │
│  (60px     │                                 │
│  collapsed)│                                 │
└────────────┴────────────────────────────────┘
```

- Sidebar expanded: ≥1280px
- Sidebar icon-only: 768–1279px
- Hamburger menu: <768px (not optimised — system is desktop-first)

### 8.2. Bidding project detail layout (3-column)

```
┌──────────────┬──────────────────────────────┐
│ Info + Stepper│  Tab panel (8 tabs)          │
│  (1/3)       │  (2/3)                        │
│              │  ─────────────────────────    │
│  Basic info  │  [Info][Doc][Expert][Review]… │
│              │                               │
│  ─────────── │  Tab content area             │
│  15-step     │                               │
│  vertical    │                               │
│  stepper     │                               │
└──────────────┴──────────────────────────────┘
```

### 8.3. Breakpoints

| Breakpoint | Width  | Behaviour                     |
| ---------- | ------ | ----------------------------- |
| `sm`       | 640px  | Stack columns                 |
| `md`       | 768px  | Sidebar collapses to icons    |
| `lg`       | 1024px | Standard 2-column layouts     |
| `xl`       | 1280px | Full layout, sidebar expanded |
| `2xl`      | 1536px | Max content width 1400px      |

---

## 9. Component design guidance

### 9.1. Buttons

#### Primary button

- Background: portal primary (Staff `#1D4ED8` / Supplier `#0F766E`)
- Text: white, weight 500, size 14px
- Padding: `10px 16px`
- Radius: `6px`
- Hover: primary-20 (darker)
- Disabled: Neutral 30 bg, Neutral 50 text — never use opacity
- Left icon: 16px, 8px gap to text

#### Secondary button

- Background: Secondary 90
- Text: Secondary 30, weight 500
- Border: `1px solid` Secondary 70
- Hover: Secondary 80 background
- Use for: secondary actions, cancel, filters, export

#### Destructive button

- Background: Error 50 (`#DC2626`)
- Text: white
- Hover: Error 40
- Use for: cancel bidding project, blacklist supplier, delete, terminate contract
- **Always paired with a ConfirmDialog** — never allow immediate destructive action

#### Ghost button

- Background: transparent
- Text: primary or secondary color
- Hover: light tint of text color
- Use for: row-level table actions, icon buttons, link-like actions

#### Workflow action buttons

- Only render when entity `status` and user `permission` both match
- Never render as disabled to "signal existence"
- Group actions: non-destructive left, destructive rightmost
- Separate destructive from non-destructive with clear visual grouping

---

### 9.2. StatusBadge

Pill-shape, font 11px weight 600, padding `2px 8px`, radius `9999px`.

Colors follow the table in section 3.4. Plain text status labels are never acceptable.

Size variants:

- `sm`: 11px, padding `1px 6px` — table rows
- `md`: 12px, padding `2px 8px` — cards, headers
- `lg`: 13px, padding `4px 12px` — detail page, prominent placement

---

### 9.3. DataTable

Required structure:

```
┌─────────────────────────────────────────────────────┐
│  [Title]        [Search___]  [Filter▼]  [+ Add new] │  ← Header bar
├──────┬──────────┬────────────┬───────────┬──────────┤
│  #   │  Name    │  Status    │  Date     │  Actions │  ← Column headers
├──────┼──────────┼────────────┼───────────┼──────────┤
│  1   │  ...     │  Badge     │ dd/MM/yyyy│ [👁][✏️] │  ← Row (odd: white)
├──────┼──────────┼────────────┼───────────┼──────────┤
│  2   │  ...     │  Badge     │ dd/MM/yyyy│ [👁][✏️] │  ← Row (even: Neutral 10)
├──────┴──────────┴────────────┴───────────┴──────────┤
│  Showing 1–20 of 48 records         [<][1][2][3][>] │  ← Pagination
└─────────────────────────────────────────────────────┘
```

- Striped rows: odd = white, even = Neutral 10
- Row hover: Secondary 90 (`#F1F5F9`)
- Column header: 13px weight 500, Secondary 40, Secondary 90 background
- Currency amounts: right-aligned, monospace font
- Long text: truncate with `ellipsis`, full text on hover tooltip
- Empty state: icon + "No data yet" + CTA if user has create permission
- Skeleton loading: 5 placeholder rows shown while fetching

---

### 9.4. WorkflowTimeline

Vertical timeline, displayed in the sidebar of a detail page or within the "History" tab.

```
  ●  bid_draft              ← Completed (Success 40, filled dot)
  │  Nguyen Van A • 12/03/2026 10:30
  │
  ●  bid_reviewed           ← Completed
  │  Tran Thi B • 14/03/2026 09:00
  │
  ◉  bid_approved           ← Current (Staff Primary 30, pulsing)
  │  Awaiting action
  │
  ○  published              ← Future (Secondary 60, empty dot)
  │
  ○  open
  │  ...
```

- Dot size: 12px
- Connector line: 1px Secondary 70
- Completed: Success 40 dot, Neutral 70 text
- Current: Primary 30 dot with subtle pulse animation, Neutral 80 text
- Future: Secondary 60 dot, Secondary 50 text
- Do not show actor or timestamp for future steps

---

### 9.5. ConfirmDialog

```
┌──────────────────────────────────┐
│  ⚠️  Confirm bidding cancellation │ ← Icon + Title (H2)
│                                   │
│  This action cannot be undone.    │ ← Consequence description (body-sm, Neutral 70)
│  The bidding project will be      │
│  cancelled and all associated     │
│  bid submissions will be closed.  │
│                                   │
│  Cancellation reason *            │ ← Required textarea (when reason needed)
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                   │
│              [Cancel]  [Confirm]  │ ← Footer; destructive action on the right
└──────────────────────────────────┘
```

- Icon `⚠️` Warning 40 for caution actions; `🚫` Error 40 for destructive actions
- Confirm button: destructive style (Error 50) for irreversible actions
- Reason textarea: required for cancel / reject / blacklist — disable Confirm until filled
- Modal width: 480px, backdrop `rgba(15,23,42,0.4)`
- Do not close on backdrop click for destructive actions

---

### 9.6. FormModal

```
┌──────────────────────────────────────┐
│  Create new bidding project  [✕]     │ ← Sticky header, H2
├──────────────────────────────────────┤
│                                       │
│  Project code *                       │ ← Scrollable form body
│  ┌───────────────────────────────┐   │
│  │ GT-2026-001                   │   │
│  └───────────────────────────────┘   │
│                                       │
│  Project title *                      │
│  ...                                  │
│                                       │
├──────────────────────────────────────┤
│               [Cancel]  [Save]        │ ← Sticky footer, right-aligned
└──────────────────────────────────────┘
```

- Header: sticky, padding `20px 24px`, border-bottom Secondary 80
- Body: `overflow-y: auto`, padding `24px`, max-height `calc(100vh - 200px)`
- Footer: sticky, padding `16px 24px`, border-top Secondary 80, buttons right-aligned
- Width: `560px` for standard forms; `720px` for forms with item tables
- Never use full-screen modal except for the PAW Form Builder

---

### 9.7. Input and form controls

```
Label *                     ← 13px, weight 500, Neutral 70, mb 6px
┌─────────────────────────┐
│  Placeholder text        │  ← 14px, Secondary 60
└─────────────────────────┘
  Helper text               ← 12px, Secondary 50
```

States:

- **Resting**: Secondary 70 border, white background
- **Focus**: Primary 40 border, `box-shadow: 0 0 0 3px Primary-90`
- **Error**: Error 50 border, subtle Error 90 background tint
- **Disabled**: Neutral 20 background, Secondary 60 text, Neutral 40 border
- **Filled**: Secondary 60 border, Neutral 80 text

Select, Datepicker, and Textarea share the same state system.

---

### 9.8. KPICard

```
┌──────────────────────────────┐
│  📋  Open bidding projects    │ ← 20px icon + Label (13px, Secondary 50)
│                               │
│  24                           │ ← Large number (28px, weight 700, Neutral 90)
│                               │
│  ↑ 3 vs. last month           │ ← Delta (12px, Success 40 if up / Error 40 if down)
└──────────────────────────────┘
```

- Background: white, shadow-sm
- Border: 1px Secondary 80
- Padding: 20px
- Layout: 4-card horizontal grid on the dashboard

---

### 9.9. Vertical stepper — Bidding Project (15 steps)

Displayed in the left column of the bidding project detail screen. The 15 ordered states:

1. `bid_draft` — Draft created
2. `bid_reviewed` — Expert committee reviews bidding documents
3. `bid_approved` — Board approves bidding documents
4. `published` — Published
5. `open` — Accepting bid submissions
6. `closed` — Submission deadline passed
7. `bid_opening` — Public bid opening ceremony
8. `evaluating` — Preliminary evaluation
9. `tech_eval` — Technical evaluation
10. `fin_eval` — Financial evaluation
11. `ranked` — Bidders ranked
12. `result_pending` — Review committee prepares report
13. `reviewed` — Board approves evaluation result
14. `announced` / `standstill` — Result announced, complaint window open
15. `contract_signed` / `awarded` — Contract signed

Visual rules:

- Completed steps: Success 40 filled dot, muted text
- Current step: Primary 30 outlined dot with pulse animation, bold text + status badge
- Future steps: Secondary 60 empty dot, Neutral 50 text
- If `cancelled`: all steps after the cancellation point turn Error 80 with a ✕ icon

---

### 9.10. Alert / System banner

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  Accepting this complaint will AUTOMATICALLY CANCEL the   │
│     bidding project. This action cannot be undone.           │
└──────────────────────────────────────────────────────────────┘
```

Four types:

- `info`: Primary 90 background, Primary 40 border and icon
- `success`: Success 90 background, Success 40 border and icon
- `warning`: Warning 90 background, Warning 40 border and icon — use for standstill countdown
- `error`: Error 90 background, Error 40 border and icon — use for cancellation warnings

Place banners **above forms** or **at the top of a section**. Never use a toast notification for serious warnings.

---

### 9.11. UploadArea

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│  📎  Drag and drop files here         │  ← Dashed border Secondary 60
│      or click to browse               │     Secondary 90 background
│      PDF, DOCX — max 10MB             │     radius 8px
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

  📄 CompanyProfile.pdf   2.3MB  [✕]   ← Uploaded file row with remove button
  📄 BidPriceSchedule.xlsx 1.1MB [✕]
```

- Drag-over state: Primary 40 border, Primary 90 background
- File item: Secondary 90 background, radius 6px, padding `8px 12px`

---

### 9.12. Inline editable table (Budget Lines / PO Items)

```
┌─────────────────────────┬──────────────────┬──────────────┬───┐
│  Item name              │  Estimated amount │  Note        │   │
├─────────────────────────┼──────────────────┼──────────────┼───┤
│  [Purchase computers___]│  [200,000,000____]│  [10 units__]│ × │
│  [Replace AC units_____]│  [150,000,000____]│  [5 units___]│ × │
├─────────────────────────┴──────────────────┴──────────────┴───┤
│  + Add row                                                      │
├─────────────────────────────────────────────────────────────────┤
│  Estimated total:                          350,000,000 ₫        │
└─────────────────────────────────────────────────────────────────┘
```

- Active cell: Primary 40 focus ring
- Remove row button: Ghost button Error 40 color — only visible on row hover
- Total footer: sticky bottom on long tables, monospace font weight 600

---

## 10. Empty states and loading states

### 10.1. Empty state

Every DataTable and list must have a defined empty state:

```
           📋
    No bidding projects yet
    Create your first bidding project to begin the procurement process.

           [+ Create project]    ← Only rendered when user has permission
```

- Icon: 40px, Secondary 50
- Heading: H3, Neutral 70
- Supporting text: body-sm, Secondary 50
- CTA button: Primary style, only rendered when user holds the required permission

### 10.2. Skeleton loading

Use skeleton screens instead of spinners when fetching data:

- Color: Secondary 80 with animated shimmer gradient
- Row count: 5 rows at actual row height
- Text placeholders: randomised widths between 40–80% for a natural appearance
- Animation duration: 1.5s linear cycle

---

## 11. Motion

Motion must be subtle and purposeful:

- Modal / Dialog open: `fade + scale(0.97 → 1)`, `150ms ease-out`
- Dropdown / Popover open: `fade + translateY(-4px → 0)`, `120ms ease-out`
- Toast notification: `slide in from right`, `200ms ease-out`
- Row hover: `background transition`, `80ms`
- Stepper current step pulse: `opacity 1 → 0.6 → 1`, `1.5s infinite`
- Skeleton shimmer: `background-position`, `1.5s linear infinite`

Avoid:

- Bounce or spring animations
- Any UI interaction transition longer than 300ms
- Animations on table rows during scroll

---

## 12. Accessibility

Non-negotiable requirements:

- All text must meet at minimum WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- Focus rings must be clearly visible on every interactive element
- Error messages must not rely on color alone — always include an icon or descriptive text
- Form labels must be programmatically linked to inputs via `for/id` or `aria-labelledby`
- StatusBadge must include an `aria-label` that describes the full status in plain language
- ConfirmDialog must trap focus while open
- The vertical stepper must set `aria-current="step"` on the active step
- Every icon-only button must have an `aria-label` or `title` attribute

---

## 13. Supplier Portal — differentiation rules

The Supplier Portal replaces Staff Primary with Supplier Primary (`#0F766E`) everywhere:

- App header background: Supplier Primary 30
- Primary CTA: Supplier Primary 30
- Focus ring: Supplier Primary 60
- Link color: Supplier Primary 40

All other components (DataTable, Badge, Modal, etc.) share the same design system as the Staff Portal.

**Account registration screen** (public, no login required):

- Layout: centered card 480px wide, 40px padding, shadow-lg
- No sidebar
- Page background: subtle gradient from Supplier Primary 90 → Neutral 10
- Info banner: "Your account will be reviewed within 1–3 business days"
- Tax code field must validate uniqueness in real time

---

## 14. What this system must not become

Do not turn QTTB into:

- A startup dashboard with purple/neon gradients
- A rigid government portal with bureaucratic visual language
- A consumer app with bubbly cards and bounce animations
- A generic admin template (white + Bootstrap green)

QTTB must feel like:
**a professional institutional system — structured, trustworthy, and built for daily financial decision-making**

---

## 15. Tone for AI-generated design outputs

When generating or revising UI, optimise in this order:

1. **Status correctness** — StatusBadge uses the right color; workflow buttons respect state and permission
2. **Readability** — sufficient contrast, clear hierarchy
3. **Controlled density** — lots of information, but never chaotic
4. **Consistency** — correct components from this guide are used throughout
5. **Restrained formality** — B2B but not cold

The output must feel:
**organised, trustworthy, appropriately formal, and genuinely usable every day**