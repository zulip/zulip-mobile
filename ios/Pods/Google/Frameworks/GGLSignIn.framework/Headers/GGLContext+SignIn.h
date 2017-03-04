#import <GGLCore/GGLCore.h>

/**
 * This category extends |GGLContext| with the Google Sign In service. To
 * integrate, import GGLContext+SignIn.h.
 *
 * [GIDSignIn sharedInstance] should be ready to use after calling
 * -[[GGLContext sharedInstance] configureWithError:].
 *
 * @see GGLContext
 */
@interface GGLContext (SignIn)

@end
