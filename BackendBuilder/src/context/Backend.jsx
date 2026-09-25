import React, { createContext, useContext, useEffect, useState } from 'react'
import { backendApi } from '../utils/backendApi'
import { useAuth } from './AuthContext'

const defaultContextValue = {
    Databases: [],
    setDatabases: () => {},
    activeDatabase: null,
    setActiveDatabase: () => {},
    LoginStatus: false,
    setLoginStatus: () => {},
    authLoading: false,
    currentUser: null,
    setCurrentUser: () => {},
    userId: null,
    setUserId: () => {},
    NumberofTables: 0,
    setNumberofTables: () => {},
    TableNames: [],
    setTableNames: () => {},
    steps: 1,
    setSteps: () => {},
    Tables: [],
    setTables: () => {},
    Connections: [],
    setConnections: () => {},
    pendingConnection: null,
    setPendingConnection: () => {},
    apiConfig: {},
    setApiConfig: () => {},
    apiName: '',
    setApiName: () => {},
    authMethod: 'JWT Authentication',
    setAuthMethod: () => {},
    connectionLoading: false,
    connectionError: '',
    saveLoading: false,
    saveMessage: '',
    saveError: '',
    login: async () => null,
    logout: async () => {},
    getUsers: async () => null,
    saveProgress: async () => false,
    Defitions: [],
    setDefitions: () => {},
    Table: class Table {},
    Database: class Database {},
    TableConnections: class TableConnections {},
    chatMessagesByScope: {},
    setChatMessagesByScope: () => {},
    backendApi,
};

const DEFAULT_DATABASE_TYPE = 'PostgreSQL';

const Appcontext = createContext(defaultContextValue);

const Backend = ({ children }) => {

    const [Databases, setDatabases] = useState([]);
    const [activeDatabase, setActiveDatabase] = useState(null);
    const [Defitions , setDefitions] = useState([]);
    const [steps , setSteps] = useState(1);
    const [LoginStatus, setLoginStatus] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [NumberofTables, setNumberofTables] = useState(0);
    const [TableNames, setTableNames] = useState([]);
    const [Tables, setTables] = useState([]);
    const [Connections, setConnections] = useState([]);
    const [pendingConnection, setPendingConnection] = useState(null);
    const [apiConfig, setApiConfig] = useState({});
    const [apiName, setApiName] = useState('');
    const [authMethod, setAuthMethod] = useState('JWT Authentication');
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');
    const { user: authenticatedUser, loading: authLoading, login, logout } = useAuth();

    useEffect(() => {
        console.log('ConnectionList updated:', Connections)
    }, [Connections]);
    const [chatMessages, setChatMessages] = useState({});
    const [Tableconstains , setTableconstains] = useState([]);
    const LOCAL_USER_KEY = 'backendbuilder_local_user_state';

    const persistLocalUserState = (userData = null, databaseList = []) => {
        const nextUser = {
            ...(userData || currentUser || {}),
            id: userData?.id || userData?.userId || userData?.userID || userData?.user_id || currentUser?.id || currentUser?.userId || userId || null,
            userId: userData?.userId || userData?.id || userData?.userID || userData?.user_id || currentUser?.userId || currentUser?.id || userId || null,
            userID: userData?.userID || userData?.id || userData?.userId || userData?.user_id || currentUser?.userID || currentUser?.id || userId || null,
            user_id: userData?.user_id || userData?.id || userData?.userId || userData?.userID || currentUser?.user_id || currentUser?.id || userId || null,
            databases: Array.isArray(databaseList) && databaseList.length > 0
                ? databaseList.map((database, index) => ({
                    ...database,
                    status: deriveDatabaseStatus(database),
                    Tables: getDatabaseTables(database),
                    DBconnection: getDatabaseConnections(database),
                    projectName: database.DBname || database.dbName || database.name || `Database ${index + 1}`,
                }))
                : Array.isArray((userData || currentUser || {}).databases)
                    ? (userData || currentUser).databases
                    : []
        }

        try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(nextUser))
        } catch (error) {
            console.warn('Unable to save local user state:', error)
        }

        return nextUser
    }

    const hydrateLocalUserState = () => {
        try {
            const storedValue = localStorage.getItem(LOCAL_USER_KEY)
            if (!storedValue) {
                return null
            }

            const storedUser = JSON.parse(storedValue)
            const userIdValue = storedUser?.id || storedUser?.userId || storedUser?.userID || storedUser?.user_id || null

            if (!userIdValue) {
                return null
            }

            const databaseList = Array.isArray(storedUser?.databases) ? storedUser.databases : []
            const normalizedDatabases = databaseList.map((database, index) => ({
                ...database,
                status: deriveDatabaseStatus(database),
                DBconnection: getDatabaseConnections(database),
                Tables: getDatabaseTables(database),
                projectName: database.DBname || database.dbName || database.name || `Database ${index + 1}`
            }))

            const nextUser = {
                ...storedUser,
                id: userIdValue,
                userId: storedUser?.userId || userIdValue,
                userID: storedUser?.userID || userIdValue,
                user_id: storedUser?.user_id || userIdValue,
                databases: normalizedDatabases,
            }

            setCurrentUser(nextUser)
            setUserId(userIdValue)
            setDatabases(normalizedDatabases)
            setTables(getDatabaseTables(normalizedDatabases[0]))
            setConnections(getDatabaseConnections(normalizedDatabases[0]))
            setLoginStatus(true)

            return nextUser
        } catch (error) {
            console.warn('Unable to restore local user state:', error)
            return null
        }
    }

    const deriveDatabaseStatus = (database = {}) => {
        const rawStatus = String(database.status || database.state || '').toLowerCase()

        if (rawStatus.includes('draft') || rawStatus.includes('complete') || rawStatus.includes('generated') || rawStatus.includes('ready')) {
            return 'Draft'
        }

        return 'In Progress'
    }

    const normalizeTable = (table = {}) => {
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
            Length: table.Length || table.lengths || table.length || columnObjects.map((column) => column.length || ''),
            Constraints: table.Constraints || table.constraints || columnObjects.map((column) => column.constraints || column.constraint || '')
        }
    }

    const getDatabaseTables = (database = {}) => {
        const tables = database.Tables || database.tables || database.tableList || database.databaseTables || []
        return Array.isArray(tables) ? tables.map(normalizeTable) : []
    }

    const getDatabaseConnections = (database = {}) => {
        const connections = database.DBconnection || database.DBConnection || database.dbConnection || database.connections || database.relationships || []
        return Array.isArray(connections) ? connections : []
    }

    const applyAuthenticatedUser = (user) => {
        const fallbackLocalUser = hydrateLocalUserState()
        const userIdValue = user?.id || user?.userId || user?.userID || user?.user_id || user?._id || fallbackLocalUser?.id || userId || null;

        if (!userIdValue) {
            const fallbackUser = {
                ...user,
                email: user?.email || fallbackLocalUser?.email || 'user@local.backendbuilder',
                authenticated: true,
                id: `local-${(user?.email || fallbackLocalUser?.email || 'user').replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()}`,
                userId: `local-${(user?.email || fallbackLocalUser?.email || 'user').replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()}`,
                userID: `local-${(user?.email || fallbackLocalUser?.email || 'user').replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()}`,
                user_id: `local-${(user?.email || fallbackLocalUser?.email || 'user').replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()}`,
                databases: Array.isArray(user?.databases) ? user.databases : Array.isArray(fallbackLocalUser?.databases) ? fallbackLocalUser.databases : [],
            }

            const persistedUser = persistLocalUserState(fallbackUser, Array.isArray(fallbackUser.databases) ? fallbackUser.databases : [])
            setCurrentUser(persistedUser)
            setUserId(persistedUser.id)
            setDatabases(Array.isArray(persistedUser.databases) ? persistedUser.databases : [])
            setTables(getDatabaseTables(Array.isArray(persistedUser.databases) ? persistedUser.databases[0] : null))
            setConnections(getDatabaseConnections(Array.isArray(persistedUser.databases) ? persistedUser.databases[0] : null))
            setLoginStatus(true)
            return persistedUser
        }

        const nextUser = {
            ...user,
            id: userIdValue,
            userId: user?.userId || userIdValue,
            userID: user?.userID || userIdValue,
            user_id: user?.user_id || userIdValue
        }

        const databases = Array.isArray(nextUser.databases) ? nextUser.databases : []
        const firstDatabase = databases[0]
        const normalizedDatabases = databases.map((database, index) => ({
            ...database,
            status: deriveDatabaseStatus(database),
            DBconnection: getDatabaseConnections(database),
            Tables: getDatabaseTables(database),
            projectName: database.DBname || database.dbName || database.name || `Database ${index + 1}`
        }))

        const persistedUser = persistLocalUserState(nextUser, normalizedDatabases)

        setCurrentUser(persistedUser)
        setUserId(userIdValue)
        setDatabases(normalizedDatabases)
        setTables(getDatabaseTables(firstDatabase))
        setConnections(getDatabaseConnections(firstDatabase))
        setLoginStatus(true)

        return persistedUser
    }

    const clearAuthentication = () => {
        setLoginStatus(false)
        setCurrentUser(null)
        setUserId(null)
        setDatabases([])
        setActiveDatabase(null)
        setTables([])
        setConnections([])
    }

    const normalizeDatabaseEntry = (database = {}, index = 0) => ({
        ...database,
        id: database.id || database.userId || `${database.DBname || database.dbName || database.name || 'database'}-${index}`,
        projectName: database.DBname || database.dbName || database.name || `Database ${index + 1}`,
        DBname: database.DBname || database.dbName || database.name || `Database ${index + 1}`,
        type: database.type || database.databaseType || database.dbType || DEFAULT_DATABASE_TYPE,
        Tables: getDatabaseTables(database),
        DBconnection: getDatabaseConnections(database),
        status: deriveDatabaseStatus(database)
    })

    const syncDatabases = (databaseList = []) => {
        const normalized = databaseList.map(normalizeDatabaseEntry)
        setDatabases(normalized)

        if (normalized.length === 0) {
            setActiveDatabase(null)
            return normalized
        }

        setActiveDatabase((current) => {
            const currentMatch = normalized.find((item) => item.id === current?.id || item.DBname === current?.DBname || item.projectName === current?.projectName)
            return currentMatch || normalized[0]
        })

        return normalized
    }

    const getUsers = async () => {
        if (!LoginStatus) {
            return null
        }

        return backendApi.getUsers()
    }

    const buildLocalProjectState = (databaseOverride = null, databaseNameOverride = '') => {
        const primaryDatabase = databaseOverride || activeDatabase || Databases[Databases.length - 1] || {}
        const baseDatabaseName = (databaseNameOverride || primaryDatabase?.DBname || primaryDatabase?.dbName || primaryDatabase?.name || '').trim()
        const databaseName = baseDatabaseName || `Database_${Date.now()}`
        const normalizedTables = (Array.isArray(Tables) ? Tables : []).map((table) => ({
            ...table,
            TableNames: table?.TableNames || table?.tableName || table?.name || '',
            colamnsname: Array.isArray(table?.colamnsname)
                ? table.colamnsname
                : Array.isArray(table?.columnNames) ? table.columnNames : [],
            Datatype: Array.isArray(table?.Datatype) ? table.Datatype : [],
            Length: Array.isArray(table?.Length) ? table.Length : [],
            Constraints: Array.isArray(table?.Constraints) ? table.Constraints : [],
        }))
        const normalizedConnections = Array.isArray(Connections) ? Connections.map((connection) => ({ ...connection })) : []
        const normalizedDatabase = {
            ...primaryDatabase,
            DBname: databaseName,
            projectName: databaseName,
            Username: primaryDatabase?.Username || primaryDatabase?.username || '',
            Password: primaryDatabase?.Password || primaryDatabase?.password || '',
            DBurl: primaryDatabase?.DBurl || primaryDatabase?.dbUrl || primaryDatabase?.connectionUrl || '',
            type: primaryDatabase?.type || primaryDatabase?.databaseType || primaryDatabase?.dbType || DEFAULT_DATABASE_TYPE,
            Tables: normalizedTables,
            DBconnection: normalizedConnections,
            status: deriveDatabaseStatus(primaryDatabase),
            _originalName: primaryDatabase?._originalName || databaseName,
        }

        const userRecord = {
            ...(currentUser || {}),
            id: userId || currentUser?.id || currentUser?.userId || currentUser?.user_id || currentUser?.userID || null,
            userId: userId || currentUser?.userId || currentUser?.id || currentUser?.user_id || currentUser?.userID || null,
            userID: currentUser?.userID || userId || currentUser?.id || currentUser?.user_id || null,
            user_id: currentUser?.user_id || userId || currentUser?.id || currentUser?.userId || currentUser?.userID || null,
        }

        return {
            ...userRecord,
            databases: [
                ...Databases.filter((item) => {
                    const itemName = (item?.DBname || item?.dbName || item?.name || '').trim().toLowerCase()
                    return itemName && itemName !== databaseName.trim().toLowerCase()
                }),
                normalizedDatabase,
            ],
        }
    }

    const saveProgress = async ({ silent = false } = {}) => {
        setSaveLoading(true)
        if (!silent) {
            setSaveMessage('')
            setSaveError('')
        }

        try {
            const resolvedUserId = userId || currentUser?.id || currentUser?.userId || currentUser?.user_id || currentUser?.userID || null

            if (!resolvedUserId) {
                throw new Error('You must be signed in before saving your progress.')
            }

            const database = activeDatabase || Databases[Databases.length - 1] || {}
            const currentDatabaseName = database?.DBname || database?.dbName || database?.name || ''
            const databaseName = (currentDatabaseName || `Database_${Date.now()}`).trim()
            const originalDatabaseName = (database?._originalName || currentDatabaseName || databaseName).trim()

            const duplicateDatabase = Databases.some((item) => {
                const itemName = (item?.DBname || item?.dbName || item?.name || '').trim().toLowerCase()
                const currentName = databaseName.trim().toLowerCase()

                if (!itemName || !currentName) {
                    return false
                }

                const isSameDatabase = (item?.DBname || item?.dbName || item?.name) === currentDatabaseName

                return itemName === currentName && !isSameDatabase
            })

            if (duplicateDatabase) {
                window.alert('A database with this name already exists. Please choose a different name before saving.')
                if (!silent) {
                    setSaveError('A database with this name already exists. Please choose a different name.')
                    setSaveMessage('')
                }
                return false
            }

            const localProjectState = buildLocalProjectState(database, databaseName)
            const localDatabase = localProjectState.databases.find((item) => {
                const itemName = (item?.DBname || item?.dbName || item?.name || '').trim().toLowerCase()
                return itemName === databaseName.trim().toLowerCase()
            }) || {
                DBname: databaseName,
                Username: database?.Username || database?.username || '',
                Password: database?.Password || database?.password || '',
                DBurl: database?.DBurl || database?.dbUrl || database?.connectionUrl || '',
                type: database?.type || database?.databaseType || DEFAULT_DATABASE_TYPE,
                Tables: Array.isArray(Tables) ? Tables : [],
                DBconnection: Array.isArray(Connections) ? Connections : [],
            }

            const databasePayload = {
                DBname: localDatabase.DBname || databaseName,
                Username: localDatabase.Username || localDatabase.username || '',
                Password: localDatabase.Password || localDatabase.password || '',
                DBurl: localDatabase.DBurl || localDatabase.dbUrl || localDatabase.connectionUrl || '',
                type: localDatabase.type || localDatabase.databaseType || DEFAULT_DATABASE_TYPE,
                Tables: (Array.isArray(localDatabase.Tables) ? localDatabase.Tables : Array.isArray(Tables) ? Tables : []).map((table) => ({
                    TableNames: table?.TableNames || table?.tableName || table?.name || '',
                    colamnsname: Array.isArray(table?.colamnsname)
                        ? table.colamnsname
                        : Array.isArray(table?.columnNames) ? table.columnNames : [],
                    Datatype: Array.isArray(table?.Datatype) ? table.Datatype : [],
                    Length: Array.isArray(table?.Length) ? table.Length : [],
                    Constraints: Array.isArray(table?.Constraints) ? table.Constraints : [],
                })),
                DBconnection: Array.isArray(localDatabase.DBconnection) ? localDatabase.DBconnection : Array.isArray(Connections) ? Connections : [],
            }

            const normalizedLocalUserState = persistLocalUserState(localProjectState, localProjectState.databases)
            setCurrentUser(normalizedLocalUserState)

            const existingDatabaseIndex = Databases.findIndex((item) => {
                const itemName = item?.DBname || item?.dbName || item?.name
                return itemName === databaseName || itemName === originalDatabaseName
            })

            if (existingDatabaseIndex === -1) {
                const created = await backendApi.addDatabaseToUser(resolvedUserId, databasePayload)

                if (created === false || created === 'false') {
                    throw new Error('The database could not be saved.')
                }
            } else if (originalDatabaseName && originalDatabaseName !== databaseName) {
                await backendApi.updateDatabaseName(resolvedUserId, originalDatabaseName, databaseName)
            }

            const tablesResult = await backendApi.updateDatabaseTables(resolvedUserId, databaseName, databasePayload.Tables)
            const connectionsResult = await backendApi.updateDatabaseConnection(resolvedUserId, databaseName, databasePayload.DBconnection)
            const databaseUsername = databasePayload.Username || databasePayload.username || ''
            const databasePassword = databasePayload.Password || databasePayload.password || ''
            const databaseUrl = databasePayload.DBurl || databasePayload.dbUrl || databasePayload.connectionUrl || ''
            const databaseType = databasePayload.type || databasePayload.databaseType || DEFAULT_DATABASE_TYPE

            await Promise.all([
                backendApi.updateDatabaseUsername(resolvedUserId, databaseName, databaseUsername),
                backendApi.updateDatabasePassword(resolvedUserId, databaseName, databasePassword),
                backendApi.updateDatabaseUrl(resolvedUserId, databaseName, databaseUrl),
                backendApi.updateDatabaseType(resolvedUserId, databaseName, databaseType),
            ])

            if (tablesResult === false || tablesResult === 'false') {
                throw new Error('The table data could not be saved.')
            }

            if (connectionsResult === false || connectionsResult === 'false') {
                throw new Error('The database connection data could not be saved.')
            }

            const savedResponse = await backendApi.getCurrentUser()
            const savedUser = savedResponse?.user && typeof savedResponse.user === 'object'
                ? savedResponse.user
                : savedResponse
            const verifiedDatabase = Array.isArray(savedUser?.databases)
                ? savedUser.databases.find((item) => (
                    (item?.DBname || item?.dbName || item?.name || '').trim().toLowerCase() === databaseName.toLowerCase()
                ))
                : null

            const localUserState = persistLocalUserState(localProjectState, localProjectState.databases)
            setCurrentUser(localUserState)

            if (!verifiedDatabase) {
                throw new Error('The database was not found after saving. Please try again.')
            }

            const verifiedTables = verifiedDatabase.Tables || verifiedDatabase.tables || []
            if (Array.isArray(databasePayload.Tables) && Array.isArray(verifiedTables) && verifiedTables.length !== databasePayload.Tables.length) {
                throw new Error('The database was saved, but the table data was not stored correctly.')
            }

            const savedDatabase = {
                ...databasePayload,
                Tables: Array.isArray(Tables) ? Tables : [],
                DBconnection: Array.isArray(Connections) ? Connections : [],
                status: 'In Progress',
                projectName: databaseName,
                _originalName: databaseName,
            }

            setDatabases((previousDatabases) => {
                const exists = previousDatabases.some((item) => {
                    const itemName = item?.DBname || item?.dbName || item?.name
                    return itemName === databaseName
                })

                const updatedDatabases = exists
                    ? previousDatabases.map((item) => {
                        const itemName = item?.DBname || item?.dbName || item?.name
                        return itemName === databaseName
                            ? savedDatabase
                            : item
                    })
                    : [...previousDatabases, savedDatabase]

                const nextActiveDatabase = updatedDatabases.find((item) => {
                    const itemName = item?.DBname || item?.dbName || item?.name
                    return itemName === databaseName
                }) || savedDatabase

                setActiveDatabase(nextActiveDatabase)
                return updatedDatabases
            })

            if (!silent) {
                setSaveMessage('Database saved successfully.')
                setSaveError('')
            }
            return true
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unable to save your progress.'
            if (!silent) {
                setSaveError(message)
                setSaveMessage('')
            }
            throw error
        } finally {
            setSaveLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false;

        if (authLoading) {
            return () => {
                cancelled = true;
            };
        }

        if (authenticatedUser) {
            if (!cancelled) {
                setConnectionLoading(false);
                setConnectionError('');
                applyAuthenticatedUser(authenticatedUser);
            }
            return () => {
                cancelled = true;
            };
        }

        const restoredUser = hydrateLocalUserState()

        if (!restoredUser) {
            clearAuthentication();
            setConnectionLoading(false);
            setConnectionError('');
            return () => {
                cancelled = true;
            };
        }

        if (!cancelled) {
            setConnectionLoading(false);
            setConnectionError('');
        }

        return () => {
            cancelled = true;
        };
    }, [authLoading, authenticatedUser]);

    useEffect(() => {
        if (!activeDatabase) {
            setTables([])
            setConnections([])
            return
        }

        const nextDatabaseName = activeDatabase?.DBname || activeDatabase?.dbName || activeDatabase?.name || ''

        setApiName((previousApiName) => {
            const cleanPrevious = (previousApiName || '').trim()
            return cleanPrevious || nextDatabaseName || ''
        })

        const loadedTables = getDatabaseTables(activeDatabase)
        setTables(loadedTables)
        setConnections(getDatabaseConnections(activeDatabase))
        setNumberofTables(loadedTables.length)
        setTableNames(loadedTables.map((table) => table.TableNames || table.tableName || table.name || ''))
    }, [activeDatabase])
    

    class Table {

        TableNames = '';
        colamnsname = [];
        Datatype = [];
        Length = [];
        Constraints = [];

        constructor(TableNames) {
            this.TableNames = TableNames
        }

        addColumns(name, datatype, length, constraints) {
            this.colamnsname.push(name);
            this.Datatype.push(datatype);
            this.Length.push(length);
            this.Constraints.push(constraints);
        }

        addfully(colamnsname , Datatype , Length , Constraints){
            this.colamnsname = colamnsname;
            this.Datatype = Datatype;
            this.Length = Length;
            this.Constraints = Constraints;
        }

        
    }

    class Database {

        DBname = '';
        Username = '';
        Password = '';
        DBurl = '';
        type = '';
        Tables = [];
        DBconnection = [];

        constructor (DBname , Username , DBpassword , DBurl , type) {

            this.DBname =DBname;
            this.Username = Username ;
            this.Password = DBpassword; 
            this.DBurl = DBurl;
            this.type = type;

        }

        setTable (Table) {

            this.Tables.push(Table)
        }

        setAllTables(Tables) {

            this.Tables = Tables;
        }

        setConection(DBconnection) {
            this.DBconnection.push(DBconnection) 
        }

        setAllConnection(DBconnection) {
            this.DBconnection = DBconnection;
        }

    }

    class TableConnections {

        ParentTable = '';
        ChildTable = '';
        ParentColumn = '';
        ChildColumn = '';
        ParentRelation = '';
        childRelation = '';

    constructor(ParentTable , ChildTable , ParentColumn , ChildColumn , ParentRelation , childRelation){

        this.ParentTable = ParentTable;
        this.ChildTable = ChildTable;
        this.ParentColumn = ParentColumn;
        this.ChildColumn = ChildColumn;
        this.ParentRelation = ParentRelation;
        this.childRelation = childRelation;
    }
        
    }

    const PreventTablename = () => {

    }


    return (
        <Appcontext.Provider
        value={{ Databases, setDatabases, activeDatabase, setActiveDatabase, LoginStatus, setLoginStatus, authLoading, currentUser, setCurrentUser, userId, setUserId, login, logout, getUsers, saveProgress, saveLoading, saveMessage, saveError, connectionLoading, connectionError, NumberofTables, setNumberofTables,Defitions, setDefitions , TableNames, setTableNames, steps, setSteps , Tables, setTables, Connections, setConnections, pendingConnection, setPendingConnection, apiConfig, setApiConfig, apiName, setApiName, authMethod, setAuthMethod, Table , Database, chatMessagesByScope: chatMessages, setChatMessagesByScope: setChatMessages , PreventTablename, TableConnections, backendApi}}>
            {connectionLoading && <div role='status'>Loading connections...</div>}
            {connectionError && <div role='alert'>{connectionError}</div>}
            {children}
        </Appcontext.Provider>
    )
}

export { Appcontext }
export default Backend