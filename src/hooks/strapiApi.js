import { useQuery, useMutation } from '@tanstack/react-query'

const STRAPI_BASE_URL = 'https://refined-peace-3dcd962811.strapiapp.com/api'

export const useStrapiApi = () => {
    return {
        fetchProjects,
        fetchCategories,
        transformProjectData,
        transformCategoryData,
        fetchResume,
        submitContactForm,
        // React Query Hooks
        useProjects: useProjectsQuery,
        useCategories: useCategoriesQuery,
        useResume: useResumeQuery,
        useSubmitContact: useContactMutation
    }
}

export { useProjectsQuery, useCategoriesQuery, useResumeQuery, useContactMutation }



/**
 * Fetch projects from Strapi API
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
const fetchProjects = async (options = {}) => {
    try {
        const queryParams = new URLSearchParams({
            'fields[0]': 'title',
            'fields[1]': 'subtitle',
            'fields[2]': 'description',
            'fields[3]': 'view_link',
            'fields[4]': 'project_status',
            'fields[5]': 'createdAt',
            'fields[6]': 'documentId',
            'populate[image][fields][0]': 'url',
            'populate[image][fields][1]': 'formats',
            'populate[image][fields][2]': 'alternativeText',
            'populate[categories][fields][0]': 'name',
            'populate[categories][fields][1]': 'category_status',
            'populate[tags][fields][0]': 'name',
            'sort': 'createdAt:desc'
        })
        
        const response = await fetch(`${STRAPI_BASE_URL}/project?${queryParams.toString()}`, {
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

/**
 * React Query hook for projects
 */
const useProjectsQuery = (options = {}) => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: () => fetchProjects(options),
        select: (response) => {
            if (response.success) {
                return response.data
                    .map(transformProjectData)
                    .filter(project => project !== null)
            }
            return []
        }
    })
}

/**
 * React Query hook for categories
 */
const useCategoriesQuery = (options = {}) => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => fetchCategories(options),
        select: (response) => {
            if (response.success) {
                return response.data
                    .map(transformCategoryData)
                    .filter(cat => cat !== null)
            }
            return []
        }
    })
}

/**
 * React Query hook for resume
 */
const useResumeQuery = (options = {}) => {
    return useQuery({
        queryKey: ['resume'],
        queryFn: () => fetchResume(options),
        select: (response) => {
            if (response.success) {
                return response.data
            }
            return null
        }
    })
}

/**
 * React Query mutation for contact form
 */
const useContactMutation = () => {
    return useMutation({
        mutationFn: (formData) => submitContactForm(formData)
    })
}

export default useStrapiApi 