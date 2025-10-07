import "./ArticlePortfolio.scss";
import React, { useEffect, useState } from "react";
import Article from "/src/components/articles/base/Article.jsx";
import Transitionable from "/src/components/capabilities/Transitionable.jsx";
import { useViewport } from "/src/providers/ViewportProvider.jsx";
import { useConstants } from "/src/hooks/constants.js";
import AvatarView from "/src/components/generic/AvatarView.jsx";
import { Tag, Tags } from "/src/components/generic/Tags.jsx";
import ArticleItemPreviewMenu from "/src/components/articles/partials/ArticleItemPreviewMenu.jsx";
import { useLanguage } from "/src/providers/LanguageProvider.jsx";
import { useStrapiApi } from "/src/hooks/strapiApi.js";

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapi({ dataWrapper, id }) {
  const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null);
  const [strapiData, setStrapiData] = useState({
    projects: [],
    categories: [],
    loading: true,
    error: null,
  });

  const {
    fetchProjects,
    fetchCategories,
    transformProjectData,
    transformCategoryData,
  } = useStrapiApi();

  useEffect(() => {
    const loadStrapiData = async () => {
      try {
        setStrapiData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch both projects and categories
        const [projectsResponse, categoriesResponse] = await Promise.all([
          fetchProjects(),
          fetchCategories(),
        ]);

        if (!projectsResponse.success) {
          throw new Error(
            `Failed to fetch projects: ${projectsResponse.error}`
          );
        }

        if (!categoriesResponse.success) {
          throw new Error(
            `Failed to fetch categories: ${categoriesResponse.error}`
          );
        }

        // Transform the data
        const transformedProjects = projectsResponse.data
          .map(transformProjectData)
          .filter((project) => project !== null); // Filter out projects with status false

        const transformedCategories = categoriesResponse.data
          .map(transformCategoryData)
          .filter((category) => category !== null); // Filter out categories with status false

        setStrapiData({
          projects: transformedProjects,
          categories: transformedCategories,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading Strapi data:", error);
        setStrapiData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    loadStrapiData();
  }, []);

  // Create a modified dataWrapper with dynamic categories
  const dynamicDataWrapper = {
    ...dataWrapper,
    categories:
      strapiData.loading || !strapiData.categories.length
        ? []
        : [
            // Add "All" category
            {
              id: "all",
              label: "All",
              name: "All",
            },
            // Add dynamic categories from API with project counts
            ...strapiData.categories.map((cat) => {
              const projectCount = strapiData.projects.filter((project) =>
                project.categories.some(
                  (projectCat) => projectCat.name === cat.name
                )
              ).length;

              return {
                id: cat.name, // Use category name as ID for filtering
                label: `${cat.name} (${projectCount})`,
                name: cat.name,
              };
            }),
          ],
  };

  return (
    <Article
      id={dataWrapper.uniqueId}
      type={Article.Types.SPACING_DEFAULT}
      dataWrapper={dynamicDataWrapper}
      className={`article-portfolio-strapi`}
      selectedItemCategoryId={selectedItemCategoryId}
      setSelectedItemCategoryId={setSelectedItemCategoryId}
    >
      <ArticlePortfolioStrapiItems
        dataWrapper={dataWrapper}
        selectedItemCategoryId={selectedItemCategoryId}
        strapiData={strapiData}
      />
    </Article>
  );
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {Object} strapiData
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapiItems({
  dataWrapper,
  selectedItemCategoryId,
  strapiData,
}) {
  const constants = useConstants();
  const language = useLanguage();
  const viewport = useViewport();

  const { projects, categories, loading, error } = strapiData;

  const customBreakpoint = viewport.getCustomBreakpoint(
    constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES
  );
  const itemsPerRow = customBreakpoint?.slidesPerView || 1;
  const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`;

  // Filter projects based on selected category
  const filteredProjects =
    selectedItemCategoryId && selectedItemCategoryId !== "all"
      ? projects.filter((project) =>
          project.categories.some((cat) => cat.name === selectedItemCategoryId)
        )
      : projects;

  const refreshFlag = categories?.length
    ? selectedItemCategoryId + "-" + language.getSelectedLanguage()?.id
    : language.getSelectedLanguage()?.id;

  if (loading) {
    return (
      <div
        className="article-portfolio-loading d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-portfolio-error">
        <div className="alert alert-danger" role="alert">
          Error loading portfolio data: {error}
        </div>
      </div>
    );
  }

  if (categories?.length) {
    return (
      <Transitionable
        id={dataWrapper.uniqueId}
        refreshFlag={refreshFlag}
        delayBetweenItems={100}
        animation={Transitionable.Animations.POP}
        className={`article-portfolio-items ${itemsPerRowClass}`}
      >
        {filteredProjects.map((project, key) => (
          <ArticlePortfolioStrapiItem project={project} key={key} />
        ))}
      </Transitionable>
    );
  } else {
    return (
      <div
        className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}
      >
        {filteredProjects.map((project, key) => (
          <ArticlePortfolioStrapiItem project={project} key={key} />
        ))}
      </div>
    );
  }
}

/**
 * @param {Object} project
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapiItem({ project }) {
  // Generate a FontAwesome icon based on title and category
  const getFaIcon = (title, categories) => {
    const titleLower = title.toLowerCase();
    const categoryNames =
      categories?.map((cat) => cat.name.toLowerCase()) || [];

    // Check title first, then categories
    if (
      titleLower.includes("lms") ||
      categoryNames.some((cat) => cat.includes("lms"))
    )
      return "fa-solid fa-graduation-cap";
    if (
      titleLower.includes("ecommerce") ||
      titleLower.includes("shop") ||
      categoryNames.some((cat) => cat.includes("ecommerce"))
    )
      return "fa-solid fa-shopping-cart";
    if (
      titleLower.includes("wordpress") ||
      categoryNames.some((cat) => cat.includes("wordpress"))
    )
      return "fa-brands fa-wordpress";
    if (
      titleLower.includes("web") ||
      titleLower.includes("app") ||
      categoryNames.some((cat) => cat.includes("web"))
    )
      return "fa-solid fa-globe";
    if (titleLower.includes("mobile") || titleLower.includes("app"))
      return "fa-solid fa-mobile-alt";
    if (titleLower.includes("api") || titleLower.includes("backend"))
      return "fa-solid fa-server";
    if (titleLower.includes("ui") || titleLower.includes("design"))
      return "fa-solid fa-palette";

    return "fa-solid fa-code";
  };

  // Generate icon colors based on title and category
  const getIconColors = (title, categories) => {
    const titleLower = title.toLowerCase();
    const categoryNames =
      categories?.map((cat) => cat.name.toLowerCase()) || [];

    // Check title first, then categories
    if (
      titleLower.includes("lms") ||
      categoryNames.some((cat) => cat.includes("lms"))
    )
      return { bg: "#007bff", fill: "#fff" };
    if (
      titleLower.includes("ecommerce") ||
      titleLower.includes("shop") ||
      categoryNames.some((cat) => cat.includes("ecommerce"))
    )
      return { bg: "#dc3545", fill: "#fff" };
    if (
      titleLower.includes("wordpress") ||
      categoryNames.some((cat) => cat.includes("wordpress"))
    )
      return { bg: "#21759b", fill: "#fff" };
    if (
      titleLower.includes("web") ||
      titleLower.includes("app") ||
      categoryNames.some((cat) => cat.includes("web"))
    )
      return { bg: "#28a745", fill: "#fff" };
    if (titleLower.includes("mobile") || titleLower.includes("app"))
      return { bg: "#6f42c1", fill: "#fff" };
    if (titleLower.includes("api") || titleLower.includes("backend"))
      return { bg: "#fd7e14", fill: "#fff" };
    if (titleLower.includes("ui") || titleLower.includes("design"))
      return { bg: "#e83e8c", fill: "#fff" };

    return { bg: "#6c757d", fill: "#fff" };
  };

  const faIcon = getFaIcon(project.title, project.categories);
  const iconColors = getIconColors(project.title, project.categories);

  console.log("Project image URL:", project.image?.url);
  console.log("Project image alt:", project.image?.alt);
  console.log("Project title:", project.title);
  console.log("Project categories:", project.categories);

  return (
    <div className={`article-portfolio-item`}>
      <AvatarView
        src={""}
        faIcon={faIcon}
        style={{
          backgroundColor: iconColors.bg,
          color: iconColors.fill,
        }}
        alt={project.title}
        className={`article-portfolio-item-avatar`}
      />

      <ArticlePortfolioStrapiItemTitle project={project} />
      <ArticlePortfolioStrapiItemBody project={project} />
      <ArticlePortfolioStrapiItemFooter project={project} />
    </div>
  );
}

/**
 * @param {Object} project
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapiItemTitle({ project }) {
  return (
    <div className={`article-portfolio-item-title`}>
      <h5 className={`article-portfolio-item-title-main`}>{project.title}</h5>

      <div className={`article-portfolio-item-title-category text-2`}>
        {project.subtitle ||
          (project.categories && project.categories.length > 0
            ? project.categories.map((cat) => cat.name).join(", ")
            : "")}
      </div>
    </div>
  );
}

/**
 * @param {Object} project
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapiItemBody({ project }) {
  return (
    <div className={`article-portfolio-item-body`}>
      <Tags className={`article-portfolio-item-body-tags`}>
        {project.tags &&
          project.tags.length > 0 &&
          project.tags.map((tag, key) => (
            <Tag
              key={key}
              text={tag}
              variant={Tag.Variants.DARK}
              className={`article-portfolio-item-body-tag text-1`}
            />
          ))}
      </Tags>

      <div
        className={`article-portfolio-item-body-description text-2`}
        dangerouslySetInnerHTML={{ __html: project.description }}
      />
    </div>
  );
}

/**
 * @param {Object} project
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioStrapiItemFooter({ project }) {
  const hasViewLink = project.view_link;

  if (!hasViewLink) {
    return <></>;
  }

  return (
    <div className={`article-portfolio-item-footer`}>
      <div className="article-portfolio-item-footer-menu">
        <a
          href={project.view_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          <i className="fa-solid fa-link me-2"></i>
          View Project
        </a>
      </div>
    </div>
  );
}

export default ArticlePortfolioStrapi;
