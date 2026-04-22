import { Platform } from 'react-native';
import { FONT_FAMILY } from 'constants/assets/fonts';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

/**
 * Get scaled font size matching Typography component
 */
export const getScaledFontSize = (baseSize: number): number => {
  const scaleFactor = Platform.OS === 'android' ? 0.72 : 0.85;
  return Math.round(baseSize * scaleFactor);
};

/**
 * Generate HTML content for WebView with app styling
 */
export const generateWebViewHTML = (content: string): string => {
  const bodyFontSize = getScaledFontSize(FontSize.Medium);
  const h1FontSize = getScaledFontSize(FontSize.ExtraLarge);
  const h2FontSize = getScaledFontSize(FontSize.Large);
  const h3FontSize = getScaledFontSize(FontSize.MediumLarge);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          body {
            font-family: '${FONT_FAMILY.POPPINS.REGULAR}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: ${bodyFontSize}px;
            line-height: 1.5;
            color: ${COLORS.TEXT};
            padding: 20px;
            margin: 0;
            background-color: ${COLORS.BACKGROUND};
            -webkit-text-size-adjust: 100%;
          }
          p {
            margin-bottom: 16px;
            margin-top: 0;
            line-height: 1.5;
          }
          h1 {
            font-family: '${FONT_FAMILY.POPPINS.BOLD}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${h1FontSize}px;
            font-weight: bold;
            margin-top: 24px;
            margin-bottom: 16px;
            color: ${COLORS.PRIMARY};
            line-height: 1.4;
          }
          h2 {
            font-family: '${FONT_FAMILY.POPPINS.BOLD}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${h2FontSize}px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 12px;
            color: ${COLORS.PRIMARY};
            line-height: 1.4;
          }
          h3, h4, h5, h6 {
            font-family: '${FONT_FAMILY.POPPINS.SEMIBOLD}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${h3FontSize}px;
            font-weight: 600;
            margin-top: 18px;
            margin-bottom: 10px;
            color: ${COLORS.PRIMARY};
            line-height: 1.4;
          }
          ul, ol {
            margin-bottom: 16px;
            margin-top: 0;
            padding-left: 24px;
            line-height: 1.6;
          }
          li {
            margin-bottom: 10px;
            line-height: 1.5;
          }
          a {
            color: ${COLORS.PRIMARY};
            text-decoration: none;
          }
          a:active {
            opacity: 0.8;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
          }
          strong, b {
            font-family: '${FONT_FAMILY.POPPINS.BOLD}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: bold;
          }
          em, i {
            font-style: italic;
          }
          blockquote {
            border-left: 3px solid ${COLORS.PRIMARY};
            padding-left: 16px;
            margin: 16px 0;
            color: ${COLORS.TEXT};
            font-style: italic;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};
