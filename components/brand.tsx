import Image from 'next/image';

/** Wordmark shared by the member app shell and the public landing page. */
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <Image className="brand-symbol" src="/logo.png" alt="" width={591} height={548} sizes="44px" />
      <span className="brand-type">beauty<span>KENDARI</span></span>
    </span>
  );
}
