#import <Foundation/Foundation.h>

/**
 * This class provides configuration fields for Google Measurement.
 */
@interface GMRConfiguration : NSObject

/**
 * Returns the shared instance of GMRConfiguration.
 */
+ (GMRConfiguration *)sharedInstance;

/**
 * Sets whether measurement and reporting are enabled for this app on this device. By default they
 * are enabled.
 */
- (void)setIsEnabled:(BOOL)isEnabled;

@end
