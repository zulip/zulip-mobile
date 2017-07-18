//
//  SentryRequestOperation.m
//  Sentry
//
//  Created by Daniel Griesser on 05/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryRequestOperation.h>
#import <Sentry/SentryLog.h>
#import <Sentry/SentryError.h>

#else
#import "SentryRequestOperation.h"
#import "SentryLog.h"
#import "SentryError.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@interface SentryRequestOperation ()

@property(nonatomic, strong) NSURLSessionTask *task;
@property(nonatomic, strong) NSURLRequest *request;

@end

@implementation SentryRequestOperation

- (instancetype)initWithSession:(NSURLSession *)session request:(NSURLRequest *)request
              completionHandler:(_Nullable SentryRequestFinished)completionHandler {
    self = [super init];
    if (self) {
        self.request = request;
        self.task = [session dataTaskWithRequest:self.request completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
            NSInteger statusCode = [httpResponse statusCode];

            [SentryLog logWithMessage:[NSString stringWithFormat:@"Request status: %ld", (long) statusCode] andLevel:kSentryLogLevelDebug];
            [SentryLog logWithMessage:[NSString stringWithFormat:@"Request response: %@", [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]] andLevel:kSentryLogLevelVerbose];

            if (nil != error) {
                [SentryLog logWithMessage:[NSString stringWithFormat:@"Request failed: %@", error] andLevel:kSentryLogLevelError];
            }

            NSError *requestError = nil;
            if (statusCode >= 400 && statusCode <= 500) {
                requestError = NSErrorFromSentryError(kSentryErrorRequestError, [NSString stringWithFormat:@"Request errored with %ld", (long) statusCode]);
                if (statusCode == 429) {
                    [SentryLog logWithMessage:@"Rate limit reached, event will be stored and sent later" andLevel:kSentryLogLevelError];
                }
                [SentryLog logWithMessage:[NSString stringWithFormat:@"Request failed: %@", requestError] andLevel:kSentryLogLevelError];
            }

            if (completionHandler) {
                completionHandler(error ? error : requestError);
            }

            [self completeOperation];
        }];
    }
    return self;
}

- (void)cancel {
    if (nil != self.task) {
        [self.task cancel];
    }
    [super cancel];
}

- (void)main {
    if (nil != self.task) {
        [self.task resume];
    }
}

@end

NS_ASSUME_NONNULL_END
