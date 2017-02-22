#import <Foundation/Foundation.h>

/**
 * This class provides configuration fields of Google APIs.
 */
@interface GGLConfiguration : NSObject

/**
 * The OAuth2 client ID for the iOS application, used to authenticate Google users. For example
 * @"12345.apps.googleusercontent.com".
 */
@property(nonatomic, readonly, copy) NSString *clientID;

/**
 * The tracking ID for Google Analytics, e.g. @"UA-12345678-1", used to configure Google Analytics.
 */
@property(nonatomic, readonly, copy) NSString *trackingID;

/**
 * The Google App ID that is used to uniquely identify an instance of an app.
 */
@property(nonatomic, readonly, copy) NSString *googleAppID;

/**
 * Whether or not Analytics was enabled in the developer console.
 */
@property(nonatomic, readonly) BOOL isAnalyticsEnabled;

/**
 * Whether or not Measurement was enabled. Measurement is enabled unless explicitly disabled in
 * GoogleService-Info.plist.
 */
@property(nonatomic, readonly) BOOL isMeasurementEnabled;

/**
 * Whether or not SignIn was enabled in the developer console.
 */
@property(nonatomic, readonly) BOOL isSignInEnabled;

/**
 * The version ID of the client library, e.g. @"1100000".
 */
@property(nonatomic, readonly, copy) NSString *libraryVersionID;

@end
