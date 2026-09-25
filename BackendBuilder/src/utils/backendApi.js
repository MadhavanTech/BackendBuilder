import client from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080';

export const normalizeFriendlyErrorMessage = (message = '') => {
  const text = String(message || '').trim();

  if (!text) {
    return 'Something went wrong. Please try again.';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (/selected database type is missing|database type.*missing|no database type/i.test(normalized)) {
    return 'Please select a database type before generating the backend.';
  }

  if (/timed out while waiting for a server|MongoSocketWriteException|MongoSocketTimeoutException|read timed out/i.test(normalized)) {
    return 'Database connection timed out. Please check your server host, port, username, password, and network access.';
  }

  if (/No such host is known|UnknownHostException|host.*not.*found|unable to resolve host/i.test(normalized)) {
    return 'The database host could not be reached. Please check the connection URL and host name.';
  }

  if (/Authentication failed|not authorized|invalid credentials|auth failed/i.test(normalized)) {
    return 'Database authentication failed. Please verify the username and password.';
  }

  if (/Mongo.*connection|Mongo.*client|connect.*database/i.test(normalized)) {
    return 'Unable to connect to the database. Please verify your connection details and database access.';
  }

  if (/java\.net|com\.mongodb|MongoSocket|MongoCommandException|Exception sending message/i.test(normalized)) {
    return 'The database connection failed because the server could not be reached. Please check your connection details and database availability.';
  }

  return normalized;
};

export const resolveGenerateError = async (error) => {
  const responseData = error?.response?.data;

  if (responseData && typeof responseData?.text === 'function') {
    try {
      const text = (await responseData.text()).trim();

      if (!text) {
        return normalizeFriendlyErrorMessage(error?.response?.data?.message || error?.message || 'Unable to generate the backend.');
      }

      if (text.startsWith('{') || text.startsWith('[')) {
        const parsed = JSON.parse(text);

        if (parsed?.message) return normalizeFriendlyErrorMessage(parsed.message);
        if (parsed?.error) return normalizeFriendlyErrorMessage(parsed.error);
        return normalizeFriendlyErrorMessage(JSON.stringify(parsed));
      }

      return normalizeFriendlyErrorMessage(text);
    } catch (parseError) {
      return normalizeFriendlyErrorMessage(error?.response?.data?.message || error?.message || 'Unable to generate the backend.');
    }
  }

  if (responseData && typeof responseData === 'object') {
    if (responseData.message) return normalizeFriendlyErrorMessage(responseData.message);
    if (responseData.error) return normalizeFriendlyErrorMessage(responseData.error);
  }

  return normalizeFriendlyErrorMessage(error?.response?.data?.message || error?.message || 'Unable to generate the backend.');
};

const request = async (path, options = {}) => {
  try {
    const response = await client({
      url: path,
      ...options,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

const backendApi = {
  login: async (email, password) => {
    const endpoints = ['/auth/login', '/api/auth/login', '/login'];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await client.post(endpoint, { email, password });
        return response.data;
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status === 404 || status === 405) {
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  },
  getCurrentUser: async () => {
    const endpoints = ['/auth/me', '/api/auth/me'];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        return await request(endpoint);
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status === 404 || status === 405) {
          continue;
        }
        if (status === 401) {
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  register: (payload) => request('/auth/register', { method: 'POST', data: payload }),
  createUser: (user) => request('/auth/register', { method: 'POST', data: user }),
  getUsers: () => request('/User'),
  getAllUsers: () => request('/AllUser'),
  getUserById: (id) => request(`/User/${encodeURIComponent(id)}`),
  getUserByEmail: async (email) => request(`/User/email/${encodeURIComponent(email)}`),
  updateUserName: (id, name) => request(`/User/${encodeURIComponent(id)}/name?name=${encodeURIComponent(name)}`, { method: 'PUT' }),
  updateUserEmail: (id, email) => request(`/User/${encodeURIComponent(id)}/email?email=${encodeURIComponent(email)}`, { method: 'PUT' }),
  updateUserPassword: (id, password) => request(`/User/${encodeURIComponent(id)}/password?password=${encodeURIComponent(password)}`, { method: 'PUT' }),
  updateUser: (user) => request('/User', { method: 'PUT', data: user }),
  deleteUserById: (id) => request(`/User/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  addDatabaseToUser: (userId, database) => request(`/User/${encodeURIComponent(userId)}/database`, { method: 'POST', data: database }),
  findDatabaseByName: (userId, databaseName) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}`),
  updateDatabaseName: (userId, databaseName, newDBname) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/dbname?newDBname=${encodeURIComponent(newDBname)}`, { method: 'PUT' }),
  updateDatabaseUsername: (userId, databaseName, newUsername) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/username?newUsername=${encodeURIComponent(newUsername)}`, { method: 'PUT' }),
  updateDatabasePassword: (userId, databaseName, newPassword) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/password?newPassword=${encodeURIComponent(newPassword)}`, { method: 'PUT' }),
  updateDatabaseUrl: (userId, databaseName, newDBurl) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/dburl?newDBurl=${encodeURIComponent(newDBurl)}`, { method: 'PUT' }),
  updateDatabaseType: (userId, databaseName, newType) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/type?newType=${encodeURIComponent(newType)}`, { method: 'PUT' }),
  updateDatabaseTables: (userId, databaseName, tables) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/tables`, { method: 'PUT', data: tables }),
  updateDatabaseConnection: (userId, databaseName, dbConnection) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/dbconnection`, { method: 'PUT', data: dbConnection }),
  deleteDatabaseByName: (userId, databaseName) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}`, { method: 'DELETE' }),
  addTableToDatabase: (userId, databaseName, table) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table`, { method: 'POST', data: table }),
  findTableByName: (userId, databaseName, tableName) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}`),
  updateTableName: (userId, databaseName, tableName, newTableName) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}/name?newTableName=${encodeURIComponent(newTableName)}`, { method: 'PUT' }),
  updateTableColumnNames: (userId, databaseName, tableName, columnNames) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}/columns`, { method: 'PUT', data: columnNames }),
  updateTableDatatype: (userId, databaseName, tableName, datatype) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}/datatype`, { method: 'PUT', data: datatype }),
  updateTableLength: (userId, databaseName, tableName, length) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}/length`, { method: 'PUT', data: length }),
  updateTableConstraints: (userId, databaseName, tableName, constraints) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}/constraints`, { method: 'PUT', data: constraints }),
  deleteTableFromDatabase: (userId, databaseName, tableName) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(tableName)}`, { method: 'DELETE' }),
  addConnectionToDatabase: (userId, databaseName, connection) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection`, { method: 'POST', data: connection }),
  findConnectionByTables: (userId, databaseName, parentTable, childTable) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection?parentTable=${encodeURIComponent(parentTable)}&childTable=${encodeURIComponent(childTable)}`),
  updateConnectionParentTable: (userId, databaseName, currentParentTable, childTable, newParentTable) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection/parenttable?currentParentTable=${encodeURIComponent(currentParentTable)}&childTable=${encodeURIComponent(childTable)}&newParentTable=${encodeURIComponent(newParentTable)}`, { method: 'PUT' }),
  updateConnectionChildTable: (userId, databaseName, parentTable, currentChildTable, newChildTable) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection/childtable?parentTable=${encodeURIComponent(parentTable)}&currentChildTable=${encodeURIComponent(currentChildTable)}&newChildTable=${encodeURIComponent(newChildTable)}`, { method: 'PUT' }),
  updateConnectionParentRelation: (userId, databaseName, parentTable, childTable, newParentRelation) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection/parentrelation?parentTable=${encodeURIComponent(parentTable)}&childTable=${encodeURIComponent(childTable)}&newParentRelation=${encodeURIComponent(newParentRelation)}`, { method: 'PUT' }),
  updateConnectionChildRelation: (userId, databaseName, parentTable, childTable, newChildRelation) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection/childrelation?parentTable=${encodeURIComponent(parentTable)}&childTable=${encodeURIComponent(childTable)}&newChildRelation=${encodeURIComponent(newChildRelation)}`, { method: 'PUT' }),
  deleteConnectionByTables: (userId, databaseName, parentTable, childTable) => request(`/User/${encodeURIComponent(userId)}/database/${encodeURIComponent(databaseName)}/connection?parentTable=${encodeURIComponent(parentTable)}&childTable=${encodeURIComponent(childTable)}`, { method: 'DELETE' }),
  generateBackend: async (userId, apiName = '', databaseType = '') => {
    const cleanedApiName = String(apiName || '').trim();
    const cleanedDatabaseType = String(databaseType || '').trim();
    const payload = {
      apiName: cleanedApiName,
      projectName: cleanedApiName,
      databaseType: cleanedDatabaseType,
    };

    const response = await client.post(
      `/User/${encodeURIComponent(userId)}/generate-backend`,
      payload,
      {
        responseType: 'blob',
        params: payload,
        headers: {
          Accept: 'application/zip, application/octet-stream',
        },
      }
    );

    const contentType = response.headers?.['content-type'] || 'application/zip';
    const blob = response.data;

    if (blob && typeof blob !== 'string' && typeof blob.arrayBuffer === 'function' && !contentType.includes('application/json')) {
      const safeProjectName = (cleanedApiName || 'backend')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'backend';

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${safeProjectName}.zip`;

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 5000);
    }

    return response;
  },
};

export { API_BASE_URL, backendApi };
