import React, { useContext, useEffect, useMemo, useState } from 'react'
import '../style/TopNave.css'
import { Appcontext } from '../context/Backend'
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PROFILE_KEY = 'backendbuilder_profile'
const defaultProfile = {
  name: 'Madhavan M',
  email: 'madhavan@example.com',
  role: 'Software Developer',
  image: '',
}

const TopNave = () => {
  const { steps, saveProgress, saveLoading, saveMessage, saveError } = useContext(Appcontext)
  const { user } = useAuth()
  const pages = ['Database', 'Tables', 'Columns', 'Connection', 'API', 'Backend']
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

  const backendProfile = useMemo(() => ({
    name: user?.name || user?.username || profile.name,
    email: user?.email || profile.email,
    image: profile.image,
  }), [user, profile])

  const initial = backendProfile.name?.charAt(0).toUpperCase() || 'M'

  return (
    
    <nav className='topnav'>

        <section className='top'>

            <div className='saveArea'>
              <button className='save' type='button' onClick={saveProgress} disabled={saveLoading}>
                <h5>{saveLoading ? 'Saving...' : 'Save Process'}</h5>
              </button>
            </div>

            {saveMessage && <span className='saveMessage' role='status'>{saveMessage}</span>}
            {saveError && <span className='saveMessage saveError' role='alert'>{saveError}</span>}

            <div className='profileInfo'>
              <div className='Email' title={backendProfile.email} aria-label={backendProfile.email}>
                <span>{initial}</span>
              </div>
            </div>

        </section>

        <main className='pages'>
            {pages.map((page, index) => {
              const pageNumber = index + 1
              const status = pageNumber < steps ? 'completed' : pageNumber === steps ? 'active' : ''

              return (
                <div className={`part ${status}`} key={page}>
                    <div className='round'><h6>{pageNumber<steps? <Check size={14}/> : `${pageNumber}`}</h6></div>
                    <h6 className='text'>{page}</h6>
                </div>
              )
            })}
        </main>

    </nav>
  )
}

export default TopNave