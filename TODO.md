# Personal TODO

## Homebridge TESmart Plugin - Publication

**Project**: `/Users/hammer/Code/homebridge-tesmart`

### Before Publishing to npm

- [ ] Install dependencies
  ```bash
  cd /Users/hammer/Code/homebridge-tesmart
  npm install
  ```

- [ ] Build and verify TypeScript compilation
  ```bash
  npm run build
  npm run lint
  ```

- [ ] Test with actual TESmart switch
  ```bash
  npm link
  # Then restart Homebridge and test all functionality
  ```

- [ ] Verify all features work:
  - [ ] Switch connects successfully
  - [ ] Input switching works
  - [ ] Custom labels display correctly
  - [ ] Hidden inputs are hidden
  - [ ] Auto-reconnection works after disconnect

### Publishing

- [ ] Publish to npm
  ```bash
  npm publish
  ```

- [ ] Create GitHub release
  - Tag: `v1.0.0`
  - Title: `v1.0.0 - Initial Release`
  - Copy content from CHANGELOG.md

- [ ] Update README badges
  - npm version badge (will auto-update)
  - Homebridge Verified badge (after approval)

### Homebridge Verified Submission

- [ ] Submit for Homebridge Verified
  - Go to: https://github.com/homebridge/verified
  - Follow submission process
  - Provide verification checklist

- [ ] Post-submission
  - [ ] Monitor for verification team feedback
  - [ ] Address any issues raised
  - [ ] Update README with verified badge once approved

---

**Status**: Ready for testing and publication
**Last Updated**: 2025-10-12
