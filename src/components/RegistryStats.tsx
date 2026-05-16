interface Props {
  count: number
}

export default function RegistryStats({ count }: Props) {
  return (
    <div className="flex gap-6 border-y border-zinc-800 py-6">
      <div>
        <p className="text-3xl font-bold text-white font-mono">{count}</p>
        <p className="text-zinc-500 text-sm mt-1">Guitars registered</p>
      </div>
      <div className="border-l border-zinc-800 pl-6">
        <p className="text-3xl font-bold text-white font-mono">21</p>
        <p className="text-zinc-500 text-sm mt-1">Models documented</p>
      </div>
      <div className="border-l border-zinc-800 pl-6">
        <p className="text-3xl font-bold text-white font-mono">1998–2006</p>
        <p className="text-zinc-500 text-sm mt-1">Production years</p>
      </div>
    </div>
  )
}
