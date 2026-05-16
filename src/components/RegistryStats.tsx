interface Props {
  count: number
}

export default function RegistryStats({ count }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: '0',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '24px 0',
      marginBottom: '8px',
    }}>
      <StatItem value={String(count)} label="Guitars registered" />
      <StatItem value="22" label="Models documented" />
      <StatItem value="1998–2006" label="Production years" />
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      paddingRight: '40px',
      marginRight: '40px',
      borderRight: '1px solid rgba(255,255,255,0.08)',
    }}
    className="last:border-r-0 last:pr-0 last:mr-0"
    >
      <p style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '2rem',
        letterSpacing: '1px',
        color: '#c8a96e',
        lineHeight: 1,
      }}>
        {value}
      </p>
      <p style={{ color: '#5c5a57', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', marginTop: '4px', letterSpacing: '0.5px' }}>
        {label}
      </p>
    </div>
  )
}
