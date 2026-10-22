// Lets Node run the app's plain-JS modules (which import './file' without '.js', as Metro allows).
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
      if (isRelative && !specifier.endsWith('.js')) return nextResolve(`${specifier}.js`, context);
      throw error;
    }
  },
});
