export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-gray-500 dark:text-gray-400 space-y-2">
        <p>
          Fuel price data sourced from{' '}
          <a
            href="https://www.fuelwatch.wa.gov.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            FuelWatch
          </a>
          , Department of Energy, Mines, Industry Regulation and Safety,
          Government of Western Australia. Data has been adapted and reformatted
          from the original source. Licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Creative Commons Attribution 4.0 International (CC&nbsp;BY&nbsp;4.0)
          </a>
          .
        </p>
        <p>
          This application is not affiliated with or endorsed by the Government
          of Western Australia or FuelWatch. Fuel prices shown are for
          informational purposes only and may not reflect current prices at the
          pump.
        </p>
      </div>
    </footer>
  )
}
