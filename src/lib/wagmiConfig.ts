import { baseSepolia } from 'wagmi/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import {
  createWeb3Modal,
} from '@web3modal/wagmi/react'

const projectId = '785529b6460bbec6178a74f48c0c9b05'

const wagmiConfig = defaultWagmiConfig({
  chains: [baseSepolia],
  projectId,
  metadata: {
    name: 'dephy conduits interface',
    description: '',
    url: '',
    icons: []
  }
})

createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'dark',
})

export { wagmiConfig }

