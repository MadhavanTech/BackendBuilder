import React, { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Layers3,
  Database,
  Code2,
  ArrowUpRight,
  Sparkles,
  Server,
  Globe,
  ShoppingCart,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import api from '../api/axios';

import "../style/Templates.css";


const Templates = () => {

  // ================================
  // State
  // ================================

  const [templates, setTemplates] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ================================
  // Fetch Templates
  // ================================

  const fetchTemplates = async () => {

    try {

      setLoading(true);

      setError("");

      const { data } = await api.get('/api/templates');

      if (Array.isArray(data)) {
        setTemplates(data);
      } else {
        setTemplates([]);
      }

    } catch (err) {

      console.warn("Template fetch error:", err);
      setTemplates([]);
      setError("");

    } finally {

      setLoading(false);

    }
  };


  // ================================
  // Initial Load
  // ================================

  useEffect(() => {

    fetchTemplates();

  }, []);


  // ================================
  // Categories
  // ================================

  const categories = [
    "All",
    ...new Set(
      templates
        .map((template) => template.category)
        .filter(Boolean)
    )
  ];


  // ================================
  // Filter Templates
  // ================================

  const filteredTemplates = templates.filter((template) => {

    const searchText = search.toLowerCase();

    const matchesSearch =
      template.name
        ?.toLowerCase()
        .includes(searchText) ||

      template.description
        ?.toLowerCase()
        .includes(searchText) ||

      template.category
        ?.toLowerCase()
        .includes(searchText) ||

      template.databaseType
        ?.toLowerCase()
        .includes(searchText);


    const matchesCategory =
      category === "All" ||
      template.category === category;


    return matchesSearch && matchesCategory;

  });


  // ================================
  // Template Icon
  // ================================

  const getTemplateIcon = (template) => {

    const name =
      template.name?.toLowerCase() || "";

    const categoryName =
      template.category?.toLowerCase() || "";


    if (
      name.includes("e-commerce") ||
      name.includes("commerce") ||
      categoryName.includes("commerce")
    ) {
      return <ShoppingCart />;
    }


    if (
      name.includes("blog") ||
      categoryName.includes("content")
    ) {
      return <FileText />;
    }


    if (
      name.includes("chat") ||
      name.includes("messaging")
    ) {
      return <MessageSquare />;
    }


    if (
      name.includes("website") ||
      name.includes("web")
    ) {
      return <Globe />;
    }


    if (
      name.includes("server") ||
      name.includes("api") ||
      categoryName.includes("backend")
    ) {
      return <Server />;
    }


    return <Layers3 />;

  };


  // ================================
  // Use Template
  // ================================

  const handleUseTemplate = (template) => {

    console.log("Selected template:", template);

    /*
      Later you can navigate to your
      project creation page.

      Example:

      navigate("/projects/new", {
        state: {
          template: template
        }
      });

    */

    alert(
      `Template "${template.name}" selected.`
    );

  };


  // ================================
  // View Template
  // ================================

  const handleViewTemplate = (template) => {

    console.log(
      "View template:",
      template
    );

    alert(
      `Viewing "${template.name}"`
    );

  };


  // ================================
  // Loading
  // ================================

  if (loading) {

    return (

      <div className="templates-page">

        <div className="templates-loading">

          <RefreshCw
            className="templates-loading-icon"
          />

          <p>
            Loading templates...
          </p>

        </div>

      </div>

    );

  }


  // ================================
  // Main UI
  // ================================

  return (

    <div className="templates-page">


      {/* ==================================
          Header
      ================================== */}

      <div className="templates-header">


        <div className="templates-header-left">

          <h1>
            Templates
          </h1>

          <p>
            Start your backend project with
            a ready-to-use template.
          </p>

        </div>


        <div className="templates-header-actions">

          <button
            className="templates-refresh-btn"
            onClick={fetchTemplates}
            disabled={loading}
            title="Refresh templates"
          >

            <RefreshCw />

          </button>

        </div>

      </div>



      {/* ==================================
          Error
      ================================== */}

      {error && (

        <div className="templates-error">

          <AlertCircle
            className="templates-error-icon"
          />

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

          <button
            className="templates-retry-btn"
            onClick={fetchTemplates}
          >
            Try Again
          </button>

        </div>

      )}



      {!error && (

        <>


          {/* ==================================
              Search + Categories
          ================================== */}

          <div className="templates-toolbar">


            {/* Search */}

            <div className="templates-search">

              <Search />

              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>



            {/* Categories */}

            <div className="templates-categories">

              {categories.map((item) => (

                <button
                  key={item}
                  className={`template-category-btn ${
                    category === item
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCategory(item)
                  }
                >

                  {item}

                </button>

              ))}

            </div>

          </div>



          {/* ==================================
              Count
          ================================== */}

          <div className="templates-count">

            Showing{" "}

            <strong>
              {filteredTemplates.length}
            </strong>{" "}

            {filteredTemplates.length === 1
              ? "template"
              : "templates"}

          </div>



          {/* ==================================
              Template Grid
          ================================== */}

          <div className="templates-grid">


            {filteredTemplates.length === 0 ? (

              <div className="templates-empty">

                <Layers3
                  className="templates-empty-icon"
                />

                <h3>
                  No templates found
                </h3>

                <p>
                  Try changing your search
                  or category filter.
                </p>

              </div>

            ) : (

              filteredTemplates.map((template) => (

                <div
                  className="template-card"
                  key={template.id}
                >


                  {/* ==========================
                      Card Top
                  ========================== */}

                  <div className="template-card-top">


                    <div className="template-icon">

                      {getTemplateIcon(template)}

                    </div>


                    {template.featured && (

                      <div className="template-featured">

                        <Sparkles />

                        Featured

                      </div>

                    )}

                  </div>



                  {/* ==========================
                      Template Name
                  ========================== */}

                  <h3>
                    {template.name}
                  </h3>



                  {/* ==========================
                      Description
                  ========================== */}

                  <p className="template-card-description">

                    {template.description ||
                      "Ready-to-use backend project template for BackendBuilder."}

                  </p>



                  {/* ==========================
                      Template Information
                  ========================== */}

                  <div className="template-info">


                    {/* Category */}

                    <div className="template-info-row">

                      <div className="template-info-label">

                        <Code2 />

                        Category

                      </div>

                      <div className="template-info-value">

                        {template.category ||
                          "Backend"}

                      </div>

                    </div>



                    {/* Database */}

                    <div className="template-info-row">

                      <div className="template-info-label">

                        <Database />

                        Database

                      </div>

                      <div className="template-info-value">

                        {template.databaseType ||
                          "MySQL"}

                      </div>

                    </div>



                    {/* Framework */}

                    <div className="template-info-row">

                      <div className="template-info-label">

                        <Server />

                        Framework

                      </div>

                      <div className="template-info-value">

                        {template.framework ||
                          "Spring Boot"}

                      </div>

                    </div>


                  </div>



                  {/* ==========================
                      Technology Stack
                  ========================== */}

                  {Array.isArray(
                    template.technologies
                  ) &&
                    template.technologies.length >
                      0 && (

                      <div className="template-tech-stack">

                        {template.technologies.map(
                          (tech, index) => (

                            <span
                              className="template-tech"
                              key={index}
                            >
                              {tech}
                            </span>

                          )
                        )}

                      </div>

                    )}



                  {/* ==========================
                      Actions
                  ========================== */}

                  <div className="template-card-actions">


                    <button
                      className="template-use-btn"
                      onClick={() =>
                        handleUseTemplate(
                          template
                        )
                      }
                    >

                      <CheckCircle2 />

                      Use Template

                    </button>



                    <button
                      className="template-view-btn"
                      onClick={() =>
                        handleViewTemplate(
                          template
                        )
                      }
                      title="View template"
                    >

                      <ArrowUpRight />

                    </button>


                  </div>


                </div>

              ))

            )}

          </div>

        </>

      )}

    </div>

  );

};


export default Templates;
