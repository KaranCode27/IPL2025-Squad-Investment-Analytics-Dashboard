# IPL 2025 Squad Investment Analytics: Custom Visual & Dashboard

This repository contains the complete codebase and dashboard assets for the **IPL 2025 Squad Investment Analytics** project. It showcases a premium, dark-themed sports analytics dashboard built around a **custom React Power BI Visual** integrated into a robust **Power BI Desktop Dashboard**.

---

## Why Build a Custom Visual & Dashboard?

When building high-end analytical applications, standard dashboard reporting tools often hit constraints in design, flexibility, and interactivity. This project combines a **Power BI Dashboard** with a **Custom React Visual** to achieve the best of both worlds:

### 1. Why a Custom Visual (React + TypeScript + D3)?
* **Breaking Out-of-the-Box Limitations:** Standard Power BI visuals (tables, slicers, cards) have rigid formatting. A custom visual written in React allows total control over HTML structure, CSS layouts, and micro-interactions.
* **Unified Portal Experience:** Instead of cluttering a report page with dozens of individual charts, filters, and cards, we developed a single, cohesive visual that functions like a standalone sports analytics portal (complete with custom page tabs, interactive lists, and nested sidebars).
* **Bespoke UI styling:** Implements an interactive dark-slate theme with:
  * A **2-column CSS Grid sidebar filter** for Teams and Tiers.
  * An **Active View Stats** panel in the sidebar showing live sub-totals of filtered records.
  * Custom **initial-themed team badges** (e.g. `RP` for Rishabh Pant, `VK` for Virat Kohli) replacing generic emojis.
  * Seamless responsive chart wrappers using Flexbox for high-resolution displays.
* **Precision Formatting:** Customized metric cards rendering monetary values in Indian Rupees (Crores) rounded to exactly two decimal places (e.g., `₹1,182.40 Cr` instead of broad approximations).

### 2. Why the Power BI Dashboard Integration?
* **Engine-Level Efficiency:** Power BI’s VertiPaq engine manages the storage, data relationships, and data modeling behind the scenes, allowing the front-end visual to render queries at sub-second speeds.
* **Advanced Calculations with DAX:** Complex metrics (such as Squad Limits, Salary Cap Utilizations, and Return on Investment (ROI) scores combining Runs/Wickets against player auction price) are computed efficiently at the data-model level using custom DAX measures.
* **Ease of Deployment:** Users can consume the visual directly within their Power BI Desktop or Power BI Service environment, leveraging standard data gateway connections and sharing permissions.

---

## Project Structure

```
iplSquadVisual/
├── .gitignore               # Ensures node_modules/ and build outputs are excluded
├── capabilities.json        # Declares Power BI data roles, capabilities, and settings
├── package.json             # Visual project metadata and npm script configs
├── pbiviz.json              # Custom visual package configuration (metadata, entry points)
├── tsconfig.json            # TypeScript configuration
├── src/                     # Source code of the custom visual
│   ├── app/
│   │   └── App.tsx          # Main React logic, stats processing, and page rendering
│   └── visual.ts            # Entry point bridging Power BI commands and React
├── style/
│   └── visual.less          # Custom styling, scrollbars, and theme configuration
└── dashboard/               # Pre-compiled visual and dashboard assets
    ├── IPL_2025_Squad_Investment_Analytics_Dashboard.pbix  # Power BI report file
    ├── iplSquadVisual.pbiviz                               # Compiled visual package
    ├── dashboard_dax_measures.txt                         # Complete list of DAX measures
    ├── ipl_dark_theme.json                                 # Custom Power BI dark theme template
    ├── IPL_2025_All_Players_Data.xlsx                      # Raw multi-sheet Excel data source
    ├── datasets/                                           # Cleaned CSV files used as data sources
    │   ├── IPL_2025_All_Auction_Data.csv
    │   └── IPL_2025_All_Verified_Stats.csv
    └── scripts/                                            # Data pipelines and cleaning scripts
        ├── compile_all_players.py                          # Compiles, scrapes and cleans wiki tables
        ├── fuzzy_match_players.py                          # Multi-dataset fuzzy name mapping
        ├── parse_auction_tables.py                         # Web crawler for auction data
        └── ... (20 additional python helper scripts)
```

---

## Technical Highlights

### 1. Data Model & DAX Formulas
All metrics are driven by an optimized relational model. Example DAX formulas used in the report:
* **ROI Score:** Combines performance statistics with auction cost.
  ```dax
  ROI Score = 
  VAR Price = SUM(Auction_Data[Final_Player_Price_Cr])
  VAR TotalRuns = SUM(Performance_Data[Runs])
  VAR TotalWickets = SUM(Performance_Data[Wickets])
  RETURN
      IF(Price > 0, DIVIDE(TotalRuns + (TotalWickets * 25), Price, 0), 0)
  ```
* **Top 10 ROI Auto-Filter:** Automatically focuses charts on high-yield investments.
  ```dax
  Top 10 ROI Score = 
  VAR PlayerRank = RANKX(ALLSELECTED(Auction_Data[Player]), [ROI Score], , DESC, Dense)
  RETURN IF(PlayerRank <= 10, [ROI Score], BLANK())
  ```

### 2. Python-Based Web Scraping & Data Prep Pipeline
Before loading the data into Power BI, we built a Python-based pipeline to compile the dataset:
* **Scraping Wikipedia:** Crawled and parsed HTML tables using Python (`requests` and `BeautifulSoup`) to extract the raw 2025 IPL auction buy/retained structures.
* **Fuzzy String Matching:** Used `difflib` and custom mapping regex to automatically align player name spelling differences between performance records (e.g. scorecard spelling) and auction sheets (e.g. register spelling).
* **Statistical Verification:** Re-computed aggregate averages, strike rates, and economies to ensure data integrity before exporting cleanly formatted CSV tables.

### 3. React Layout Engine
The custom visual handles state management internally to render three distinct dashboard pages:
1. **Squad Overview:** Dynamic cards displaying Total Investment, Average Cost, Most Expensive Player, and player detail list.
2. **ROI & Performance Charts:** Flex-based scatter plots charting Cost vs. Runs and Cost vs. Wickets with customized legends.
3. **Detailed Rosters:** Scrollable, high-contrast grid listing all squad positions, auction types, and statistics.

---

## Getting Started

### Prerequisites
* [Node.js (v18 or v20 recommended)](https://nodejs.org/)
* [Power BI Desktop](https://powerbi.microsoft.com/desktop/)

### Installation & Development
1. Clone this repository:
   ```bash
   git clone https://github.com/KaranCode27/IPL2025-Squad-Investment-Analytics-Dashboard.git
   cd iplSquadVisual
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the visual locally in developer mode:
   ```bash
   npm start
   ```
   * _Note: To test the local developer visual, ensure "Developer Visual" is enabled in Power BI Desktop settings under Options > Security._

### How to use the compiled visual
1. Open the Power BI Desktop file located at `dashboard/IPL_2025_Squad_Investment_Analytics_Dashboard.pbix`.
2. To load/update the custom visual, click the **three dots (...)** in the _Visualizations_ pane.
3. Select **Import a visual from a file** and choose `dashboard/iplSquadVisual.pbiviz`.
