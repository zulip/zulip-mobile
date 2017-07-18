//
//  SentryKSCrashInstallation.m
//  Sentry
//
//  Created by Daniel Griesser on 10/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryDefines.h>
#import <Sentry/SentryKSCrashInstallation.h>
#import <Sentry/SentryKSCrashReportSink.h>
#import <Sentry/SentryLog.h>

#else
#import "SentryDefines.h"
#import "SentryKSCrashInstallation.h"
#import "SentryKSCrashReportSink.h"
#import "SentryLog.h"
#endif

#if __has_include(<KSCrash/KSCrash.h>)
#import <KSCrash/KSCrash.h>
#import <KSCrash/KSCrashInstallation+Private.h>
#elif __has_include("KSCrash.h")
#import "KSCrash.h"
#import "KSCrashInstallation+Private.h"
#endif


NS_ASSUME_NONNULL_BEGIN

@implementation SentryKSCrashInstallation

#if WITH_KSCRASH

- (id)init {
    return [super initWithRequiredProperties:[NSArray new]];
}

- (id<KSCrashReportFilter>)sink {
    return [[SentryKSCrashReportSink alloc] init];
}

- (void)sendAllReports {
    [self sendAllReportsWithCompletion:NULL];
}

- (void)sendAllReportsWithCompletion:(KSCrashReportFilterCompletion)onCompletion {
    [super sendAllReportsWithCompletion:^(NSArray *filteredReports, BOOL completed, NSError *error) {
        if (nil != error) {
            [SentryLog logWithMessage:error.localizedDescription andLevel:kSentryLogLevelError];
        }
        [SentryLog logWithMessage:[NSString stringWithFormat:@"Sent %lu crash report(s)", (unsigned long)filteredReports.count] andLevel:kSentryLogLevelDebug];
        if (completed && onCompletion) {
            onCompletion(filteredReports, completed, error);
        }
    }];
}

#else

- (void)sendAllReports {
    [SentryLog logWithMessage:@"This function does nothing if there is no KSCrash" andLevel:kSentryLogLevelError];
}

#endif

@end

NS_ASSUME_NONNULL_END
