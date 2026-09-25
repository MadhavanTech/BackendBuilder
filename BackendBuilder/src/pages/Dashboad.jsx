import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Clock3,
  Code2,
  Database,
  FileEdit as FileEditIcon,
  FolderKanban,
  LayoutTemplate,
  Plus,
  RefreshCw,
} from "lucide-react";
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

import "../style/Dashboard.css";

const EMPTY_DASHBOARD = {
  totalProjects: 0,
  totalTables: 0,
  recentProjects: [],
};

const normalizeProject = (project = {}, index = 0) => {
  const tables = [project.tables, project.Tables, project.tableList, project.databaseTables]
    .find(Array.isArray) || [];
  const explicitTableCount = Number(project.tableCount ?? project.tablesCount);
  const tableCount = Number.isFinite(explicitTableCount) && (explicitTableCount > 0 || tables.length === 0)
    ? explicitTableCount
    : tables.length;
  const rawStatus = String(project.status || project.state || '').toLowerCase();

  return {
    ...project,
    name: project.name || project.projectName || project.DBname || project.dbName || `Project ${index + 1}`,
    type: project.type || project.databaseType || project.dbType || 'Unknown DB',
    tableCount,
    status: rawStatus.includes('in progress') || rawStatus.includes('progress')
      ? 'In Progress'
      : 'Draft',
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const goNewProject = () => navigate("/app/new-project");
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await client.get('/api/dashboard');
      const payload = data || {};
      const projectRows = Array.isArray(payload.recentProjects)
        ? payload.recentProjects
        : Array.isArray(payload.projects)
          ? payload.projects
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.databases)
              ? payload.databases
              : [];
      const recentProjects = projectRows.map(normalizeProject);
      let normalizedProjects = recentProjects;

      if (normalizedProjects.length === 0) {
        const userId = user?.id || user?.userId || user?.userID || user?.user_id;

        if (userId) {
          const databaseResponse = await client.get(`/User/${encodeURIComponent(userId)}/database`);
          const databasePayload = databaseResponse.data;
          const databaseRows = Array.isArray(databasePayload)
            ? databasePayload
            : Array.isArray(databasePayload?.data)
              ? databasePayload.data
              : Array.isArray(databasePayload?.databases)
                ? databasePayload.databases
                : [];

          normalizedProjects = databaseRows.map(normalizeProject);
        }
      }

      const calculatedTables = normalizedProjects.reduce((total, project) => total + project.tableCount, 0);
      const totalTables = Number(payload.totalTables);

      setDashboard({
        ...EMPTY_DASHBOARD,
        ...payload,
        totalProjects: Number(payload.totalProjects) || normalizedProjects.length,
        totalTables: Number.isFinite(totalTables) && (totalTables > 0 || calculatedTables === 0) ? totalTables : calculatedTables,
        recentProjects: normalizedProjects.slice(0, 4),
      });
    } catch (requestError) {
      console.error("Dashboard error:", requestError);
      setDashboard(EMPTY_DASHBOARD);
      setError(requestError?.response?.data?.message || "Unable to load the dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    fetchDashboard();
  }, [authLoading, user?.id, user?.userId, user?.userID, user?.user_id]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw className="loading-icon" size={28} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalProjects = Number(dashboard.totalProjects) || 0;
  const recentProjects = Array.isArray(dashboard.recentProjects)
    ? dashboard.recentProjects
    : [];
  const totalTables = Number(dashboard.totalTables) || recentProjects.reduce((total, project) => total + (Number(project.tableCount) || 0), 0);
  // The backend only ever reports two statuses per project ("Draft" or
  // "In Progress" — see ProjectController.toProject). There is no
  // "Completed" concept on the server, so that stat card is derived here
  // from the same recentProjects list rather than fields the API never sends.
  const inProgressProjects = recentProjects.filter((project) => project.status === 'In Progress').length;
  const draftProjects = recentProjects.filter((project) => project.status === 'Draft').length;
  const percentage = (value) =>
    totalProjects > 0 ? Math.round((value / totalProjects) * 100) : 0;
  const tableColorSegment = totalTables > 0 ? 12 : 0;
  const progressColorEnd = tableColorSegment + (percentage(inProgressProjects) * (100 - tableColorSegment)) / 100;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">BACKENDBUILDER</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your projects, templates and backend generation.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="dashboard-refresh-btn"
            onClick={fetchDashboard}
            title="Refresh dashboard"
            type="button"
          >
            <RefreshCw size={17} />
          </button>
          <button className="dashboard-new-project" type="button" onClick={goNewProject}>
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        <StatCard icon={<FolderKanban size={22} />} title="Total Projects" value={totalProjects} description="All your projects" type="purple" />
        <StatCard icon={<Database size={22} />} title="Total Tables" value={totalTables} description="Across all projects" type="green" />
        <StatCard icon={<Clock3 size={22} />} title="In Progress" value={inProgressProjects} description={`${percentage(inProgressProjects)}% of projects`} type="orange" />
        <StatCard icon={<FileEditIcon size={22} />} title="Draft" value={draftProjects} description={`${percentage(draftProjects)}% of projects`} type="blue" />
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-card status-card">
          <CardHeader title="Project Status" description="Overview of your current projects" icon={<FolderKanban size={20} />} />
          <div className="status-content">
            <div className="donut-wrapper">
              <div className="donut-chart" style={{ background: `conic-gradient(#22a06b 0 ${tableColorSegment}%, #f59e0b ${tableColorSegment}% ${progressColorEnd}%, #64748b ${progressColorEnd}% 100%)` }}>
                <div className="donut-inner">
                  <strong>{totalProjects}</strong>
                  <span>Projects</span>
                </div>
              </div>
            </div>
            <div className="status-list">
              <StatusRow
                className="tables"
                label="Total Tables"
                value={totalTables}
                percentage={totalTables > 0 ? 100 : 0}
                percentageLabel={totalTables > 0 ? `${totalTables} tables (100%)` : '0 tables (0%)'}
              />
              <StatusRow className="progress" label="In Progress" value={inProgressProjects} percentage={percentage(inProgressProjects)} percentageLabel={`${percentage(inProgressProjects)}%`} />
              <StatusRow className="draft" label="Draft" value={draftProjects} percentage={percentage(draftProjects)} percentageLabel={`${percentage(draftProjects)}%`} />
            </div>
          </div>
        </section>

        <section className="dashboard-card quick-card">
          <CardHeader title="Quick Actions" description="Start working faster" icon={<ArrowUpRight size={20} />} />
          <div className="quick-actions">
            <QuickAction icon={<Plus size={20} />} tone="purple" title="Create Project" description="Start a new backend" onClick={goNewProject} />
            <QuickAction icon={<LayoutTemplate size={20} />} tone="blue" title="Browse Templates" description="Choose a backend template" onClick={() => navigate("/app/templates")} />
            <QuickAction icon={<Code2 size={20} />} tone="green" title="Generate Backend" description="Build your backend code" onClick={() => navigate("/app/new-project/backend")} />
          </div>
        </section>
      </div>

      <section className="dashboard-card recent-projects-card">
        <CardHeader title="Recent Projects" description="Your latest BackendBuilder projects" icon={<FolderKanban size={20} />} />
        <div className="recent-projects">
          {recentProjects.length === 0 ? (
            <div className="empty-projects">
              <FolderKanban size={38} />
              <h3>No projects yet</h3>
              <p>Create your first project to get started.</p>
              <button type="button" onClick={goNewProject}><Plus size={16} />Create Project</button>
            </div>
          ) : recentProjects.map((project) => (
            <div className="project-row" key={project.name}>
              <div className="project-left">
                <div className="project-icon"><Code2 size={19} /></div>
                <div className="project-info">
                  <strong>{project.name || "Untitled project"}</strong>
                  <div className="project-meta">
                    <span><Database size={13} />{project.type || "Unknown DB"}</span>
                    <span>{project.tableCount ?? 0} table{project.tableCount === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>
          ))}
        </div>
      </section>

      {error && <div className="dashboard-error"><AlertCircle size={20} /><span>{error}</span></div>}
    </div>
  );
}

function CardHeader({ title, description, icon }) {
  return <div className="card-header"><div><h2>{title}</h2><p>{description}</p></div>{icon}</div>;
}

function StatCard({ icon, title, value, description, type }) {
  return <div className="dashboard-stat-card"><div className={`stat-icon ${type}`}>{icon}</div><div className="stat-card-content"><span>{title}</span><strong>{value}</strong><small>{description}</small></div></div>;
}

function StatusRow({ className, label, value, percentage, percentageLabel }) {
  return <div className="status-row"><div className="status-row-top"><span><i className={`status-dot ${className}`} />{label}</span><strong>{percentageLabel ?? `${percentage}%`}</strong></div><div className="status-progress"><div className={`status-progress-fill ${className}`} style={{ width: `${percentage}%` }} /></div></div>;
}

function QuickAction({ icon, tone, title, description, onClick }) {
  return <button className="quick-action" type="button" onClick={onClick}><div className={`quick-icon ${tone}`}>{icon}</div><div><strong>{title}</strong><span>{description}</span></div><ArrowUpRight size={17} /></button>;
}

function StatusBadge({ status }) {
  const label = typeof status === "string" && status ? status : "Draft";
  return <span className={`project-status ${label.toLowerCase().replace(/\s+/g, "-")}`}>{label}</span>;
}