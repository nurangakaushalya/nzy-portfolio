# Nzy — Creative Portfolio Prototype

A responsive portfolio prototype for **Nzy** (video editing and graphic design), featuring a YouTube-inspired media browsing grid, live category filtering and search, hover video previews, YouTube/MP4 and multi-image gallery modals, WhatsApp enquiry preparation, and a browser-persisted demo admin dashboard.

## Running Locally

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

### Running Unit Tests

```bash
npx --yes tsx --test src/utils/portfolio.test.ts
```

## Configuration & Customization

- **Brand Name & WhatsApp Business Number**: Edit `src/config/brand.ts` (`BRAND_CONFIG.name`, `BRAND_CONFIG.whatsappBusinessNumber`, and `BRAND_CONFIG.serviceOptions`). Set `whatsappBusinessNumber` to digits-only international format (e.g., `15550199999`) to enable direct `wa.me` launch links.
- **Seed Projects & Categories**: Update `src/data/seedData.ts` to replace demonstration projects, thumbnails, preview clips, and YouTube URLs.
- **Data Access Layer**: `src/data/portfolioRepository.ts` isolates persistence behind `PortfolioRepository`. Replace `localPortfolioRepository` with an API or CMS adapter when connecting a backend database.

## Prototype-Only Features

- **Demo Admin (`/admin`)**: Project creation, editing, reordering, hide/publish toggles, category management, and small local image uploads (max 500 KB) are stored in `window.localStorage` (`nzy_portfolio_data_v1`) in the current browser only.
- **No Production Auth or Cloud Upload Storage**: `/admin` is a frontend demonstration without authentication or shared cloud file storage. Deleting a project from the website portfolio does not remove its video from YouTube.
- **WhatsApp Enquiry**: When `whatsappBusinessNumber` is empty, submitting the Contact Us form prepares and previews the formatted WhatsApp message and explains where to configure the business number without opening an invalid `wa.me` link.
