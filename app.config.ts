import type { ConfigContext, ExpoConfig } from 'expo/config';

// O plugin do Google Sign-In precisa do "reversed client ID" do cliente iOS
// (ex.: com.googleusercontent.apps.1234-abcd). Ele vem do .env para não ficar no código.
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }] as [string, unknown]] : []),
    ],
  };
};
