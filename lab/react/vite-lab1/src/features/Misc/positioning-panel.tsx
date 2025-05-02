export function PositioningPanel() {
  return (
    <div className="h-screen p-8 bg-gray-200">
      {/* Relative wrapper to contain positioning */}
      <div className="relative bg-amber-300 p-2">
        {/* div1 */}
        <div className="bg-blue-300 p-8 text-white">
          <h2 className="text-xl font-bold">Div 1</h2>
          <p>This is the top section.</p>
        </div>

        {/* div2 */}
        <div className="bg-green-300 p-8 mt-8 text-white">
          <h2 className="text-xl font-bold">Div 2</h2>
          <p>This is the bottom section with an overlapping button.</p>

          {/* Overlapping Button */}
          <button className="absolute left- top- bg-red-600 text-white px-4 py-3 rounded shadow-lg">
            Overlapping Button
          </button>
        </div>
      </div>
    </div>
  );
}
