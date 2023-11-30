import Image from 'next/image'
import AssetPrice from './components/AssetPrice'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-10">
      <Image src="/flare-logo.svg" alt="Flare Logo" width={300} height={125} />

      <div className='flex gap-4 flex-wrap flex-col'>
        <AssetPrice symbol='FLR' />
        <AssetPrice symbol='BTC' />
        <AssetPrice symbol='ETH' />
        <AssetPrice symbol='USDC' />
        <AssetPrice symbol='USDT' />
        <AssetPrice symbol='XRP' />
        <AssetPrice symbol='MATIC' />
      </div>
    </main>
  )
}
