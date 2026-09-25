import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FolderPlus, Folder, LayoutGrid, Settings, FileText, HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../style/Nave.css'

const PROFILE_KEY = 'backendbuilder_profile'
const defaultProfile = {
  name: 'Madhavan M',
  email: 'madhavan@example.com',
  role: 'Software Developer',
  image: '',
}

const Navebare = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const linkClass = ({ isActive }) => isActive ? 'active' : ''
  const [profile, setProfile] = useState(defaultProfile)

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem(PROFILE_KEY)

      if (!savedProfile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile))
        setProfile(defaultProfile)
        return
      }

      try {
        const parsed = JSON.parse(savedProfile)
        setProfile({ ...defaultProfile, ...parsed })
      } catch (error) {
        console.error('Unable to load saved profile:', error)
      }
    }

    loadProfile()

    const handleProfileUpdate = () => loadProfile()
    window.addEventListener('backendbuilder-profile-updated', handleProfileUpdate)

    return () => {
      window.removeEventListener('backendbuilder-profile-updated', handleProfileUpdate)
    }
  }, [])

  const initials = profile.name
    ?.split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MM'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (

    <nav>

        <section className='icon'>

           
           <div className='profileInfo' title={profile.email} aria-label={profile.email}>
            <div className='Email'>
              {profile.image ? (
                <img src={profile.image} alt='Profile' />
              ) : (
                <span>{initials}</span>
              )}
            </div>
           </div>
            
            <h2>BackendBuilder</h2>

        </section>

       <section className='options1'>

         <ul>
            
            <li><NavLink className={linkClass} to="/app/dashboard"> <Home size={25}/> Dashboard</NavLink></li>
            <li><NavLink className={linkClass} to="/app/new-project"> <FolderPlus size={25} /> New Project</NavLink></li>
            <li><NavLink className={linkClass} to="/app/projects"><Folder size={25}/> Projects</NavLink></li>
            <li><NavLink className={linkClass} to="/app/templates"><LayoutGrid size={25}/> Templates</NavLink></li>

        </ul>
       </section>

       <section id='boder' className='options1'>
        <ul>
            <li><NavLink className={linkClass} to="/app/settings"><Settings size={25}/> Settings</NavLink></li>
            <li><NavLink className={linkClass} to="/app/docs"> <FileText size={25}/> Docs</NavLink></li>
            <li><NavLink className={linkClass} to="/app/support"> <HelpCircle size={25}/> Support</NavLink></li>
            <li className='logoutItem'><button className='logoutNavButton' type='button' onClick={handleLogout}><LogOut size={25}/> Logout</button></li>
        </ul>
       </section>

    </nav>
  )
}

export default Navebare