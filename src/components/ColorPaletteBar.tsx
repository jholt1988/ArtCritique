import React, { useState } from 'react';
import { Palette, Copy, Check, Info } from 'lucide-react';
import { ExtractedColor } from '../types';

interface ColorPaletteBarProps {
  palette: ExtractedColor[];
}

export const ColorPaletteBar: React.FC<ColorPaletteBarProps> = ({ palette }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  if (!palette || palette.length === 0) return null;

  return (
    <div id="color-palette-bar-container" className="rounded-2xl bg-stone-900/60 border border-stone-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Palette className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-stone-200">
            Extracted Artwork Color Script & Gamut
          </h3>
        </div>
        <span className="text-[11px] text-stone-400 hidden sm:inline">
          Click any color chip to copy hex code
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {(palette || []).map((color, idx) => {
          const isCopied = copiedHex === color.hex;
          return (
            <div
              key={idx}
              onClick={() => copyToClipboard(color.hex)}
              className="group relative rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-400/60 p-2.5 cursor-pointer transition-all hover:bg-stone-900 flex flex-col justify-between"
            >
              {/* Color Swatch Preview */}
              <div
                style={{ backgroundColor: color.hex }}
                className="w-full h-14 rounded-lg shadow-inner border border-white/10 relative overflow-hidden flex items-end justify-end p-1.5 transition-transform group-hover:scale-[1.02]"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1 font-mono">
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-300" />
                      <span>Copy</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-100 uppercase">
                    {color.hex}
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-stone-800 text-amber-300">
                    {color.role}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-stone-300 truncate mt-0.5">
                  {color.name}
                </p>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                  {color.harmonyNotes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
