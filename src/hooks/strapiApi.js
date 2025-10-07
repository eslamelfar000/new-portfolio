/**
 * @author Your Name
 * @date 2025-01-27
 * @description Strapi API service for portfolio projects and categories
 */

const STRAPI_BASE_URL = 'https://refined-peace-3dcd962811.strapiapp.com/api'

export const useStrapiApi = () => {
    return {
        fetchProjects,
        fetchCategories,
        transformProjectData,
        transformCategoryData,
        fetchResume,
        submitContactForm
    }
}

/**
 * Fetch projects from Strapi API
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
const fetchProjects = async (options = {}) => {
    try {
        console.log('Fetching projects from:', `${STRAPI_BASE_URL}/project?populate=*`)
        
        const response = await fetch(`${STRAPI_BASE_URL}/project?populate=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || [],
            meta: data.meta || {}
        }
    } catch (error) {
        console.error('Error fetching projects:', error)
        return {
            success: false,
            error: error.message,
            data: [],
            meta: {}
        }
    }
}

/**
 * Fetch categories from Strapi API
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
const fetchCategories = async (options = {}) => {
    try {
        console.log('Fetching categories from:', `${STRAPI_BASE_URL}/projects-categorie`)
        
        const response = await fetch(`${STRAPI_BASE_URL}/projects-categorie`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || [],
            meta: data.meta || {}
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return {
            success: false,
            error: error.message,
            data: [],
            meta: {}
        }
    }
}

/**
 * Transform Strapi project data to portfolio format
 * @param {Object} strapiProject - Raw Strapi project data
 * @returns {Object} - Transformed project data
 */
const transformProjectData = (strapiProject) => {
    // Check if strapiProject has the expected structure
    if (!strapiProject) {
        console.warn('Invalid project data structure:', strapiProject)
        return null
    }

    // Handle both flat and nested structures
    const { id, attributes } = strapiProject
    const projectData = attributes || strapiProject
    
    // Only include projects with project_status = true (default to true if not specified)
    if (projectData.project_status === false) {
        return null
    }

    // Get image URL (handle both nested and flat structures)
    let imageUrl = '';
    if (projectData.image?.data?.attributes?.formats?.medium?.url) {
        imageUrl = projectData.image.data.attributes.formats.medium.url;
    } else if (projectData.image?.data?.attributes?.url) {
        imageUrl = projectData.image.data.attributes.url;
    } else if (projectData.image?.formats?.medium?.url) {
        imageUrl = projectData.image.formats.medium.url;
    } else if (projectData.image?.url) {
        imageUrl = projectData.image.url;
    }
    
    // Ensure the URL is absolute (add base URL if it's relative)
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://refined-peace-3dcd962811.media.strapiapp.com${imageUrl}`;
    }

    // Transform categories (handle both nested and flat structures)
    let categories = [];
    if (projectData.categories?.data) {
        // Nested structure
        categories = projectData.categories.data.map(cat => ({
            id: cat.id,
            name: cat.attributes?.name || '',
            status: cat.attributes?.category_status !== false
        }));
    } else if (projectData.categories) {
        // Flat structure
        categories = projectData.categories.map(cat => ({
            id: cat.id,
            name: cat.name || '',
            status: cat.category_status !== false
        }));
    }

    // Transform tags (handle both nested and flat structures)
    let tags = [];
    if (projectData.tags?.data) {
        // Nested structure
        tags = projectData.tags.data.map(tag => tag.attributes?.name || '');
    } else if (projectData.tags) {
        // Flat structure
        tags = projectData.tags.map(tag => tag.name || '');
    }

    const transformedProject = {
        id: id,
        documentId: projectData.documentId || '',
        title: projectData.title || '',
        subtitle: projectData.subtitle || '',
        description: projectData.description || '',
        view_link: projectData.view_link || '',
        project_status: projectData.project_status !== false,
        image: {
            url: imageUrl,
            alt: projectData.image?.data?.attributes?.alternativeText || 
                  projectData.image?.alternativeText || 
                  projectData.title || '',
            formats: projectData.image?.data?.attributes?.formats || 
                     projectData.image?.formats || {}
        },
        categories: categories,
        tags: tags,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        publishedAt: projectData.publishedAt
    };


    return transformedProject;
}

/**
 * Transform Strapi category data to portfolio format
 * @param {Object} strapiCategory - Raw Strapi category data
 * @returns {Object} - Transformed category data
 */
const transformCategoryData = (strapiCategory) => {
    // Check if strapiCategory has the expected structure
    if (!strapiCategory) {
        console.warn('Invalid category data structure:', strapiCategory)
        return null
    }

    // Handle both flat and nested structures
    const { id, attributes } = strapiCategory
    const categoryData = attributes || strapiCategory
    
    // Only include categories with category_status = true (default to true if not specified)
    if (categoryData.category_status === false) {
        return null
    }

    return {
        id: id,
        documentId: categoryData.documentId || '',
        name: categoryData.name || '',
        category_status: categoryData.category_status !== false,
        createdAt: categoryData.createdAt,
        updatedAt: categoryData.updatedAt,
        publishedAt: categoryData.publishedAt
    }
}

/**
 * Fetch resume from Strapi API
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
const fetchResume = async (options = {}) => {
    try {
        console.log('Fetching resume from:', `${STRAPI_BASE_URL}/my-cv?populate=*`)
        
        const response = await fetch(`${STRAPI_BASE_URL}/my-cv?populate=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || null,
            meta: data.meta || {}
        }
    } catch (error) {
        console.error('Error fetching resume:', error)
        return {
            success: false,
            error: error.message,
            data: null,
            meta: {}
        }
    }
}

/**
 * Submit contact form to Strapi API
 * @param {Object} formData - Contact form data
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
const submitContactForm = async (formData, options = {}) => {
    try {
        
        const response = await fetch(`${STRAPI_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify({
                data: {
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message
                }
            }),
            ...options
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return {
            success: true,
            data: data.data || null,
            meta: data.meta || {}
        }
    } catch (error) {
        console.error('Error submitting contact form:', error)
        return {
            success: false,
            error: error.message,
            data: null,
            meta: {}
        }
    }
}

export default useStrapiApi 