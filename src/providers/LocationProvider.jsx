/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 * @description This provider acts as a router for the application, managing the active section and category based on the URL hash.
 */

import React, {createContext, useContext, useEffect, useState} from 'react'

function LocationProvider({ children, sections, categories }) {
    const [didMount, setDidMount] = useState(false)
    const [activeSectionId, setActiveSectionId] = useState(null)
    const [nextSectionId, setNextSectionId] = useState(null)
    const [visitHistoryByCategory, setVisitHistoryByCategory] = useState({})
    const [visitedSectionsCount, setVisitedSectionsCount] = useState(0)

    /** @constructs **/
    useEffect(() => {
        setDidMount(true)
        window.addEventListener('popstate', _onLocationEvent)
        window.addEventListener('hashchange', _onLocationEvent)
        _onLocationEvent()

        return () => {
            window.removeEventListener('popstate', _onLocationEvent)
            window.removeEventListener('hashchange', _onLocationEvent)
            setDidMount(false)
        }
    }, [])

    /** @listens nextSectionId **/
    useEffect(() => {
        if(!nextSectionId)
            return

        _toNextSection()
    }, [nextSectionId])

    const getActiveSection = () => {
        return sections.find(section => section.id === activeSectionId)
    }

    const getActiveCategory = () => {
        const activeSection = getActiveSection()
        if(!activeSection)
            return null
        return activeSection.category
    }

    const isSectionActive = (section) => {
        return activeSectionId === section.id
    }

    const isCategoryActive = (category) => {
        const activeSection = getActiveSection()
        if(!activeSection)
            return false
        return activeSection.category.id === category.id
    }

    const goToSection = (section) => {
        if(!section || activeSectionId === section.id)
            return

        const url = new URL(window.location.href)
        url.searchParams.set("route", section.id)
        url.hash = ""
        window.history.pushState({}, "", url.toString())

        setNextSectionId(section.id)
    }

    const goToSectionWithId = (sectionId) => {
        const section = sections.find(section => section.id === sectionId)
        if(section) {
            goToSection(section)
        }
    }

    const goToCategory = (category) => {
        if(!category)
            return

        const targetSectionId = visitHistoryByCategory[category.id]
        const targetSection = sections.find(section => section.id === targetSectionId)

        goToSection(targetSection || category.sections[0])
    }

    const goToCategoryWithId = (categoryId) => {
        const category = categories.find(category => category.id === categoryId)
        if(category) {
            goToCategory(category)
        }
    }

    const _onLocationEvent = () => {
        const searchParams = new URLSearchParams(window.location.search)
        const routeId = searchParams.get("route")
        const categoryId = searchParams.get("category")
        const hashId = window.location.hash.replace("#", "")

        let targetSection = sections.find(section => section.id === routeId) ||
                           sections.find(section => section.id === hashId)

        if(!targetSection && categoryId) {
            const category = categories.find(c => c.id === categoryId)
            if(category) {
                const historySectionId = visitHistoryByCategory[category.id]
                const historySection = sections.find(s => s.id === historySectionId)
                targetSection = historySection || category.sections[0]
            }
        }

        if(targetSection) {
            setNextSectionId(targetSection.id)
        }
        else {
            _onInvalidSection()
        }
    }

    const _onInvalidSection = () => {
        const fallbackSection = sections[0]
        if(fallbackSection) {
            goToSection(fallbackSection)
        }
    }

    const _toNextSection = () => {
        setActiveSectionId(nextSectionId)

        const section = sections.find(section => section.id === nextSectionId)
        const category = section?.category
        setVisitedSectionsCount(prevState => prevState + 1)

        if(section && category) {
            setVisitHistoryByCategory(prevState => ({
                ...prevState,
                [category.id]: section.id
            }))
        }
    }

    return (
        <LocationContext.Provider value={{
            getActiveSection,
            getActiveCategory,
            isSectionActive,
            isCategoryActive,
            goToSection,
            goToSectionWithId,
            goToCategory,
            goToCategoryWithId,
            visitedSectionsCount,
            visitHistoryByCategory
        }}>
            {didMount && children}
        </LocationContext.Provider>
    )
}

const LocationContext = createContext(null)
/**
 * @return {{
 *    getActiveSection: Function,
 *    getActiveCategory: Function,
 *    isSectionActive: Function,
 *    isCategoryActive: Function,
 *    goToSection: Function,
 *    goToSectionWithId: Function,
 *    goToCategory: Function,
 *    goToCategoryWithId: Function,
 *    visitedSectionsCount: Number,
 *    visitHistoryByCategory: Object
 * }}
 */
export const useLocation = () => useContext(LocationContext)

export default LocationProvider