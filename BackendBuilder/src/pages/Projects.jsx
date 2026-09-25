import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  FolderKanban,
  Code2,
  Database,
  Trash2,
  ArrowUpRight,
  Clock3,
  FileEdit,
  AlertCircle,
} from "lucide-react";
import client from '../api/client';
import { Appcontext } from '../context/Backend';
import { useAuth } from '../context/AuthContext';

import "../style/Projects.css";

const normalizeLoadedTable = (table = {}) => {
  const rawColumns = table.colamnsname || table.columnNames || table.columns || table.Columns || []
  const columnObjects = Array.isArray(rawColumns) && rawColumns.every((column) => column && typeof column === 'object')
    ? rawColumns
    : []
  const columnNames = columnObjects.length > 0
    ? columnObjects.map((column) => column.name || column.columnName || column.ColumnName || '')
    : Array.isArray(rawColumns) ? rawColumns : []

  return {
    ...table,
    TableNames: table.TableNames || table.tableName || table.name || '',
    colamnsname: columnNames,
    Datatype: table.Datatype || table.datatype || table.dataTypes || columnObjects.map((column) => column.type || column.datatype || ''),
    Length: table.Length || table.lengths || columnObjects.map((column) => column.length || ''),
    Constraints: table.Constraints || table.constraints || columnObjects.map((column) => column.constraints || ''),
  }
}

const normalizeLoadedConnection = (connection = {}) => ({
  ...connection,
  ParentTable: connection.ParentTable || connection.parentTable || connection.parent || '',
  ChildTable: connection.ChildTable || connection.childTable || connection.child || '',
  ParentRelation: connection.ParentRelation || connection.parentRelation || connection.parentRelationType || '',
  childRelation: connection.childRelation || connection.ChildRelation || connection.childRelationType || '',
})

const normalizeProjectName = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

const DEFAULT_DATABASE_TYPE = 'PostgreSQL';

const dedupeProjects = (projectList = []) => {
  const uniqueProjects = [];
  const seenNames = new Set();

  projectList.forEach((project) => {
    const projectName = normalizeProjectName(project?.name || project?.DBname || project?.dbName || project?.databaseName);

    if (!projectName) {
      uniqueProjects.push(project);
      return;
    }

    const normalizedKey = projectName.toLowerCase();

    if (seenNames.has(normalizedKey)) {
      return;
    }

    seenNames.add(normalizedKey);
    uniqueProjects.push(project);
  });

  return uniqueProjects;
};

const Projects = () => {
  const navigate = useNavigate();
  const goNewProject = () => navigate("/app/new-project");
  const {
    setDatabases,
    setActiveDatabase,
    setApiConfig,
    setAuthMethod,
    setNumberofTables,
    setTableNames,
    setTables,
    setConnections,
    setApiName,
    setPendingConnection,
    setSteps,
    Databases,
    backendApi,
    userId,
    currentUser,
  } = useContext(Appcontext);
  const { user: authenticatedUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH PROJECTS
  ===================================================== */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await client.get('/api/projects');
      // Guard against an unexpected response shape (an object or HTML page would
      // make projects.filter() crash and blank the whole screen)
      const nextProjects = dedupeProjects(Array.isArray(data) ? data : []);
      setProjects(nextProjects);
      return nextProjects;
    } catch (err) {
      console.error(err);
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* =====================================================
     DELETE PROJECT
  ===================================================== */

  // The API has no separate project id — each project IS a saved database,
  // identified by its name (see ProjectController.toProject / DELETE
  // /api/projects/{name}). Deleting by an "id" that doesn't exist used to
  // silently do nothing.
  const deleteProject = async (project) => {
    const projectName = project?.name || project?.DBname || project?.dbName || project?.databaseName || '';

    if (!projectName) {
      setError('This project does not have a valid name to delete.');
      alert('This project does not have a valid name to delete.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the project "${projectName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const authenticatedUserId = userId || currentUser?.id || currentUser?.userId || authenticatedUser?.id || authenticatedUser?.userId;

      if (!authenticatedUserId) {
        throw new Error('Your user session is unavailable. Please sign in again.');
      }

      const candidateNames = [...new Set([
        projectName,
        project?.DBname,
        project?.dbName,
        project?.databaseName,
      ].filter(Boolean).map((name) => normalizeProjectName(name)))];

      let deleteSucceeded = false;
      let lastDeleteError = null;

      const userDatabasesResponse = await client.get(`/User/${encodeURIComponent(authenticatedUserId)}/database`);
      const userDatabases = userDatabasesResponse?.data;
      const databaseEntries = Array.isArray(userDatabases)
        ? userDatabases
        : Array.isArray(userDatabases?.data)
          ? userDatabases.data
          : Array.isArray(userDatabases?.databases)
            ? userDatabases.databases
            : [];

      const matchingDatabaseNames = [...new Set(databaseEntries
        .map((database) => normalizeProjectName(database?.DBname || database?.dbName || database?.name))
        .filter((name) => candidateNames.some((candidateName) => candidateName && name && candidateName.toLowerCase() === name.toLowerCase()))
      )];

      if (matchingDatabaseNames.length === 0) {
        throw new Error(`The database "${projectName}" does not exist for this user, so it cannot be deleted.`);
      }

      const deletionsToTry = matchingDatabaseNames;

      for (const candidateName of deletionsToTry) {
        try {
          if (backendApi?.deleteDatabaseByName) {
            await backendApi.deleteDatabaseByName(authenticatedUserId, candidateName);
          } else {
            await client.delete(`/User/${encodeURIComponent(authenticatedUserId)}/database/${encodeURIComponent(candidateName)}`);
          }

          deleteSucceeded = true;
        } catch (error) {
          lastDeleteError = error;
        }
      }

      if (!deleteSucceeded) {
        throw lastDeleteError || new Error('Unable to delete project.');
      }

      const namesToRemove = deletionsToTry.map((name) => normalizeProjectName(name).toLowerCase());

      setProjects((previousProjects) =>
        previousProjects.filter((projectItem) => {
          const existingName = normalizeProjectName(projectItem?.name || projectItem?.DBname || projectItem?.dbName || projectItem?.databaseName).toLowerCase();
          return !existingName || !namesToRemove.includes(existingName);
        })
      );

      setDatabases((previousDatabases) =>
        previousDatabases.filter((database) => {
          const databaseName = normalizeProjectName(database?.DBname || database?.dbName || database?.name).toLowerCase();
          return !databaseName || !namesToRemove.includes(databaseName);
        })
      );

      const refreshedProjects = await fetchProjects();
      const projectStillExists = Array.isArray(refreshedProjects) && refreshedProjects.some((existingProject) => {
        const existingName = normalizeProjectName(existingProject?.name || existingProject?.DBname || existingProject?.dbName || existingProject?.databaseName).toLowerCase();
        return namesToRemove.includes(existingName);
      });

      if (projectStillExists) {
        setProjects((previousProjects) => dedupeProjects(previousProjects));
        throw new Error('The backend is still returning duplicate project entries with this name. The project list has been deduplicated, but the backend data still needs cleanup.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to delete project.');
      alert(err?.message || 'Unable to delete project.');
    }
  };

  const openProject = async (project) => {
    let projectDetails = project
    const authenticatedUserId = userId || currentUser?.id || currentUser?.userId || authenticatedUser?.id || authenticatedUser?.userId

    try {
      if (!authenticatedUserId) {
        throw new Error('Authenticated database lookup is unavailable')
      }

      let databaseData

      if (backendApi?.findDatabaseByName) {
        try {
          const database = await backendApi.findDatabaseByName(authenticatedUserId, project.name)
          databaseData = database?.project || database?.database || database?.data || database
        } catch (error) {
          const response = await client.get(`/User/${encodeURIComponent(authenticatedUserId)}/database`)
          const payload = response?.data
          const databases = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.databases)
                ? payload.databases
                : []

          databaseData = databases.find((database) => (
            (database.DBname || database.dbName || database.name) === (project.name || project.DBname || project.dbName)
          ))
        }
      }

      if (!databaseData) {
        const response = await client.get(`/User/${encodeURIComponent(authenticatedUserId)}/database`)
        const payload = response?.data
        const databases = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.databases)
              ? payload.databases
              : []

        databaseData = databases.find((database) => (
          (database.DBname || database.dbName || database.name) === (project.name || project.DBname || project.dbName)
        ))
      }

      if (!databaseData) {
        databaseData = (Array.isArray(Databases) ? Databases : []).find((database) => (
          normalizeProjectName(database?.DBname || database?.dbName || database?.name).toLowerCase() ===
          normalizeProjectName(project?.name || project?.DBname || project?.dbName).toLowerCase()
        ))
      }

      if (databaseData && typeof databaseData === 'object') {
        projectDetails = { ...project, ...databaseData }
      }
    } catch (databaseError) {
      try {
        const response = await client.get(`/api/projects/${encodeURIComponent(project.name)}`)
        const responseData = response?.data
        const projectData = responseData?.project || responseData?.database || responseData?.data || responseData

        if (projectData && typeof projectData === 'object') {
          projectDetails = { ...project, ...projectData }
        }
      } catch (projectError) {
        console.warn('Unable to load full project details:', projectError)
      }
    }

    const localDatabase = (Array.isArray(Databases) ? Databases : []).find((database) => (
        normalizeProjectName(database?.DBname || database?.dbName || database?.name).toLowerCase() ===
        normalizeProjectName(project?.name || project?.DBname || project?.dbName).toLowerCase()
    ))

    const remoteTables = projectDetails?.Tables || projectDetails?.tables || projectDetails?.tableList || projectDetails?.databaseTables
    if (localDatabase && (!Array.isArray(remoteTables) || remoteTables.length === 0)) {
      projectDetails = { ...projectDetails, ...localDatabase }
    }

    const nestedDatabase = projectDetails.database || projectDetails.Database || projectDetails
    const databaseTables = nestedDatabase.Tables || nestedDatabase.tables || nestedDatabase.tableList || nestedDatabase.databaseTables || []
    const databaseConnections = nestedDatabase.DBconnection || nestedDatabase.DBConnection || nestedDatabase.dbConnection || nestedDatabase.connections || nestedDatabase.relationships || []

    const normalizedTables = Array.isArray(databaseTables)
      ? databaseTables.map(normalizeLoadedTable)
      : [];

    const normalizedConnections = Array.isArray(databaseConnections)
      ? databaseConnections.map(normalizeLoadedConnection)
      : [];

    if (projectDetails.apiConfig && typeof setApiConfig === 'function') {
      setApiConfig(projectDetails.apiConfig)
    }

    if (projectDetails.authMethod && typeof setAuthMethod === 'function') {
      setAuthMethod(projectDetails.authMethod)
    }

    if (projectDetails.apiName) {
      setApiName(projectDetails.apiName)
    }

    if (projectDetails.pendingConnection) {
      setPendingConnection(projectDetails.pendingConnection)
    }

    setSteps(1);

    const selectedDatabase = {
      ...projectDetails,
      _originalName: nestedDatabase.DBname || nestedDatabase.dbName || nestedDatabase.databaseName || projectDetails.name,
      DBname: nestedDatabase.DBname || nestedDatabase.dbName || nestedDatabase.databaseName || projectDetails.name,
      Username: nestedDatabase.Username || nestedDatabase.username || nestedDatabase.DBusername || nestedDatabase.dbUsername || '',
      Password: nestedDatabase.Password || nestedDatabase.password || nestedDatabase.DBpassword || nestedDatabase.dbPassword || '',
      DBurl: nestedDatabase.DBurl || nestedDatabase.dbUrl || nestedDatabase.dburl || nestedDatabase.connectionUrl || nestedDatabase.url || '',
      type: nestedDatabase.type || nestedDatabase.databaseType || nestedDatabase.dbType || nestedDatabase.dbtype || projectDetails.type || projectDetails.databaseType || projectDetails.dbType || DEFAULT_DATABASE_TYPE,
      Tables: normalizedTables,
      DBconnection: normalizedConnections,
    }

    setTables(normalizedTables)
    setConnections(normalizedConnections)
    setNumberofTables(normalizedTables.length)
    setTableNames(normalizedTables.map((table) => table.TableNames || table.tableName || table.name || ''))

    setDatabases((previousDatabases) => {
      const selectedName = selectedDatabase.DBname
      const remainingDatabases = (Array.isArray(previousDatabases) ? previousDatabases : []).filter((database) => (
        (database.DBname || database.dbName || database.name) !== selectedName
      ))

      return [...remainingDatabases, selectedDatabase]
    })
    setActiveDatabase(selectedDatabase)
    navigate('/app/new-project/database');
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredProjects = dedupeProjects(projects).filter((project) => {

    const searchValue = search.toLowerCase();

    return (
      project.name
        ?.toLowerCase()
        .includes(searchValue) ||

      project.type
        ?.toLowerCase()
        .includes(searchValue) ||

      project.status
        ?.toLowerCase()
        .includes(searchValue)
    );
  });


  /* =====================================================
     STATUS COUNTS
  ===================================================== */

  const totalProjects = projects.length;

  // The API only ever reports "Draft" or "In Progress" (see
  // ProjectController.toProject) — there's no "Completed" status, so that
  // count always showed 0 before. Left the card in below but tied to a
  // status the server can actually send.
  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const draftProjects = projects.filter(
    (project) => project.status !== "In Progress"
  ).length;


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="projects-page">

        <div className="projects-loading">

          <RefreshCw
            size={28}
            className="projects-loading-icon"
          />

          <p>Loading projects...</p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="projects-page">

        <div className="projects-error">

          <AlertCircle size={27} />

          <div>
            <h3>Projects Error</h3>
            <p>{error}</p>
          </div>

          <button onClick={fetchProjects}>
            <RefreshCw size={15} />
            Retry
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="projects-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="projects-header">

        <div>

          <p className="projects-label">
            BACKENDBUILDER
          </p>

          <h1>Projects</h1>

          <p className="projects-subtitle">
            Manage all your backend projects from one place.
          </p>

        </div>


        <div className="projects-header-actions">

          <button
            className="projects-refresh-btn"
            onClick={fetchProjects}
            title="Refresh projects"
          >
            <RefreshCw size={17} />
          </button>


          <button className="projects-new-btn" type="button" onClick={goNewProject}>

            <Plus size={18} />

            New Project

          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="projects-summary-grid">

        <SummaryCard
          icon={<FolderKanban size={20} />}
          title="Total Projects"
          value={totalProjects}
          type="purple"
        />

        <SummaryCard
          icon={<Clock3 size={20} />}
          title="In Progress"
          value={inProgressProjects}
          type="orange"
        />

        <SummaryCard
          icon={<FileEdit size={20} />}
          title="Draft"
          value={draftProjects}
          type="gray"
        />

      </div>


      {/* =================================================
          PROJECT LIST CARD
      ================================================= */}

      <section className="projects-card">

        {/* CARD HEADER */}

        <div className="projects-card-header">

          <div>

            <h2>All Projects</h2>

            <p>
              {totalProjects} project
              {totalProjects !== 1 ? "s" : ""}
            </p>

          </div>


          <div className="projects-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {/* =================================================
            PROJECT TABLE
        ================================================= */}

        <div className="projects-table-wrapper">

          <table className="projects-table">

            <thead>

              <tr>

                <th>PROJECT</th>

                <th>DATABASE</th>

                <th>TABLES</th>

                <th>STATUS</th>

                <th>ACTION</th>

              </tr>

            </thead>


            <tbody>

              {filteredProjects.length > 0 ? (

                filteredProjects.map((project, projectIndex) => (

                  <tr key={`${project.name}-${project.type || 'database'}-${project.tableCount ?? 0}-${projectIndex}`}>

                    {/* PROJECT */}

                    <td>

                      <div className="project-name-cell">

                        <div className="project-main-icon">
                          <Code2 size={18} />
                        </div>

                        <div>

                          <strong>
                            {project.name}
                          </strong>

                          <span>
                            {project.connectionCount ?? 0} relationship{project.connectionCount === 1 ? "" : "s"}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* DATABASE */}

                    <td>

                      <div className="project-database">

                        <Database size={15} />

                        <span>
                          {project.type ||
                            "Unknown"}
                        </span>

                      </div>

                    </td>


                    {/* TABLES */}

                    <td>

                      <span className="project-created">
                        {project.tableCount ?? 0}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <ProjectStatus
                        status={project.status}
                      />

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="project-actions">

                        <button
                          className="project-open-btn"
                          title="Open project"
                          onClick={() => openProject(project)}
                        >
                          <ArrowUpRight size={16} />
                        </button>


                        <button
                          className="project-delete-btn"
                          title="Delete project"
                          onClick={() =>
                            deleteProject(project)
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="projects-empty-cell"
                  >

                    <div className="projects-empty">

                      <FolderKanban size={45} />

                      <h3>
                        {search
                          ? "No projects found"
                          : "No projects yet"}
                      </h3>

                      <p>

                        {search
                          ? "Try another search term."
                          : "Create your first project to get started."}

                      </p>


                      {!search && (

                        <button className="empty-create-btn" type="button" onClick={goNewProject}>

                          <Plus size={16} />

                          Create Project

                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          FOOTER INFO
      ================================================= */}

      <div className="projects-footer">

        <span>
          Showing {filteredProjects.length} of{" "}
          {totalProjects} projects
        </span>

        <span>
          BackendBuilder
        </span>

      </div>

    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon,
  title,
  value,
  type,
}) => {

  return (

    <div className="projects-summary-card">

      <div className={`summary-icon ${type}`}>
        {icon}
      </div>

      <div className="summary-content">

        <span>{title}</span>

        <strong>{value}</strong>

      </div>

    </div>

  );
};


/* =========================================================
   PROJECT STATUS
========================================================= */

const ProjectStatus = ({ status }) => {

  const statusClass =
    status?.toLowerCase().replace(/\s+/g, "-") ||
    "draft";

  return (

    <span
      className={`project-status-badge ${statusClass}`}
    >

      <i></i>

      {status || "Draft"}

    </span>

  );
};

export default Projects;