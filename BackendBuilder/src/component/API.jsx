import React, { useContext, useEffect, useMemo, useState } from 'react';
import '../style/API.css';
import { Appcontext } from '../context/Backend';
import MaddyChatbot from './MaddyChatbot';
import {
    Check,
    ChevronDown,
    Info,
    Plus,
    ShieldCheck,
    Trash2
} from 'lucide-react';

const OPERATIONS = ['GET', 'POST', 'PUT', 'DELETE'];

const createDefaultApiConfig = () => ({
    GET: true,
    POST: true,
    PUT: true,
    DELETE: true,
    customRoutes: []
});

const createResourcePath = (tableName = '') => {
    return tableName
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
};

const normalizeRouteEntry = (route) => {
    if (typeof route === 'string') {
        return {
            id: `${Date.now()}-${Math.random()}`,
            name: route.replace(/^\/+|\/+$/g, '').trim(),
            method: 'GET',
            enabled: true
        };
    }

    if (route && typeof route === 'object') {
        return {
            id: route.id || `${Date.now()}-${Math.random()}`,
            name: String(route.name || route.endpoint || '').trim(),
            method: route.method || 'GET',
            enabled: route.enabled !== false
        };
    }

    return {
        id: `${Date.now()}-${Math.random()}`,
        name: '',
        method: 'GET',
        enabled: true
    };
};

const createApiEntry = (tableName) => ({
    id: `${tableName}-${Date.now()}-${Math.random()}`,
    name: '',
    method: 'GET',
    enabled: true
});

const createPreviewRoutes = (tables, apiConfig) => {
    const routes = [];

    tables.forEach((table) => {
        const tableName = table.TableNames || '';
        const config = apiConfig?.[tableName] || createDefaultApiConfig();
        const resource = createResourcePath(tableName);

        if (config.GET) {
            routes.push({ method: 'GET', path: `/api/${resource}` });
            routes.push({ method: 'GET', path: `/api/${resource}/{id}` });
        }

        if (config.POST) {
            routes.push({ method: 'POST', path: `/api/${resource}` });
        }

        if (config.PUT) {
            routes.push({ method: 'PUT', path: `/api/${resource}/{id}` });
        }

        if (config.DELETE) {
            routes.push({ method: 'DELETE', path: `/api/${resource}/{id}` });
        }

        if (Array.isArray(config.customRoutes)) {
            config.customRoutes
                .filter((route) => route && (typeof route === 'string' ? route.trim() : route.name || route.endpoint))
                .forEach((route) => {
                    const entry = normalizeRouteEntry(route);
                    if (!entry.enabled) {
                        return;
                    }

                    const name = entry.name.trim();
                    const pathName = name
                        ? name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
                        : 'custom';

                    routes.push({
                        method: entry.method.toUpperCase(),
                        path: `/api/${resource}/${pathName}`
                    });
                });
        }
    });

    return routes;
};

const API = () => {

    const {
        Tables = [],
        apiConfig = {},
        setApiConfig,
        authMethod,
        setAuthMethod
    } = useContext(Appcontext);

    const [selectedTable, setSelectedTable] = useState('');
    const [apiEntriesByTable, setApiEntriesByTable] = useState({});

    useEffect(() => {
        if (!Tables.length) {
            setSelectedTable('');
            return;
        }

        if (!selectedTable || !Tables.some((table) => table.TableNames === selectedTable)) {
            setSelectedTable(Tables[0].TableNames);
        }
    }, [Tables, selectedTable]);

    useEffect(() => {
        setApiConfig((previous) => {
            const next = { ...previous };

            Tables.forEach((table) => {
                const tableName = table.TableNames;
                if (!tableName) return;

                const oldConfig = next[tableName] || createDefaultApiConfig();
                const entries = apiEntriesByTable[tableName] || [];

                next[tableName] = {
                    GET: oldConfig.GET ?? true,
                    POST: oldConfig.POST ?? true,
                    PUT: oldConfig.PUT ?? true,
                    DELETE: oldConfig.DELETE ?? true,
                    customRoutes: entries
                        .filter((entry) => entry.enabled && entry.name.trim())
                        .map((entry) => ({
                            id: entry.id,
                            name: entry.name.trim(),
                            method: entry.method,
                            enabled: entry.enabled
                        }))
                };
            });

            Object.keys(next).forEach((tableName) => {
                const exists = Tables.some((table) => table.TableNames === tableName);
                if (!exists) delete next[tableName];
            });

            return next;
        });
    }, [Tables, apiEntriesByTable, setApiConfig]);

    useEffect(() => {
        setApiEntriesByTable((previous) => {
            const nextEntries = {};

            Tables.forEach((table) => {
                const tableName = table.TableNames;
                if (!tableName) return;

                if (previous[tableName]) {
                    nextEntries[tableName] = previous[tableName];
                    return;
                }

                const config = apiConfig?.[tableName] || createDefaultApiConfig();
                const savedEntries = Array.isArray(config.customRoutes)
                    ? config.customRoutes.map(normalizeRouteEntry)
                    : [];

                nextEntries[tableName] = savedEntries.length
                    ? savedEntries
                    : [createApiEntry(tableName)];
            });

            const unchanged = Object.keys(previous).length === Object.keys(nextEntries).length
                && Object.keys(nextEntries).every((tableName) => previous[tableName] === nextEntries[tableName]);

            return unchanged ? previous : nextEntries;
        });
    }, [Tables, apiConfig]);

    const previewRoutes = useMemo(() => createPreviewRoutes(Tables, apiConfig), [Tables, apiConfig]);

    const currentEntries = useMemo(() => {
        if (!selectedTable) return [];
        return apiEntriesByTable[selectedTable] || [createApiEntry(selectedTable)];
    }, [apiEntriesByTable, selectedTable]);

    const addApiEntry = (tableName) => {
        setApiEntriesByTable((previous) => ({
            ...previous,
            [tableName]: [...(previous[tableName] || []), createApiEntry(tableName)]
        }));
    };

    const updateApiEntry = (tableName, entryId, field, value) => {
        setApiEntriesByTable((previous) => ({
            ...previous,
            [tableName]: (previous[tableName] || []).map((entry) =>
                entry.id === entryId ? { ...entry, [field]: value } : entry
            )
        }));
    };

    const removeApiEntry = (tableName, entryId) => {
        setApiEntriesByTable((previous) => ({
            ...previous,
            [tableName]: (previous[tableName] || []).filter((entry) => entry.id !== entryId)
        }));
    };

    return (

        <div className="apiLayout">

            <main className="apiMain">

                <div className="apiWorkspace">

                    <section className="apiTablePanel">

                        <div className="apiTableSelector">
                            {Tables.length === 0 ? (
                                <div className="apiEmptyState">No tables available yet.</div>
                            ) : (
                                Tables.map((table) => {
                                    const tableName = table.TableNames;
                                    const isSelected = selectedTable === tableName;

                                    return (
                                        <button
                                            type="button"
                                            key={tableName}
                                            className={`apiTableChip ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedTable(tableName)}
                                        >
                                            {tableName}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="apiBuilderCard">
                            <div className="apiBuilderHeader">
                                <div>
                                    <span className="apiBuilderLabel">Selected Table</span>
                                    <h4>{selectedTable || 'No table selected'}</h4>
                                </div>
                                <button type="button" className="apiAddBtn" onClick={() => addApiEntry(selectedTable)}>
                                    <Plus size={14} /> Add API
                                </button>
                            </div>

                            <div className="apiEntryList">
                                {currentEntries.length === 0 ? (
                                    <div className="apiNoEntry">No API created for this table yet.</div>
                                ) : (
                                    currentEntries.map((entry) => (
                                        <div className="apiEntryCard" key={entry.id}>
                                            <div className="apiField apiFieldWide">
                                                <label>API Name</label>
                                                <input
                                                    type="text"
                                                    value={entry.name}
                                                    placeholder="users-list"
                                                    onChange={(event) => updateApiEntry(selectedTable, entry.id, 'name', event.target.value)}
                                                />
                                            </div>

                                            <div className="apiField apiFieldShort">
                                                <label>Type</label>
                                                <select
                                                    value={entry.method}
                                                    onChange={(event) => updateApiEntry(selectedTable, entry.id, 'method', event.target.value)}
                                                >
                                                    {OPERATIONS.map((operation) => (
                                                        <option key={operation} value={operation}>{operation}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <label className="apiToggle">
                                                <input
                                                    type="checkbox"
                                                    checked={entry.enabled}
                                                    onChange={(event) => updateApiEntry(selectedTable, entry.id, 'enabled', event.target.checked)}
                                                />
                                                <span>Enabled</span>
                                            </label>

                                            <button
                                                type="button"
                                                className="apiRemoveBtn"
                                                onClick={() => removeApiEntry(selectedTable, entry.id)}
                                                aria-label="Remove API"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="apiAbout">
                                <div className="apiAboutIcon">
                                    <Info size={13} />
                                </div>
                                <div>
                                    <h4>How this works</h4>
                                    <p>Select a table, create as many API routes as needed, choose the request type, and preview the generated endpoint before saving.</p>
                                </div>
                            </div>
                        </div>

                    </section>

                    <section className="apiPreviewPanel">

                        <div className="apiPreviewTitle">
                            <span>Preview</span>
                        </div>

                        <div className="apiPreview">
                            {previewRoutes.length === 0 ? (
                                <p className="apiNoPreview">Create API routes to preview generated endpoints.</p>
                            ) : (
                                previewRoutes.map((route, index) => (
                                    <div className="apiRoute" key={`${route.method}-${route.path}-${index}`}>
                                        <span className={`apiMethod ${route.method.toLowerCase()}`}>
                                            {route.method}
                                        </span>
                                        <span className="apiPath">{route.path}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="apiAuth">
                            <div className="apiAuthTitle">
                                <span className="apiAuthIcon">
                                    <ShieldCheck size={14} />
                                </span>
                                <strong>Authentication</strong>
                            </div>

                            <div className="apiSelect">
                                <select value={authMethod} onChange={(event) => setAuthMethod(event.target.value)}>
                                    <option>JWT Authentication</option>
                                    <option>No Authentication</option>
                                    <option>API Key</option>
                                </select>
                                <ChevronDown size={14} />
                            </div>
                        </div>

                    </section>

                </div>

            </main>

            <aside className="apiChat">
                <MaddyChatbot conversationKey="api" />
            </aside>

        </div>
    );
};

export default API;
