import { useAccount, useConnect, useDisconnect,
         useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { parseEther, formatEther } from 'viem'

const ADDR = import.meta.env.VITE_CONTRACT_ADDRESS
const ABI = [
  {name:'nextTokenId',type:'function',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}]},
  {name:'maxSupply',  type:'function',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}]},
  {name:'mintPrice',  type:'function',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}]},
  {name:'balanceOf',  type:'function',stateMutability:'view',inputs:[{name:'owner',type:'address'}],outputs:[{type:'uint256'}]},
  {name:'mint',       type:'function',stateMutability:'payable',inputs:[],outputs:[]},
]

function read(fn, args=[]) {
  return useReadContract({ address: ADDR, abi: ABI, functionName: fn, args, chainId: baseSepolia.id, watch: true })
}

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const { data: minted }    = read('nextTokenId')
  const { data: maxSupply } = read('maxSupply')
  const { data: price }     = read('mintPrice')
  const { data: balance }   = read('balanceOf', [address ?? '0x0000000000000000000000000000000000000000'])

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash })

  const handleMint = () => writeContract({
    address: ADDR, abi: ABI, functionName: 'mint',
    value: price ?? 0n, chainId: baseSepolia.id,
  })

  if (!isConnected) return (
    <div style={{textAlign:'center'}}>
      <p style={{fontSize:48,marginBottom:8}}>🎨</p>
      <h1 style={{fontWeight:800,marginBottom:6}}>Base NFT</h1>
      <p style={{color:'#888',marginBottom:24}}>Connect wallet to mint</p>
      {connectors.map(c => (
        <button key={c.id} onClick={() => connect({connector:c})}
          style={{background:'#0052FF',color:'#fff',margin:4}}>{c.name}</button>
      ))}
    </div>
  )

  const pct = minted && maxSupply ? Number((minted * 100n) / maxSupply) : 0

  return (
    <div style={{textAlign:'center',maxWidth:360}}>
      <p style={{fontSize:40,marginBottom:4}}>🎨</p>
      <h1 style={{fontWeight:800,marginBottom:2}}>Base NFT</h1>
      <p style={{color:'#888',fontSize:13,marginBottom:28}}>
        {address?.slice(0,6)}…{address?.slice(-4)}&nbsp;·&nbsp;
        <button onClick={() => disconnect()}
          style={{background:'none',color:'#888',padding:0,fontSize:13,fontWeight:400}}>disconnect</button>
      </p>

      <div style={{background:'#111',borderRadius:12,padding:20,marginBottom:20}}>
        <div style={{fontSize:28,fontWeight:800,marginBottom:4}}>
          {minted?.toString() ?? '—'} / {maxSupply?.toString() ?? '—'}
        </div>
        <div style={{background:'#222',borderRadius:4,height:6,overflow:'hidden'}}>
          <div style={{background:'#0052FF',width:`${pct}%`,height:'100%',transition:'width .3s'}}/>
        </div>
        <p style={{color:'#888',fontSize:13,marginTop:8}}>
          {price !== undefined ? `${formatEther(price)} ETH` : '—'} per mint
          &nbsp;·&nbsp; you own: {balance?.toString() ?? 0}
        </p>
      </div>

      <button onClick={handleMint} disabled={isPending || confirming}
        style={{width:'100%',background:'#0052FF',color:'#fff',fontSize:18,padding:'14px'}}>
        {isPending ? 'Confirm…' : confirming ? 'Minting…' : 'Mint NFT'}
      </button>

      {txHash && (
        <p style={{marginTop:12,fontSize:12,color:'#666'}}>
          <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer"
             style={{color:'#0052FF'}}>View on Basescan ↗</a>
        </p>
      )}
    </div>
  )
}
