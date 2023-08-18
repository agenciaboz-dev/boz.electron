import React from 'react'

interface AppProps {
    
}

export const App:React.FC<AppProps> = ({  }) => {
    
    return <webview style={{height: '100vh'}} src="https://app.agenciaboz.com.br" />
}