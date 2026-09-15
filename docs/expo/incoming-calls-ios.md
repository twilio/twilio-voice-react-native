# Enabling Incoming Calls in iOS for Expo applications

Please ensure that your application invokes `voice.initializePushRegistry()` on _every_ JS runtime start/restart and _as soon as possible_ in the JS lifecycle. This method _must_ be invoked regardless of your application flow and state. Therefore, it should be invoked in the entry-point of your application (i.e. `index.tsx`), even before any rendering happens.
