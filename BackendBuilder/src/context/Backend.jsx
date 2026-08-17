import React, { createContext, useState } from 'react'

const Appcontext = createContext();

const Backend = ({ children }) => {
    const [LoginStatus, setLoginStatus] = useState(false);

    return (
        <Appcontext.Provider value={{ LoginStatus, setLoginStatus }}>
            {children}
        </Appcontext.Provider>
    )
}

export { Appcontext }
export default Backend