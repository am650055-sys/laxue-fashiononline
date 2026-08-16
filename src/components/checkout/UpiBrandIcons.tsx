import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * PhonePe Official Vector Icon:
 * Authentic Royal Purple (#5f259f) square with official white Devanagari "पे" glyph.
 * 44px x 44px with 10px rounded corners, subtle outer border and light drop shadow.
 */
export const PhonePeIcon: React.FC<IconProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
      className={`bg-[#5f259f] flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
      title="PhonePe UPI"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%] object-contain"
      >
        {/* Subtle white accent circle */}
        <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" />

        {/* Authentic Devanagari Pe "पे" Logo */}
        <g fill="white">
          {/* Top Matra Accent (Slanted leaf stroke with dot) */}
          <path
            d="M49 25.5C46.5 21.5 42 19 37.5 17.8C35.8 17.3 34.2 18.8 34.8 20.5C37.2 26.8 42.8 31.8 49.5 33.2C51.4 33.6 52.8 31.8 51.9 30.1C51.1 28.5 50.1 26.9 49 25.5Z"
          />
          {/* Horizontal Top Bar */}
          <rect x="29" y="32" width="44" height="6.5" rx="3.25" />
          
          {/* Main 'प' loop */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M33 34C30.8 34 29 35.8 29 38V54C29 60.6 34.4 66 41 66H48.5V59.5H41C38 59.5 35.5 57 35.5 54V38C35.5 35.8 33.7 34 33 34Z"
          />
          <path
            d="M41 40H48.5V59.5H41C38 59.5 35.5 57 35.5 54V40H41Z"
            opacity="0.1"
          />
          {/* Right vertical pillar */}
          <rect x="47" y="34" width="7" height="42" rx="3.5" />
          
          {/* Loop connect to right pillar */}
          <path
            d="M32 38V52C32 58.6 37.4 64 44 64H50V57.5H44C40.7 57.5 38 54.8 38 51.5V38H32Z"
          />
          <rect x="46" y="34" width="7.5" height="44" rx="3.75" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Google Pay (GPay) Official Vector Icon:
 * Crisp white badge with official multi-colored 4-color Google 'G' and charcoal "Pay".
 * 44px x 44px with 10px rounded corners, subtle outer border and light drop shadow.
 */
export const GPayIcon: React.FC<IconProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
      className={`bg-white flex items-center justify-center overflow-hidden shrink-0 select-none p-1 ${className}`}
      title="Google Pay"
    >
      <svg
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Google 4-Color 'G' Logo */}
        <g transform="translate(6, 19)">
          {/* Blue segment */}
          <path
            d="M17.64 19C17.64 17.68 17.52 16.41 17.3 15.18H0V22.42H9.89C9.46 24.84 8.16 26.89 6.2 28.27V33.14H12.18C15.68 29.77 17.64 24.79 17.64 19Z"
            fill="#4285F4"
          />
          {/* Green segment */}
          <path
            d="M0 37.94C4.9 37.94 9.01 36.24 12.18 33.19L6.2 28.32C4.55 29.48 2.46 30.17 0 30.17C-4.74 30.17 -8.76 26.82 -10.2 22.31H-16.36V27.32C-13.32 33.64 -7.1 37.94 0 37.94Z"
            fill="#34A853"
          />
          {/* Yellow segment */}
          <path
            d="M-10.2 22.31C-10.57 21.15 -10.77 19.9 -10.77 18.63C-10.77 17.35 -10.57 16.11 -10.2 14.94V9.93H-16.36C-17.61 12.53 -18.32 15.48 -18.32 18.63C-18.32 21.77 -17.61 24.72 -16.36 27.32L-10.2 22.31Z"
            fill="#FBBC05"
          />
          {/* Red segment */}
          <path
            d="M0 7.09C2.66 7.09 5.06 8.04 6.94 9.93L12.32 4.29C9.01 1.06 4.9 0 0 0C-7.1 0 -13.32 4.3 -16.36 10.62L-10.2 15.63C-8.76 11.12 -4.74 7.09 0 7.09Z"
            fill="#EA4335"
          />
        </g>

        {/* Charcoal "Pay" Official Typography */}
        <g fill="#3C4043">
          {/* P */}
          <path d="M37.5 24.5H43.8C46.8 24.5 49.2 26.8 49.2 29.8C49.2 32.8 46.8 35.1 43.8 35.1H40.5V44.5H37.5V24.5ZM40.5 32.3H43.6C45.2 32.3 46.2 31.2 46.2 29.8C46.2 28.4 45.2 27.3 43.6 27.3H40.5V32.3Z" />
          {/* a */}
          <path d="M55.8 34.6C57.8 34.6 59.4 35.6 60.2 37.1V35H63V44.5H60.2V42.6C59.3 44.1 57.7 45 55.8 45C52.8 45 50.4 42.5 50.4 39.4C50.4 36.3 52.8 34.6 55.8 34.6ZM56.7 42.4C58.6 42.4 60.3 40.9 60.3 39.3C60.3 37.6 58.6 36.1 56.7 36.1C54.8 36.1 53.4 37.6 53.4 39.3C53.4 40.9 54.8 42.4 56.7 42.4Z" />
          {/* y */}
          <path d="M65.2 35H68.1L71.5 43.5L74.8 35H77.8L72.5 47.3C71.4 49.8 69.7 50.8 67.6 50.8C66.9 50.8 66.1 50.7 65.5 50.4V47.9C65.9 48 66.5 48.1 67 48.1C68.1 48.1 68.9 47.5 69.4 46.2L69.9 45L65.2 35Z" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Paytm Official Vector Icon:
 * Crisp white badge with official dark navy "pay" and bright cyan "tm".
 * 44px x 44px with 10px rounded corners, subtle outer border and light drop shadow.
 */
export const PaytmIcon: React.FC<IconProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
      className={`bg-white flex items-center justify-center overflow-hidden shrink-0 select-none p-1 ${className}`}
      title="Paytm UPI"
    >
      <svg
        viewBox="0 0 106 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[94%] h-[94%] object-contain"
      >
        {/* Navy Blue "pay" */}
        <g fill="#002E6E">
          {/* p */}
          <path d="M6 10H14.8C18.8 10 21.8 13 21.8 16.8C21.8 20.6 18.8 23.6 14.8 23.6H10.8V36.5H6V10ZM10.8 19.5H14.5C16 19.5 17.1 18.3 17.1 16.8C17.1 15.3 16 14.1 14.5 14.1H10.8V19.5Z" />
          {/* a */}
          <path d="M30 18C34 18 36.8 19.9 37.8 22V18.6H42.2V36.5H37.8V33.2C36.7 35.3 33.9 37.1 30 37.1C25.4 37.1 22 33.5 22 27.5C22 21.5 25.5 18 30 18ZM32.2 33C35.2 33 37.6 30.6 37.6 27.5C37.6 24.5 35.2 22.1 32.2 22.1C29.3 22.1 26.9 24.5 26.9 27.5C26.9 30.6 29.3 33 32.2 33Z" />
          {/* y */}
          <path d="M44.5 18.6H49.2L53.1 30L57 18.6H61.6L55.8 34.3C54 39.2 51.3 41.8 47.4 41.8C46 41.8 44.5 41.4 43.4 41V36.8C44.3 37.1 45.2 37.3 46.2 37.3C48.1 37.3 49.6 35.9 50.4 33.7L51.3 31.5L44.5 18.6Z" />
        </g>

        {/* Bright Cyan "tm" */}
        <g fill="#00BAF2">
          {/* t */}
          <path d="M65.5 12V18.6H62.2V22.2H65.5V32C65.5 35.1 67.4 36.7 71 36.7C72.4 36.7 73.8 36.4 74.8 35.8V32C74 32.3 73.1 32.5 72.3 32.5C70.8 32.5 70 31.6 70 30.2V22.2H75V18.6H70V12H65.5Z" />
          {/* m */}
          <path d="M77.5 18.6H82V21.7C83 19.6 85.2 18 88 18C90.6 18 92.7 19.6 93.6 22C94.8 19.6 97.1 18 100 18C104.4 18 106.2 21.2 106.2 25.8V36.5H101.8V26.5C101.8 23.7 100.8 22.1 98.4 22.1C96 22.1 94.5 24 94.5 26.8V36.5H90.1V26.5C90.1 23.7 89.1 22.1 86.7 22.1C84.3 22.1 82.8 24 82.8 26.8V36.5H77.5V18.6Z" />
        </g>
      </svg>
    </div>
  );
};

/**
 * BHIM UPI Official Vector Badge:
 * Official silver/white badge with authentic dual-triangle saffron & green logo
 * and "GOVT NPCI OFFICIAL" compliance branding.
 * 44px x 44px with 10px rounded corners, subtle outer border and light drop shadow.
 */
export const BhimUpiIcon: React.FC<IconProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
      className={`bg-gradient-to-b from-white to-[#F8FAF9] flex items-center justify-center overflow-hidden shrink-0 select-none p-1 relative ${className}`}
      title="BHIM UPI (Govt NPCI Official)"
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Authentic BHIM Geometric Dual-Triangle Diamond Motif */}
        <g transform="translate(20, 6)">
          {/* Saffron / Orange upper triangle */}
          <path d="M20 0L40 24H0L20 0Z" fill="#F47920" />
          {/* Green lower triangle */}
          <path d="M20 40L40 16H0L20 40Z" fill="#00875A" />
          {/* Center inner negative chevron */}
          <path d="M20 12L29 21H11L20 12Z" fill="white" />
          <path d="M20 28L29 19H11L20 28Z" fill="white" />
        </g>

        {/* Bold BHIM Wordmark */}
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fill="#1C2D42"
          fontSize="13.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          letterSpacing="0.8px"
        >
          BHIM
        </text>

        {/* UPI Green Pill Badge */}
        <rect x="23" y="60" width="34" height="11" rx="3.5" fill="#00875A" />
        <text
          x="40"
          y="68.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="8.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          letterSpacing="1px"
        >
          UPI
        </text>
      </svg>
    </div>
  );
};

/**
 * Other UPI Apps Stacked Collage Icon:
 * Neat stacked collage icon displaying mini official logos of CRED, Amazon Pay, and WhatsApp Pay.
 * 44px x 44px with 10px rounded corners, subtle outer border and light drop shadow.
 */
export const OtherUpiCollageIcon: React.FC<IconProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '10px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      }}
      className={`bg-[#FAF7F2] flex items-center justify-center overflow-hidden shrink-0 select-none p-1 relative ${className}`}
      title="Other UPI Apps (CRED, Amazon Pay, WhatsApp Pay)"
    >
      <div className="w-full h-full relative grid grid-cols-2 grid-rows-2 gap-1 p-0.5">
        {/* 1. CRED Mini Icon (Black Badge with White Geometric Crest) */}
        <div
          className="bg-[#121212] rounded-[4px] flex items-center justify-center shadow-2xs border border-neutral-700 p-0.5"
          title="CRED"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
            <path
              d="M12 2L4 5V11C4 16.5 7.4 21.7 12 23C16.6 21.7 20 16.5 20 11V5L12 2Z"
              fill="#FFFFFF"
            />
            <path
              d="M12 6L7 8V11.5C7 15 9.1 18.2 12 19C14.9 18.2 17 15 17 11.5V8L12 6Z"
              fill="#121212"
            />
            <circle cx="12" cy="12.5" r="2" fill="#FFFFFF" />
          </svg>
        </div>

        {/* 2. Amazon Pay Mini Icon (Dark Navy with Amazon Smile Arrow) */}
        <div
          className="bg-[#232F3E] rounded-[4px] flex items-center justify-center shadow-2xs border border-neutral-600 p-0.5"
          title="Amazon Pay"
        >
          <svg viewBox="0 0 32 32" fill="none" className="w-4 h-4">
            <text
              x="4"
              y="15"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              a
            </text>
            <path
              d="M6 20C12 24.5 18 24 24 19.5"
              stroke="#FF9900"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M21 17.5L25 19.5L23 23"
              stroke="#FF9900"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 3. WhatsApp Pay Mini Icon (Bright Green with ₹ symbol / Chat Bubble) */}
        <div
          className="bg-[#25D366] rounded-[4px] flex items-center justify-center shadow-2xs border border-emerald-400 p-0.5"
          title="WhatsApp Pay"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path
              d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.4 17L2 22L7.2 20.6C8.6 21.5 10.3 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z"
              fill="#FFFFFF"
            />
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#25D366"
              fontSize="10"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              ₹
            </text>
          </svg>
        </div>

        {/* 4. More (+) Pill Badge */}
        <div
          className="bg-[#FAF3E0] rounded-[4px] flex items-center justify-center border border-[#D4AF37]/50 text-[#801723] font-bold text-[8.5px] shadow-2xs tracking-tighter"
          title="More UPI Apps"
        >
          +UPI
        </div>
      </div>
    </div>
  );
};

/**
 * Universal Brand Icon Dispatcher
 */
export const UpiBrandIcon: React.FC<{
  type: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'other';
  size?: number;
  className?: string;
}> = ({ type, size = 44, className = '' }) => {
  switch (type) {
    case 'phonepe':
      return <PhonePeIcon size={size} className={className} />;
    case 'gpay':
      return <GPayIcon size={size} className={className} />;
    case 'paytm':
      return <PaytmIcon size={size} className={className} />;
    case 'bhim':
      return <BhimUpiIcon size={size} className={className} />;
    case 'other':
    default:
      return <OtherUpiCollageIcon size={size} className={className} />;
  }
};
