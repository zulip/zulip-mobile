#import <Foundation/Foundation.h>

@class GGLConfiguration;

/**
 * Main entry point for Google API core configuration. Google services including Analytics and
 * SignIn can be configured via this class and its categories. See GGLContext+<ServiceName> for
 * details on the individual APIs.
 *
 * Once the appropriate categories are imported, you can configure all services via the
 * |configureWithError:| method. For example:
 *
 * <pre>
 * NSError *configureError;
 * [[GGLContext sharedInstance] configureWithError:&configureError];
 * if (configureError != nil) {
 *   NSLog(@"Error configuring the Google context: %@", configureError);
 * }
 * </pre>
 *
 * The method |configureWithError:| will read from the file GoogleServices-Info.plist bundled with
 * your app target for the keys to configure each individual API. To generate your
 * GoogleServices-Info.plist, please go to https://developers.google.com/mobile/add
 *
 * @see GGLContext (Analytics)
 * @see GGLContext (SignIn)
 */
@interface GGLContext : NSObject

/**
 * The configuration details for various Google APIs.
 */
@property(nonatomic, readonly) GGLConfiguration *configuration;

/**
 * Gets the singleton context.
 * @return The singleton context.
 */
+ (instancetype)sharedInstance;

/**
 * Configures integrated Google services Google Sign In and Google Analytics.
 *
 * This method should be called after the app is launched and before using other Google services.
 * The services will be available in categories that extend this class, such as
 * GGLContext+Analytics.
 *
 * @param error An ouput error, which will be populated if there was an error configuring the Google
 *              services. Must not be nil.
 *
 * @warning error must not be nil.
 */
- (void)configureWithError:(NSError **)error;

@end
