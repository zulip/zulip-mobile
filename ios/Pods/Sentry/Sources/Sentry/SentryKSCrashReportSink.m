//
//  SentryKSCrashReportSink.m
//  Sentry
//
//  Created by Daniel Griesser on 10/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryDefines.h>
#import <Sentry/SentryKSCrashReportSink.h>
#import <Sentry/SentryKSCrashReportConverter.h>
#import <Sentry/SentryClient+Internal.h>
#import <Sentry/SentryClient.h>
#import <Sentry/SentryEvent.h>
#import <Sentry/SentryException.h>
#import <Sentry/SentryLog.h>
#import <Sentry/SentryThread.h>

#else
#import "SentryDefines.h"
#import "SentryKSCrashReportSink.h"
#import "SentryKSCrashReportConverter.h"
#import "SentryClient.h"
#import "SentryClient+Internal.h"
#import "SentryEvent.h"
#import "SentryException.h"
#import "SentryLog.h"
#import "SentryThread.h"
#endif

#if __has_include(<KSCrash/KSCrash.h>)
#import <KSCrash/KSCrash.h>
#elif __has_include("KSCrash.h")
#import "KSCrash.h"
#endif

@implementation SentryKSCrashReportSink

#if WITH_KSCRASH

- (void)handleConvertedEvent:(SentryEvent *)event report:(NSDictionary *)report sentReports:(NSMutableArray *)sentReports {
    if (nil != event.exceptions.firstObject && [event.exceptions.firstObject.value isEqualToString:@"SENTRY_SNAPSHOT"]) {
        [SentryLog logWithMessage:@"Snapshotting stacktrace" andLevel:kSentryLogLevelDebug];
        NSMutableArray <SentryThread *> *crashedThreads = [NSMutableArray new];
        for (SentryThread *thread in event.threads) {
            if (thread) {
                if ([thread.crashed boolValue]) {
                    [crashedThreads addObject:thread];
                    break;
                }
            }
        }
        SentryClient.sharedClient._snapshotThreads = crashedThreads;
        SentryClient.sharedClient._debugMeta = event.debugMeta;
    } else {
        [sentReports addObject:report];
        [SentryClient.sharedClient sendEvent:event withCompletionHandler:NULL];
    }
}

- (void)filterReports:(NSArray *)reports
          onCompletion:(KSCrashReportFilterCompletion)onCompletion {
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0ul);
    dispatch_async(queue, ^{
        NSMutableArray *sentReports = [NSMutableArray new];
        for (NSDictionary *report in reports) {
            SentryKSCrashReportConverter *reportConverter = [[SentryKSCrashReportConverter alloc] initWithReport:report];
            if (nil != SentryClient.sharedClient) {
                SentryEvent *event = [reportConverter convertReportToEvent];
                [self handleConvertedEvent:event report:report sentReports:sentReports];
            }
        }
        if (onCompletion) {
            onCompletion(sentReports, TRUE, nil);
        }
    });

}
#endif

@end
