# Strapi API Integration for React Portfolio

This document describes the Strapi API integration features added to the React Portfolio template.

## Overview

The portfolio now includes full Strapi API integration for:

- **Portfolio Projects**: Dynamic project display from Strapi CMS
- **Resume Download**: Automatic resume fetching and download
- **Contact Form**: Form submission to Strapi backend

## API Endpoints

### Base URL

```
https://refined-peace-3dcd962811.strapiapp.com/api/
```

### Endpoints Used

1. **Projects**: `projects?populate=*`
2. **Categories**: `projects-categories`
3. **Resume**: `my-cv?populate=*`
4. **Contact Form**: `contacts` (POST)

## Features

### Portfolio Management

- **Dynamic Portfolio Display**: Fetches projects and categories from Strapi API
- **Smart Filtering**: Filter projects by category with dynamic counts
- **Icon Generation**: Automatically generates appropriate icons based on project type
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Graceful error handling with user feedback
- **Image Support**: Displays project images in avatar components
- **Tag Display**: Shows project tags from API data
- **Category Management**: Only shows categories with `category_status: true`
- **Project Filtering**: Only shows projects with `project_status: true`

### Resume Download

- **Dynamic Resume Fetching**: Downloads resume from Strapi API
- **Automatic Loading**: Fetches resume data on component mount
- **Error Handling**: Shows appropriate error messages if download fails
- **Loading States**: Displays loading notification during fetch

### Contact Form

- **Strapi Integration**: Submits contact form data to Strapi API
- **Field Validation**: Validates all required fields (name, email, subject, message)
- **Email Validation**: Basic email format validation
- **Success/Error Handling**: Shows appropriate success/error messages
- **Form Reset**: Allows users to send another message after submission

## Data Structure

### Projects API Response

```json
{
  "data": [
    {
      "id": 3,
      "documentId": "gckypxmwq0jfwi8nzmy39wjg",
      "title": "Yalla LMS System",
      "subtitle": "LMS Systems",
      "description": "A feature-rich e-learning platform...",
      "project_status": true,
      "view_link": "https://www.yallastartnow.com/",
      "image": {
        "url": "https://refined-peace-3dcd962811.media.strapiapp.com/portfolio_17_96cb56c803.png",
        "alternativeText": null
      },
      "categories": [
        {
          "id": 2,
          "name": "LMS Systems",
          "category_status": true
        }
      ],
      "tags": [
        {
          "id": 10,
          "name": "lms"
        }
      ]
    }
  ]
}
```

### Categories API Response

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "e8ut2zprj19o0xg31nsdwf3q",
      "name": "LMS Systems",
      "category_status": true
    }
  ]
}
```

### Resume API Response

```json
{
  "data": {
    "id": 2,
    "documentId": "s3jzkcu3j8zaaau04nl27frq",
    "my_cv": {
      "id": 2,
      "name": "ESLAM-SABER-ELFAR-CV.pdf",
      "url": "https://refined-peace-3dcd962811.media.strapiapp.com/",
      "size": 122.51,
      "ext": ".pdf",
      "mime": "application/pdf"
    }
  }
}
```

## Components

### New Components Created

1. **ArticlePortfolioStrapi.jsx**: Portfolio component using Strapi data
2. **ArticleContactFormStrapi.jsx**: Contact form component using Strapi API
3. **strapiApi.js**: API service for Strapi interactions

### Modified Components

1. **NavToolResumeDownloader.jsx**: Updated to use Strapi resume endpoint
2. **SectionBody.jsx**: Added new components to the registry

## Configuration Files

### Portfolio Configuration

- **File**: `public/data/sections/portfolio-strapi.json`
- **Component**: `ArticlePortfolioStrapi`

### Contact Form Configuration

- **File**: `public/data/sections/contact-strapi.json`
- **Component**: `ArticleContactFormStrapi`

## Usage

### Setting up Portfolio with Strapi

1. Update `public/data/sections.json`:

```json
{
  "portfolio": {
    "jsonPath": "/data/sections/portfolio-strapi.json"
  }
}
```

### Setting up Contact Form with Strapi

1. Update `public/data/sections.json`:

```json
{
  "contact": {
    "jsonPath": "/data/sections/contact-strapi.json"
  }
}
```

## Error Handling

The integration includes comprehensive error handling:

- **Network Errors**: Shows user-friendly error messages
- **Data Validation**: Validates API responses before processing
- **Loading States**: Shows spinners during API calls
- **Fallback Behavior**: Graceful degradation when API is unavailable

## Customization

### Adding New Project Types

To add new project types with custom icons and colors, modify the `getFaIcon` and `getIconColors` functions in `ArticlePortfolioStrapi.jsx`.

### Modifying API Endpoints

Update the `STRAPI_BASE_URL` constant in `strapiApi.js` to point to your Strapi instance.

## Troubleshooting

### Common Issues

1. **Projects not showing**: Check if `project_status` is `true` in Strapi
2. **Categories not showing**: Check if `category_status` is `true` in Strapi
3. **Resume download fails**: Verify the resume file exists in Strapi media library
4. **Contact form errors**: Check if the contacts collection is properly configured in Strapi

### Debug Information

The integration includes extensive console logging for debugging:

- API request URLs
- Response data structure
- Transformation results
- Error details

## Dependencies

- **React**: For component development
- **Fetch API**: For HTTP requests
- **Bootstrap**: For UI components
- **FontAwesome**: For icons

## License

This integration follows the same MIT license as the original React Portfolio template.
