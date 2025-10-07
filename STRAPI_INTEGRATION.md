# Strapi API Integration for Portfolio

This document explains the integration of Strapi API with the React Portfolio Template.

## Overview

The portfolio section has been updated to fetch data from your Strapi API instead of using static JSON data. This allows for dynamic content management through your Strapi admin panel.

## API Endpoints

### Base URL

```
https://refined-peace-3dcd962811.strapiapp.com/api/
```

### Endpoints Used

1. **Projects**: `/projects?populate=*`

   - Fetches all projects with related data (images, categories, tags)
   - Only projects with `project_status: true` are displayed

2. **Categories**: `/projects-categories`
   - Fetches all project categories
   - Only categories with `category_status: true` are used for filtering

## Data Structure

### Project Data Format

```json
{
  "id": 3,
  "documentId": "gckypxmwq0jfwi8nzmy39wjg",
  "title": "Yalla LMS System",
  "subtitle": "LMS Systems",
  "description": "A feature-rich e-learning platform...",
  "view_link": "https://www.yallastartnow.com/",
  "project_status": true,
  "image": {
    "url": "https://refined-peace-3dcd962811.media.strapiapp.com/...",
    "alt": "Project image",
    "formats": { ... }
  },
  "categories": [
    {
      "id": 2,
      "name": "LMS Systems",
      "status": true
    }
  ],
  "tags": ["lms", "next.js", "react.js"]
}
```

### Category Data Format

```json
{
  "id": 2,
  "documentId": "e8ut2zprj19o0xg31nsdwf3q",
  "name": "LMS Systems",
  "category_status": true
}
```

## Components

### New Components Created

1. **ArticlePortfolioStrapi.jsx**

   - Main component that handles Strapi data fetching and display
   - Includes loading and error states
   - Supports category filtering
   - Displays project images, titles, descriptions, and tags

2. **strapiApi.js**
   - API service for fetching and transforming Strapi data
   - Handles data transformation from Strapi format to component format
   - Includes error handling and data validation

### Files Modified

1. **SectionBody.jsx**

   - Added import and registration for `ArticlePortfolioStrapi` component

2. **sections.json**

   - Updated portfolio section to use `portfolio-strapi.json` configuration

3. **portfolio-strapi.json**
   - New configuration file for Strapi-based portfolio

## Features

### Automatic Filtering

- Projects with `project_status: false` are automatically hidden
- Categories with `category_status: false` are excluded from filtering
- Dynamic category filtering based on project categories

### Image Handling

- Supports multiple image formats (large, medium, small, thumbnail)
- Falls back to original image if formats are not available
- Uses medium format by default for optimal performance

### Icon Generation

- Automatically generates FontAwesome icons based on project categories
- Color coding based on category type:
  - LMS Systems: Blue (#007bff)
  - Web Applications: Green (#28a745)
  - E-commerce: Red (#dc3545)
  - WordPress: WordPress Blue (#21759b)

### Tag Display

- Shows all project tags as badges
- Tags are styled consistently with the existing design

## Error Handling

The integration includes comprehensive error handling:

1. **API Errors**: Displays user-friendly error messages
2. **Loading States**: Shows spinner while fetching data
3. **Data Validation**: Filters out invalid or disabled items
4. **Network Issues**: Graceful fallback for connection problems

## Usage

To use the Strapi integration:

1. Ensure your Strapi API is accessible
2. The portfolio section will automatically fetch and display your projects
3. Categories are automatically generated from your Strapi categories
4. Projects are filtered by status and displayed with proper formatting

## Customization

### Adding New Categories

1. Add categories in your Strapi admin panel
2. Set `category_status: true` for active categories
3. The component will automatically detect and use new categories

### Adding New Projects

1. Create projects in your Strapi admin panel
2. Set `project_status: true` for active projects
3. Assign categories and tags as needed
4. Upload project images
5. Projects will automatically appear in the portfolio

### Styling

- Styles are in `ArticlePortfolioStrapi.scss`
- Follows the existing design system
- Supports both light and dark themes

## Troubleshooting

### Common Issues

1. **No projects showing**

   - Check that `project_status` is set to `true` in Strapi
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **Images not loading**

   - Ensure images are uploaded in Strapi
   - Check image URL accessibility
   - Verify image formats are generated

3. **Categories not working**
   - Ensure `category_status` is set to `true`
   - Check that projects are assigned to categories
   - Verify category names match exactly

### Debug Mode

Enable console logging by checking the browser's developer tools for any error messages or API response issues.
