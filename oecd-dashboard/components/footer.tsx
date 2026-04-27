import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24 bg-paper">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-[13px] text-[var(--muted)]">
        <div className="md:col-span-2 space-y-2">
          <div className="font-serif text-[16px] text-ink">OECD Philanthropy Atlas</div>
          <p className="leading-relaxed max-w-md">
            An interactive explorer of global philanthropic funding, built on the OECD&rsquo;s
            standardised dataset of foundation grants. All amounts in USD millions, deflated
            to 2023 constant prices.
          </p>
        </div>
        <div className="space-y-1">
          <div className="text-ink mb-1">Built for</div>
          <p>Spring 2026 Case Competition</p>
          <p>DSS. DataGood. Open Project</p>
          <p>Product Track</p>
        </div>
        <div className="space-y-1">
          <div className="text-ink mb-1">Method</div>
          <p>
            <Link href="/methodology" className="underline-offset-2 hover:underline">
              How the data is processed →
            </Link>
          </p>
          <p>OECD CRS sectoral coding</p>
          <p>2020 to 2023. 116k grants</p>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 py-4 text-[11px] text-[var(--subtle)] font-mono uppercase tracking-wider flex justify-between">
          <span>Data: OECD philanthropy database</span>
          <span>Built by Ayah. Maxime. Jenny</span>
        </div>
      </div>
    </footer>
  );
}
