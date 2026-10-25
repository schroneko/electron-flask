# Electron and backend validation (2026-10-25)

Current main still has seven open Electron advisories. Electron is updated from41.10.7 to42.11.18. The only request-promise call was local backend readiness polling; it now uses built-in fetch with HTTP-status rejection, response consumption, bounded timeout and the same retry behavior. This removes the vulnerable request/form-data/qs/tough-cookie/UUID dependency chain. The development setuptools pin is updated to84.2.1.

The npm lockfile is now tracked to preserve the audited graph and make clean installs reproducible. Clean npm ci, two tests executing the actual main-process startup code with mocked Electron/process boundaries, and npm audit passed (zero vulnerabilities). Fresh Python3.11.15 runtime/development installation, pip check and pip-audit passed (zero vulnerabilities). Actual Flask initialization and full synthetic EEG-to-Word generation passed. The repository's Python packaging entry point built a real executable, which served its bundled templates on localhost. Native Mac arm64 Electron42.11.18 packaged successfully with signing and publication disabled.

No real clinical data, external service credentials, GUI launch, signing/notarization or Windows packaging were exercised. Hosted application CI at the final head and default-branch alert closure remain separate checks. No merge or deployment was performed.
