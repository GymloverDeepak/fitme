// Website settings. Everything here is PUBLIC (it is shipped to the browser) — never put secrets here.
//
// APK download: set these as environment variables (Vercel → Project → Settings → Environment Variables,
// or a local .env file — see .env.example). Until VITE_APK_URL is set to a real https:// link, the
// download button stays disabled and shows "APK coming soon".

function readEnv(name) {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function httpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

const rawApkUrl = readEnv('VITE_APK_URL');

export const APK = {
  url: httpsUrl(rawApkUrl),
  // Only shown when provided — use the values from the real, verified APK file.
  version: readEnv('VITE_APK_VERSION'),
  size: readEnv('VITE_APK_SIZE'),
  invalidUrl: rawApkUrl !== null && httpsUrl(rawApkUrl) === null,
};

export const DEVELOPER = {
  name: 'Gymlover Deepak',
  email: 'gymlover7010@gmail.com',
};

export const SOCIAL_LINKS = [
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com/@gymloverdeepak7010?si=bi2kRaCxmCFrGw59' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/i_gymlover_deepak?exln=MXNzNXJuOXJuY2g5NQ==' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/share/19r6xUEVWq/' },
  { id: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/919812087010' },
];
