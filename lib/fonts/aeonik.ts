import localFont from 'next/font/local';

export const aeonik = localFont({
  src: [
    {
      path: '../../public/fonts/aeonik/AeonikTRIAL-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/aeonik/AeonikTRIAL-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/aeonik/AeonikTRIAL-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-aeonik',
  display: 'swap',
});
