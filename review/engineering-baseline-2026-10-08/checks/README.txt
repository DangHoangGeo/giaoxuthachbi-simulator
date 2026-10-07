Approved engineering phase01 baseline check capture
Repository HEAD: daadc10210842418eddeba68099f321236c4e96b
Repository tree: 7effb1c4bf454018a0fdc373e4b79247d9b55a8b
Runtime: v22.22.2; Python 3.13.4; macOS-26.5.1-arm64-arm-64bit-Mach-O

Checks:
- `node scripts/verify_model.cjs`: exit 0 in 29.128971 s; raw log `logs/verify-model.log`.
- `node scripts/verify_estimates.cjs`: exit 0 in 0.162957 s; raw log `logs/verify-estimates.log`.
- `node scripts/verify_simulator.cjs --report --estimates`: exit 0 in 98.938782 s; raw log `logs/audit-report-1.log`.
- `node scripts/verify_simulator.cjs --report --estimates`: exit 0 in 100.054818 s; raw log `logs/audit-report-2.log`.
- `node scripts/verify_simulator.cjs`: exit 1 in 97.736657 s; raw log `logs/verify-simulator-strict.log`.
- `node scripts/verify_simulator.cjs --electrical`: exit 0 in 26.292112 s; raw log `logs/verify-electrical.log`.
- `python3 docs/beams-roof-connections/validate.py`: exit 0 in 0.098891 s; raw log `logs/validate-timber-package.log`.
- The strict simulator check exited 1 at the expected `No design warnings` gate: ambo microphone margin 1.2 dB and altar microphone margin 1.7 dB.
- Both calculation audits exited 0 and matched across all eight emitted JSON objects. The comparison ignores runtime fields (`buildMs`, `runtimeMs`, `elapsedMs`, `durationMs`) and timestamp-named keys; emitted numeric values use exact equality (tolerance 0).
- Audit target misses remain: microphone warning gate; wing STI minimum 0.439 against 0.45 (average 0.510 against 0.50); speech clarity reports 67% of seats at STI ≥ 0.60 against the stated every-seat target; ventilation estimate is about 3.5 ACH against the stated 4–6 comfort target; minimum seat illuminance is 197 lx although 98.9% reach 200 lx and the aggregate 95% target passes.
- Geometry, independent estimates, electrical routing, and timber package checks passed. Timber validation checks package consistency and does not verify structural capacity.
- Source hashes stayed stable during this run. The simulator remains a design-development tool; these software checks are not construction approval.

Files:
- `summary.json`: command, environment, source hashes, exact exit codes, runtimes, log hashes, comparison method, and concise audit result.
- `audit-report-1.json` and `audit-report-2.json`: complete parsed JSON outputs from the repeated audit runs.
- `logs/`: unmodified stdout/stderr output for each command.
- `run_checks.py`: the bounded capture runner; it writes only under this directory.
