# GPU-less CI follow-up

The initial GitHub run for `cbc1672`, [37781114802](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/actions/runs/37781114802), passed install, lint, type checking, 133 unit checks, audit, build and boundary inspection. Eleven browser cases passed; the full 3D test reached Nave, then timed out waiting for Forward. No graphics diagnostics were retained by that run, so the exact backend failure is not established.

`web/playwright.config.ts` now explicitly selects ANGLE/SwiftShader when `CI` is set. The software-rendering bot disables Chromium's GPU watchdog; the bounded 120-second test and 15-minute CI job limit remain unchanged. This avoids relying on the bot's automatic GPU fallback and allows slow CPU rendering to complete. The same model and assertions are used. Failure output now includes the public main-page state for diagnosis. Normal headed desktop runs retain the hardware driver.

Local verification: `CI=1 PLAYWRIGHT_CHANNEL=chrome npm run test:browser -- tests/browser/visit.spec.ts` passed all four visit cases in 37.3 seconds. This is functional software-rendering evidence, not a hardware-performance acceptance. The fixed 60-second headed M1 Pro measurement and all original performance targets remain separate and unchanged. App/model/physics code is unchanged by this follow-up.

[Chromium's SwiftShader documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md) describes the explicit ANGLE software driver for GPU-less testing. This configuration applies only to the isolated local-content CI browser; it is not a flag prescribed to parish users.
