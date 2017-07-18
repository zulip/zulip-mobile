#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "NSData+Compression.h"
#import "NSDate+Extras.h"
#import "NSDictionary+Sanitize.h"
#import "Sentry.h"
#import "SentryAsynchronousOperation.h"
#import "SentryBreadcrumb.h"
#import "SentryBreadcrumbStore.h"
#import "SentryBreadcrumbTracker.h"
#import "SentryClient+Internal.h"
#import "SentryClient.h"
#import "SentryContext.h"
#import "SentryDebugMeta.h"
#import "SentryDefines.h"
#import "SentryDsn.h"
#import "SentryError.h"
#import "SentryEvent.h"
#import "SentryException.h"
#import "SentryFileManager.h"
#import "SentryFrame.h"
#import "SentryKSCrashInstallation.h"
#import "SentryKSCrashReportConverter.h"
#import "SentryKSCrashReportSink.h"
#import "SentryLog.h"
#import "SentryNSURLRequest.h"
#import "SentryQueueableRequestManager.h"
#import "SentryRequestOperation.h"
#import "SentrySerializable.h"
#import "SentryStacktrace.h"
#import "SentrySwizzle.h"
#import "SentryThread.h"
#import "SentryUser.h"

FOUNDATION_EXPORT double SentryVersionNumber;
FOUNDATION_EXPORT const unsigned char SentryVersionString[];

