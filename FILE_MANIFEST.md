# Scrappy's Exotic Yard - Separated Files Manifest

## HTML Pages
- `index.html` - Genetics Calculator main page (references external CSS & JS)
- `terminologies.html` - Terminology glossary page (references external CSS & JS)

## Stylesheets
- `styles.css` - Shared styles (header, nav, dark mode, variables) - used by both pages
- `index-styles.css` - Index page specific styles (calculator layout, forms, results table)
- `terminologies-styles.css` - Terminologies page specific styles (card grid, category sections)

## JavaScript
- `shared.js` - Shared functionality (dark mode toggle, localStorage)
- `index.js` - Index page specific scripts (genetics calculator logic, gene selection, simulation, PNG export)

## Data Files
- `gene-library.json` - Gene data for the calculator (organized by category: normal, visual, het, super)
- `terminologies-data.json` - Terminology data organized by 4 categories with all term definitions

## Assets
- `ScrappyLogo.png` - Logo image

## File Organization Summary
All CSS, JavaScript, and data are separated from HTML for:
- Better modularity and reusability
- Easier maintenance and updates
- Cleaner file structure
- No information loss - all content preserved

All external files should be in the same directory as the HTML files for relative paths to work correctly.
