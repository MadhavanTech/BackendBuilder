import React, {
    useContext,
    useMemo,
    useState
} from 'react';

import '../style/GBackend.css';

import { Appcontext } from '../context/Backend';
import { resolveGenerateError } from '../utils/backendApi';

import {
    Check,
    Code2,
    Database,
    Layers3,
    Rocket,
    ShieldCheck,
    Table2
} from 'lucide-react';

import MaddyChatbot from './MaddyChatbot';


const GBackend = () => {

    const {
        Tables = [],
        Connections = [],
        Databases = [],
        activeDatabase: selectedDatabase,
        apiConfig = {},
        apiName,
        setApiName,
        authMethod,
        backendApi,
        userId,
        saveProgress,
        saveLoading,
        currentUser
    } = useContext(Appcontext);


    const [isGenerating, setIsGenerating] =
        useState(false);

    const [statusMessage, setStatusMessage] =
        useState('');

    const [statusError, setStatusError] =
        useState('');


    /* =====================================
       DATABASE
    ===================================== */

    const activeDatabase = useMemo(() => {

        if (!Databases.length) {
            return null;
        }

        return selectedDatabase || Databases[Databases.length - 1];

    }, [Databases, selectedDatabase]);


    const databaseName =
        activeDatabase?.DBname ||
        activeDatabase?.dbName ||
        activeDatabase?.name ||
        'my_application_db';


    const databaseType = String(
        activeDatabase?.type ||
        activeDatabase?.databaseType ||
        activeDatabase?.dbType ||
        'PostgreSQL'
    ).trim();

    const resolvedApiName = (apiName || databaseName || 'my-backend').trim();


    /* =====================================
       COLUMN COUNT
    ===================================== */

    const totalColumns = useMemo(() => {

        return Tables.reduce(
            (total, table) => {

                const columns =
                    Array.isArray(
                        table.colamnsname
                    )
                        ? table.colamnsname.length
                        : 0;

                return total + columns;

            },
            0
        );

    }, [Tables]);


    /* =====================================
       API COUNT
    ===================================== */

    const apiCount = useMemo(() => {

        let count = 0;

        Object.values(apiConfig)
            .forEach((config) => {

                if (!config) {
                    return;
                }

                /*
                 * GET creates:
                 * GET /resource
                 * GET /resource/{id}
                 */
                if (config.GET) {
                    count += 2;
                }

                if (config.POST) {
                    count += 1;
                }

                if (config.PUT) {
                    count += 1;
                }

                if (config.DELETE) {
                    count += 1;
                }

                if (
                    Array.isArray(
                        config.customRoutes
                    )
                ) {
                    count += config.customRoutes
                        .filter(
                            (route) => {
                                if (typeof route === 'string') {
                                    return route.trim();
                                }

                                return Boolean(
                                    route &&
                                    (route.name || route.endpoint) &&
                                    route.enabled !== false
                                );
                            }
                        )
                        .length;
                }

            });

        return count;

    }, [apiConfig]);


    /* =====================================
       READY CHECK
    ===================================== */

    const isReady =
        Tables.length > 0 &&
        Tables.every(
            (table) =>
                Array.isArray(
                    table.colamnsname
                ) &&
                table.colamnsname.length > 0
        );


    /* =====================================
       GENERATE
    ===================================== */

    const handleGenerateBackend =
        async () => {

            setStatusMessage('');
            setStatusError('');


            if (!isReady) {

                setStatusError(
                    'Please complete your tables and columns before generating the backend.'
                );

                return;
            }


            if (isGenerating) {
                return;
            }


            setIsGenerating(true);


            try {
                if (typeof saveProgress === 'function') {
                    await saveProgress({ silent: true });
                }

                const currentUserId = userId || currentUser?.id || currentUser?.userId || currentUser?.userID || currentUser?.user_id;
                const nextApiName = (apiName || databaseName || 'my-backend').trim();

                if (!currentUserId) {
                    throw new Error('Please sign in before generating the backend.');
                }

                if (!nextApiName) {
                    throw new Error('Please enter an API name before generating the backend.');
                }

                if (!backendApi || typeof backendApi.generateBackend !== 'function') {
                    throw new Error('No backend generation endpoint is configured for this project yet.');
                }

                await backendApi.generateBackend(currentUserId, nextApiName, databaseType);

                setStatusMessage(`Backend generated successfully for ${nextApiName}.`);
                setStatusError('');

            } catch (error) {
                const message = await resolveGenerateError(error);
                setStatusError(message);
                setStatusMessage('');

            } finally {

                setIsGenerating(false);

            }

        };

    return (

        <div className="backendLayout">


            {/* =================================
                MAIN
            ================================= */}

            <main className="backendMain">

                {(statusMessage || statusError || isGenerating) && (
                    <div className={`backendStatusBanner ${statusError ? 'isError' : 'isSuccess'}`} role="status">
                        {isGenerating && !statusMessage && !statusError
                            ? 'Saving and generating backend...'
                            : statusMessage || statusError}
                    </div>
                )}

                {/* =================================
                    CONTENT
                ================================= */}

                <div className="backendContent">


                    {/* =================================
                        PROJECT SUMMARY
                    ================================= */}

                    <section className="summaryPanel">

                        <h4>
                            Project Summary
                        </h4>

                        <div className="summaryRow">
                            <span className="summaryLabel">
                                <Code2 size={14} />
                                API Name
                            </span>
                            <input
                                type="text"
                                value={resolvedApiName}
                                onChange={(event) => setApiName(event.target.value)}
                                placeholder="Enter API name"
                                className="apiNameInput"
                                aria-label="API name"
                            />
                        </div>

                        <div className="summaryRows">


                            {/* DATABASE NAME */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <Database size={14} />

                                    Database Name

                                </span>

                                <strong>
                                    {databaseName}
                                </strong>

                            </div>


                            {/* TABLES */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <Table2 size={14} />

                                    Tables

                                </span>

                                <strong>

                                    {Tables.length}

                                    {' ('}

                                    {
                                        Tables
                                            .map(
                                                (table) =>
                                                    table.TableNames
                                            )
                                            .filter(Boolean)
                                            .join(', ') ||
                                        'none'
                                    }

                                    {')'}

                                </strong>

                            </div>


                            {/* COLUMNS */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <Layers3 size={14} />

                                    Total Columns

                                </span>

                                <strong>
                                    {totalColumns}
                                </strong>

                            </div>


                            {/* AUTH */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <ShieldCheck size={14} />

                                    Authentication

                                </span>

                                <strong>
                                    {authMethod ||
                                        'JWT Authentication'}
                                </strong>

                            </div>


                            {/* API */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <Code2 size={14} />

                                    APIs

                                </span>

                                <strong>
                                    {apiCount} Endpoints
                                </strong>

                            </div>


                            {/* DATABASE TYPE */}

                            <div className="summaryRow">

                                <span className="summaryLabel">

                                    <Database size={14} />

                                    Database

                                </span>

                                <strong>
                                    {databaseType}
                                </strong>

                            </div>


                        </div>

                    </section>


                    {/* =================================
                        WHAT YOU GET
                    ================================= */}

                    <section className="benefitsPanel">

                        <h4>
                            What You'll Get
                        </h4>


                        <ul>

                            <li>

                                <span>
                                    <Check size={10} />
                                </span>

                                Complete database setup
                                with tables and relations

                            </li>


                            <li>

                                <span>
                                    <Check size={10} />
                                </span>

                                RESTful APIs with CRUD
                                operations

                            </li>


                            <li>

                                <span>
                                    <Check size={10} />
                                </span>

                                Authentication &
                                Authorization (JWT)

                            </li>


                            <li>

                                <span>
                                    <Check size={10} />
                                </span>

                                Clean & well-structured
                                code

                            </li>


                            <li>

                                <span>
                                    <Check size={10} />
                                </span>

                                Project ready to deploy

                            </li>

                        </ul>

                    </section>

                </div>


                {/* =================================
                    GENERATE
                ================================= */}

                <div className="backendGenerate">

                    <button
                        type="button"
                        className="generateButton"
                        onClick={
                            handleGenerateBackend
                        }
                        disabled={
                            !isReady ||
                            isGenerating
                        }
                    >

                        <Rocket size={15} />

                        {
                            isGenerating
                                ? (saveLoading ? 'Saving and generating backend...' : 'Generating backend...')
                                : 'Generate Backend'
                        }

                    </button>

                    <small>
                        This may take a few seconds...
                    </small>


                </div>

            </main>


        </div>
    );
};


export default GBackend;