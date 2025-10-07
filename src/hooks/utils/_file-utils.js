/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 */

export const _fileUtils = {
    /**
     * @string
     */
    BASE_URL: import.meta.env.BASE_URL,

    /**
     * @param {String} url
     */
    download: (url) => {
        window.open(_fileUtils.resolvePath(url), "_blank")
    },

    /**
     * @param {String} path
     * @return {Promise<any>}
     */
    loadJSON: async (path) => {
        try {
            const resolvedPath = _fileUtils.resolvePath(path)
            const response = await fetch(resolvedPath)
            const contentType = response.headers.get("content-type") || ""

            if (!response.ok || !contentType.includes("application/json")) {
                return null
            }

            return await response.json()
        }
        catch (error) {
            console.error(`Failed to load JSON from ${path}:`, error)
            return null
        }
    },

    /**
     * @param {String} path
     * @return {String}
     */
    resolvePath: (path) => {
        // If it's already an absolute URL, return as-is
        if (typeof path !== 'string') return path
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
            return path
        }

        // Try to construct a proper URL using BASE_URL when it's a valid base,
        // otherwise fall back to the current origin so paths like '/data/..' work.
        const baseUrl = _fileUtils.BASE_URL || ''
        try {
            // If baseUrl is empty or a simple '/', use location.origin as base
            const effectiveBase = (!baseUrl || baseUrl === '/') ? location.origin : baseUrl
            return new URL(path, effectiveBase).toString()
        }
        catch (e) {
            // Fallback: if path is root-relative, return it so fetch will use the same origin
            if (path.startsWith('/')) return path
            // Otherwise just concatenate as a last resort
            return (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/') + path
        }
    },
}