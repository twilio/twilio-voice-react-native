The Twilio Voice React Native SDK uses [Semantic Versioning](http://www.semver.org). (TODO)

### 1.0.0

#### Enhancement

#### Bug fixes

* Android multi-event issue [VBLOCKS-234]
  An issue was fixed where the Android-native side of the SDK would emit the
  same event multiple times to the JS layer. This was most noticeable during
  development and testing but might rarely occur in normal usage.

* Android ringtone issue [VBLOCKS-288]
  An issue was fixed where the Android-native side of the SDK would always
  ring to the earpiece for inbound calls, while ring to the speaker for outbound
  calls.

#### Maintenance

#### Things to Note

* Android ring tone volume is loud [VBLOCKS-240]
* Dark mode theme is not supported [VBLOCKS-241]
