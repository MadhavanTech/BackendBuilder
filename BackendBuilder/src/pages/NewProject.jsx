import React, { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Home from './Home'
import { Appcontext } from '../context/Backend'

const NewProject = () => {
	const location = useLocation()
	const {
		setActiveDatabase,
		setDatabases,
		setCurrentUser,
		setTables,
		setTableNames,
		setNumberofTables,
		setConnections,
		setPendingConnection,
		setApiConfig,
		setApiName,
		setAuthMethod,
		setSteps
	} = useContext(Appcontext)

	useEffect(() => {
		if (location.pathname !== '/app/new-project') return

		setActiveDatabase(null)
		setDatabases([])
		setTables([])
		setTableNames([])
		setNumberofTables(0)
		setConnections([])
		setPendingConnection(null)
		setApiConfig({})
		setApiName('')
		setAuthMethod('JWT Authentication')
		setSteps(1)
		setCurrentUser((previousUser) => {
			const baseUser = previousUser || {}
			return {
				...baseUser,
				id: baseUser.id || null,
				userId: baseUser.userId || null,
				userID: baseUser.userID || null,
				user_id: baseUser.user_id || null,
				databases: [],
			}
		})

		try {
			const persistedUser = JSON.parse(localStorage.getItem('backendbuilder_local_user_state') || 'null') || {}
			const resetStorageUser = {
				...persistedUser,
				id: persistedUser.id || null,
				userId: persistedUser.userId || null,
				userID: persistedUser.userID || null,
				user_id: persistedUser.user_id || null,
				databases: [],
			}
			localStorage.setItem('backendbuilder_local_user_state', JSON.stringify(resetStorageUser))
		} catch (error) {
			console.warn('Unable to clear saved project state:', error)
		}
	}, [location.pathname, setActiveDatabase, setDatabases, setCurrentUser, setTables, setTableNames, setNumberofTables, setConnections, setPendingConnection, setApiConfig, setApiName, setAuthMethod, setSteps])

	return <Home />
}

export default NewProject
