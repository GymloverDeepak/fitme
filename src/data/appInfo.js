import appConfig from '../../app.json';

// Version and name come from app.json so they never drift out of sync.
export const APP_NAME = appConfig.expo.name;
export const APP_VERSION = appConfig.expo.version;
export const ANDROID_VERSION_CODE = appConfig.expo.android?.versionCode ?? 1;

export const DEVELOPER = {
  creditLine: 'Designed & Developed by',
  name: 'Gymlover Deepak',
  email: 'gymlover7010@gmail.com',
  phone: '9812087010',
};

// Edit social profile links here. Shown as icons in AppFooter (Home and About screens).
// WhatsApp uses click-to-chat with India's country code: 91 + 9812087010.
export const SOCIAL_LINKS = [
  {
    id: 'youtube',
    icon: 'logo-youtube',
    label: 'Open YouTube',
    url: 'https://youtube.com/@gymloverdeepak7010?si=bi2kRaCxmCFrGw59',
  },
  {
    id: 'instagram',
    icon: 'logo-instagram',
    label: 'Open Instagram',
    url: 'https://www.instagram.com/i_gymlover_deepak?exln=MXNzNXJuOXJuY2g5NQ==',
  },
  {
    id: 'facebook',
    icon: 'logo-facebook',
    label: 'Open Facebook',
    url: 'https://www.facebook.com/share/19r6xUEVWq/',
  },
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    label: 'Chat on WhatsApp',
    url: 'https://wa.me/919812087010',
  },
];
