// To use an Objective-C module in a Swift file, first just try importing it
// at the top of your Swift file, like so:
//
//   import React.RCTBridgeModule
//
// If you can't find an import line that Xcode understands, instead try
// adding an import line in this file, like so:
//
//   #import <React/RCTBridgeModule.h>
//
// That should make the module (plus the modules *it* imports, actually)
// available in all our project's Swift files, without the Swift files
// needing an import line of their own.
//
// The first approach (an import line in the Swift file) is preferred
// because it looks like how imports normally work in Swift. But sometimes
// we can't find an import line that works; not sure why. Discussion:
//   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/ios.2FZulipMobile-Bridging-Header.2Eh/near/1520435
