import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import App from './App'
import './index.css'

const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected(), coinbaseWallet({ appName: 'Base NFT' })],
  transports: { [baseSepolia.id]: http('https://sepolia.base.org') },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}><App /></QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
