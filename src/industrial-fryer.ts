import type { Item } from './game';
// Shaded local vector art based on a commercial twin-vat fryer, adapted to the game's front/top view.
export function industrialFryer(item: Exclude<Item,'drink'>) {
 const id=`commercial-${item}`;
 const chicken=item==='chicken';
 const food=(x:number,y:number)=>chicken?`<g transform="translate(${x} ${y})" fill="#d99837" stroke="#9e6227" stroke-width="1.2"><path d="M-19 2Q-24 -11 -11 -16Q-3 -18 1 -8Q14 -12 18 -1Q17 11 3 12Q-9 14 -19 2Z"/><path d="M-12 -8L-7 -11M0 1L5 -2M-9 5L-5 2" fill="none" stroke="#f0c06c"/></g>`:`<g transform="translate(${x} ${y})" fill="#f3c957" stroke="#b98428" stroke-width="1">${Array.from({length:10},(_,n)=>`<path d="M${-21+n*4} 9l${n%2?'-6':'3'} -25 4 -1 ${n%2?'6':'-3'} 25Z"/>`).join('')}</g>`;
 return `<svg class="equipment-art industrial-fryer" viewBox="0 0 320 260" preserveAspectRatio="none" aria-hidden="true"><defs>
 <linearGradient id="${id}-steel" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#eef2ef"/><stop offset=".28" stop-color="#acb8bd"/><stop offset=".48" stop-color="#e3e9e6"/><stop offset=".78" stop-color="#98a5ac"/><stop offset="1" stop-color="#72818a"/></linearGradient>
 <linearGradient id="${id}-hood" x2="0" y2="1"><stop stop-color="#bac5c8"/><stop offset="1" stop-color="#7a8a92"/></linearGradient>
 <linearGradient id="${id}-oil" x2="0" y2="1"><stop stop-color="#e9bd53"/><stop offset="1" stop-color="#c68a2e"/></linearGradient>
 <pattern id="${id}-mesh" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5V5" fill="none" stroke="#717c7c" stroke-width=".8"/></pattern>
 </defs>
 <ellipse cx="160" cy="255" rx="153" ry="5" fill="#36292c33"/>
 <!-- Vent risers, duct elbow and deep hood with red trim. -->
 <path d="M7 8H137Q160 8 160 29V37" fill="none" stroke="#4e5d65" stroke-width="23"/><path d="M7 6H137Q160 6 160 27V35" fill="none" stroke="url(#${id}-steel)" stroke-width="17"/>
 <path d="M119 0V15M151 12L139 25" stroke="#71818a" stroke-width="2"/><path d="M41 0V46M281 0V44" stroke="#50616b" stroke-width="6"/><path d="M40 0V44M280 0V42" stroke="#b6c2c5" stroke-width="3"/>
 <path d="M7 50L29 31H291L314 49V76H7Z" fill="url(#${id}-steel)" stroke="#5b6b73" stroke-width="2"/><path d="M29 31H291L300 44H18Z" fill="url(#${id}-hood)"/><path d="M13 53H307V68H13Z" fill="#b9c4c6"/><path d="M17 64H302" stroke="#a82835" stroke-width="5"/><path d="M13 69H307V77H13Z" fill="#586770"/>
 ${Array.from({length:17},(_,n)=>`<path d="M${31+n*15} 39l-7 10" stroke="#73838c" stroke-width="2"/>`).join('')}
 <!-- Stainless splashback and basket rail. -->
 <path d="M21 78H299V163H21Z" fill="#b5bdbb" stroke="#7d8a8c" stroke-width="2"/><path d="M27 83H293V153H27Z" fill="#ddd9c9"/><path d="M28 106H292M28 131H292M83 83V153M158 83V153M233 83V153" stroke="#c0bfae" stroke-width="1"/>
 <path d="M28 92H291" stroke="#566670" stroke-width="6"/><path d="M28 90H291" stroke="#dde5e2" stroke-width="3"/>
 <!-- Two basket cradles: a wire mesh front, food and red insulated handles. -->
 ${[79,231].map(x=>`<g><path d="M${x-47} 103L${x-37} 89H${x+41}L${x+50} 105L${x+42} 132H${x-39}Z" fill="#b7bdb2" stroke="#60727a" stroke-width="2"/><path d="M${x-37} 99H${x+37}L${x+32} 125H${x-31}Z" fill="url(#${id}-mesh)"/><g class="industrial-food">${food(x,112)}</g><path d="M${x-37} 100H${x+39}L${x+44} 129H${x-34}Z" fill="url(#${id}-mesh)" stroke="#a4afac" stroke-width="1.4"/><path d="M${x+8} 125L${x+32} 144" stroke="#4d5c64" stroke-width="5"/><path d="M${x+29} 142L${x+47} 152" stroke="#ac2936" stroke-width="8" stroke-linecap="round"/><path d="M${x-15} 91V86H${x+12}V92" fill="none" stroke="#53636d" stroke-width="2"/></g>`).join('')}
 <!-- Angled worktop with two oil vats and raised stainless rims. -->
 <path d="M8 139L27 124H299L314 142V180H8Z" fill="url(#${id}-steel)" stroke="#657680" stroke-width="2"/>
 ${[18,169].map(x=>`<path d="M${x} 151L${x+11} 138H${x+121}L${x+131} 151V177H${x}Z" fill="#596b73" stroke="#edf1e9" stroke-width="3"/><path class="oil-surface" d="M${x+7} 153L${x+17} 145H${x+116}L${x+123} 153V170H${x+7}Z" fill="url(#${id}-oil)"/><path d="M${x+16} 144H${x+118}" stroke="#fff7ca" stroke-width="1"/>`).join('')}
 <g class="industrial-food">${food(78,158)}${food(230,157)}</g>
 <g class="oil-bubbles">${Array.from({length:15},(_,n)=>`<circle class="oil-bubble" cx="${31+n*18}" cy="${154+(n%3)*5}" r="${1.4+n%3*.6}" style="--delay:${n*.09}s"/>`).join('')}</g>
 <g class="oil-ripples" fill="none" stroke="#ffeb9a" stroke-width="1.3"><ellipse cx="77" cy="159" rx="37" ry="7"/><ellipse cx="229" cy="158" rx="35" ry="7"/></g>
 <g class="steam" fill="none" stroke="#fff9df" stroke-width="2.5"><path d="M62 140Q52 129 63 118T61 99"/><path d="M96 141Q87 133 97 123"/><path d="M212 139Q201 127 212 114"/><path d="M249 140Q239 131 249 121"/></g>
 <path d="M12 179H311V239H12Z" fill="url(#${id}-steel)" stroke="#657680" stroke-width="2"/><path d="M12 181H311" stroke="#f5f5ed" stroke-width="3"/>
 <path d="M308 146L318 153V240L309 250V180Z" fill="#687a84"/>
 <!-- Front doors, dials, temperature gauge and vents. -->
 <path d="M18 186H158V235H18ZM163 186H302V235H163Z" fill="none" stroke="#96a3a7"/><path d="M73 187H100M218 187H245" stroke="#626f75" stroke-width="3"/>
 <circle cx="265" cy="211" r="13" fill="#596b75" stroke="#e6e9e3" stroke-width="2"/><circle cx="265" cy="211" r="9" fill="#f4f0d9"/><path d="M265 211l5 -5" stroke="#b33334" stroke-width="2"/>
 <circle cx="294" cy="211" r="8" fill="#48555e" stroke="#cfd7d5"/><path d="M294 211v-5" stroke="#e9e7d9" stroke-width="2"/>
 <path d="M178 220H230M178 225H230M178 230H230" stroke="#78878c" stroke-width="2"/><rect x="282" y="190" width="5" height="5" rx="1" class="fryer-power" fill="#aa3235"/>
 <path d="M11 238H311V250H11Z" fill="#ac2936"/><path d="M13 239H309" stroke="#df6666" stroke-width="2"/>
 <path d="M24 250V260H43V250M277 250V260H296V250" fill="#343e45"/>
 </svg>`;
}
