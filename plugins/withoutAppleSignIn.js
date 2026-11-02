// Remove a permissão "Sign in with Apple" do app iOS.
// Usado no build para conta Apple gratuita (Personal Team), que não aceita essa permissão.
// O pacote expo-apple-authentication adiciona a permissão automaticamente; este plugin a retira.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutAppleSignIn(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['com.apple.developer.applesignin'];
    return cfg;
  });
};
