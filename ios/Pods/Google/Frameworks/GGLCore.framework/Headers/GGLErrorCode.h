/** Error codes in Greenhouse error domain. */
typedef enum {
  /**
   * Operation succeeded.
   */
  kGGLErrorCodeSucceeded = 0,
  /**
   * Default failure error code. This is a catch all error and indicates something has gone very
   * wrong. There is no remediation for this case.
   **/
  kGGLErrorCodeUnknownFailure = -1,

  /**
   * Indicates that the calling method did not do anything in response to the call. This occurs in
   * situations where the caller asked state to be mutated into its current state or selector wasn't
   * present but it isn't considered a critical failure.
   */
  kGGLErrorCodeNoOp = -2,

  /**
   * Indicates that configuration failed. The userInfo dictionary will contain more information
   * about the failure.
   */
  kGGLErrorCodeConfigurationFailed = -3,

  // 100 series error codes are for GGLContext

  /**
   * Configuration of Analytics subspec failed. Additional details on the reason for the failure
   * appear in the related NSError.
   */
  kGGLErrorCodeAnalyticsSubspecConfigFailed = -102,

  /**
   * Configuration of SignIn subspec failed. Additional details on the reason for the failure appear
   * in the related NSError.
   */
  kGGLErrorCodeSignInSubspecConfigFailed = -105,

  /**
   * Missing expected subspec error.
   */
  kGGLErrorCodeMissingExpectedSubspec = -106,

} GGLErrorCode;
