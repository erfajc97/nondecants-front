import { useShipmentTrackerHook } from '../hooks/useShipmentTrackerHook';
import { SEARCH_OPTIONS, SEARCH_PLACEHOLDERS } from '../data';

export default function ShipmentTracker() {
  const { searchType, setSearchType, trackingNumber, setTrackingNumber, handleSubmit } =
    useShipmentTrackerHook();

  return (
    <div className="rounded-md border border-border bg-surface p-6 sm:p-10">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-6 text-center">

        {/* Servientrega logo */}
        <img
          src="/servientrega.png"
          alt="Servientrega"
          className="h-20 sm:h-24 object-contain"
        />

        {/* Title */}
        <h2 className="font-display text-3xl leading-tight text-text sm:text-4xl">
          Rastrea la ubicación de tu envío
        </h2>

        {/* Radio buttons */}
        <div className="flex items-center gap-6">
          {SEARCH_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setSearchType(opt.value)}
            >
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                  searchType === opt.value ? 'border-text' : 'border-text-muted',
                ].join(' ')}
              >
                {searchType === opt.value && (
                  <span className="h-3 w-3 rounded-full bg-text" />
                )}
              </span>
              <span className="font-body text-base font-semibold text-text">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Input */}
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={SEARCH_PLACEHOLDERS[searchType]}
          className="h-14 w-full rounded-md border-2 border-border bg-surface px-3.5 font-body text-[17px] text-text transition-colors placeholder:text-text-muted focus:border-text focus:outline-none"
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="h-[52px] w-full rounded-sm bg-text font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft"
        >
          Consultar
        </button>
      </div>
    </div>
  );
}
