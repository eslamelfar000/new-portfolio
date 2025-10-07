import React, { useEffect } from 'react'
import { useLanguage } from '/src/providers/LanguageProvider.jsx'

function RTLWrapper({ children }) {
    const language = useLanguage()
    
    useEffect(() => {
        const isRTL = language.isRTL()
        const direction = language.getDirection()
        
        // Apply RTL classes to body
        if (isRTL) {
            document.body.classList.add('rtl')
            document.documentElement.setAttribute('dir', 'rtl')
            document.documentElement.setAttribute('lang', language.selectedLanguageId)
        } else {
            document.body.classList.remove('rtl')
            document.documentElement.setAttribute('dir', 'ltr')
            document.documentElement.setAttribute('lang', language.selectedLanguageId)
        }
        
        // Cleanup function
        return () => {
            document.body.classList.remove('rtl')
            document.documentElement.removeAttribute('dir')
            document.documentElement.removeAttribute('lang')
        }
    }, [language.selectedLanguageId])
    
    return <>{children}</>
}

export default RTLWrapper 