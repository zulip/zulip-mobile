//
//  SentryClient.m
//  Sentry
//
//  Created by Daniel Griesser on 02/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryClient.h>
#import <Sentry/SentryClient+Internal.h>
#import <Sentry/SentryLog.h>
#import <Sentry/SentryDsn.h>
#import <Sentry/SentryError.h>
#import <Sentry/SentryUser.h>
#import <Sentry/SentryQueueableRequestManager.h>
#import <Sentry/SentryEvent.h>
#import <Sentry/SentryNSURLRequest.h>
#import <Sentry/SentryKSCrashInstallation.h>
#import <Sentry/SentryBreadcrumbStore.h>
#import <Sentry/SentryFileManager.h>
#import <Sentry/SentryBreadcrumbTracker.h>

#else
#import "SentryClient.h"
#import "SentryClient+Internal.h"
#import "SentryLog.h"
#import "SentryDsn.h"
#import "SentryError.h"
#import "SentryUser.h"
#import "SentryQueueableRequestManager.h"
#import "SentryEvent.h"
#import "SentryNSURLRequest.h"
#import "SentryKSCrashInstallation.h"
#import "SentryBreadcrumbStore.h"
#import "SentryFileManager.h"
#import "SentryBreadcrumbTracker.h"
#endif

#if __has_include(<KSCrash/KSCrash.h>)
#import <KSCrash/KSCrash.h>
#elif __has_include("KSCrash.h")
#import "KSCrash.h"
#endif

NS_ASSUME_NONNULL_BEGIN

NSString *const SentryClientVersionString = @"3.1.2";
NSString *const SentryClientSdkName = @"sentry-cocoa";

static SentryClient *sharedClient = nil;
static SentryLogLevel logLevel = kSentryLogLevelError;

static SentryKSCrashInstallation *installation = nil;

@interface SentryClient ()

@property(nonatomic, strong) SentryDsn *dsn;
@property(nonatomic, strong) SentryFileManager *fileManager;
@property(nonatomic, strong) id <SentryRequestManager> requestManager;

@end

@implementation SentryClient

@synthesize tags = _tags;
@synthesize extra = _extra;
@synthesize user = _user;
@dynamic logLevel;

#pragma mark Initializer

- (_Nullable instancetype)initWithDsn:(NSString *)dsn
                     didFailWithError:(NSError *_Nullable *_Nullable)error {
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration];
    return [self initWithDsn:dsn
              requestManager:[[SentryQueueableRequestManager alloc] initWithSession:session]
            didFailWithError:error];
}

- (_Nullable instancetype)initWithDsn:(NSString *)dsn
                       requestManager:(id <SentryRequestManager>)requestManager
                     didFailWithError:(NSError *_Nullable *_Nullable)error {
    self = [super init];
    if (self) {
        [self setExtra:[NSDictionary new]];
        [self setTags:[NSDictionary new]];
        self.dsn = [[SentryDsn alloc] initWithString:dsn didFailWithError:error];
        self.requestManager = requestManager;
        NSLog(@"Sentry Started -- Version: %@", self.class.versionString);
        self.fileManager = [[SentryFileManager alloc] initWithError:error];
        self.breadcrumbs = [[SentryBreadcrumbStore alloc] initWithFileManager:self.fileManager];
        if (nil != error && nil != *error) {
            [SentryLog logWithMessage:(*error).localizedDescription andLevel:kSentryLogLevelError];
            return nil;
        }
    }
    return self;
}

- (void)enableAutomaticBreadcrumbTracking {
    [[SentryBreadcrumbTracker alloc] start];
}

#pragma mark Static Getter/Setter

+ (_Nullable instancetype)sharedClient {
    return sharedClient;
}

+ (void)setSharedClient:(SentryClient *_Nullable)client {
    sharedClient = client;
}

+ (NSString *)versionString {
    return SentryClientVersionString;
}

+ (NSString *)sdkName {
    return SentryClientSdkName;
}

+ (void)setLogLevel:(SentryLogLevel)level {
    NSParameterAssert(level);
    logLevel = level;
}

+ (SentryLogLevel)logLevel {
    return logLevel;
}

#pragma mark Event

- (void)sendEvent:(SentryEvent *)event withCompletionHandler:(_Nullable SentryRequestFinished)completionHandler {
    [self sendEvent:event useClientProperties:YES withCompletionHandler:completionHandler];
}

- (void)    sendEvent:(SentryEvent *)event
  useClientProperties:(BOOL)useClientProperties
withCompletionHandler:(_Nullable SentryRequestFinished)completionHandler {
    NSParameterAssert(event);
    if (useClientProperties) {
        [self setSharedPropertiesOnEvent:event];
    }

    if (nil != self.beforeSerializeEvent) {
        self.beforeSerializeEvent(event);
    }
    
    if (nil != self.shouldSendEvent && !self.shouldSendEvent(event)) {
        NSString *message = @"SentryClient shouldSendEvent returned NO so we will not send the event";
        [SentryLog logWithMessage:message andLevel:kSentryLogLevelDebug];
        if (completionHandler) {
            completionHandler(NSErrorFromSentryError(kSentryErrorEventNotSent, message));
        }
        return;
    }
    
    NSError *requestError = nil;
    SentryNSURLRequest *request = [[SentryNSURLRequest alloc] initStoreRequestWithDsn:self.dsn
                                                                             andEvent:event
                                                                     didFailWithError:&requestError];
    if (nil != requestError) {
        [SentryLog logWithMessage:requestError.localizedDescription andLevel:kSentryLogLevelError];
        if (completionHandler) {
            completionHandler(requestError);
        }
        return;
    }

    NSString *storedEventPath = [self.fileManager storeEvent:event];

    __block SentryClient *_self = self;
    [self sendRequest:request withCompletionHandler:^(NSError *_Nullable error) {
        if (nil == error) {
            _self.lastEvent = event;
            [NSNotificationCenter.defaultCenter postNotificationName:@"Sentry/eventSentSuccessfully"
                                                              object:nil
                                                            userInfo:[event serialize]];
            [_self.fileManager removeFileAtPath:storedEventPath];

            // Send all stored events in background if the queue is ready
            if ([_self.requestManager isReady]) {
                [_self sendAllStoredEvents];
            }
        }
        if (completionHandler) {
            completionHandler(error);
        }
    }];
}

- (void)  sendRequest:(SentryNSURLRequest *)request
withCompletionHandler:(_Nullable SentryRequestFinished)completionHandler {
    if (nil != self.beforeSendRequest) {
        self.beforeSendRequest(request);
    }
    [self.requestManager addRequest:request completionHandler:completionHandler];
}

- (void)sendAllStoredEvents {
    for (NSDictionary<NSString *, id> *fileDictionary in [self.fileManager getAllStoredEvents]) {
        SentryNSURLRequest *request = [[SentryNSURLRequest alloc] initStoreRequestWithDsn:self.dsn
                                                                                  andData:fileDictionary[@"data"]
                                                                         didFailWithError:nil];
        [self sendRequest:request withCompletionHandler:^(NSError *_Nullable error) {
            if (nil == error) {
                [self.fileManager removeFileAtPath:fileDictionary[@"path"]];
            }
        }];
    }
}

- (void)setSharedPropertiesOnEvent:(SentryEvent *)event {
    if (nil != self.tags) {
        if (nil == event.tags) {
            event.tags = self.tags;
        } else {
            NSMutableDictionary *newTags = [NSMutableDictionary new];
            [newTags addEntriesFromDictionary:self.tags];
            [newTags addEntriesFromDictionary:event.tags];
            event.tags = newTags;
        }
    }

    if (nil != self.extra) {
        if (nil == event.extra) {
            event.extra = self.extra;
        } else {
            NSMutableDictionary *newExtra = [NSMutableDictionary new];
            [newExtra addEntriesFromDictionary:self.extra];
            [newExtra addEntriesFromDictionary:event.extra];
            event.extra = newExtra;
        }
    }

    if (nil != self.user && nil == event.user) {
        event.user = self.user;
    }

    if (nil == event.breadcrumbsSerialized) {
        event.breadcrumbsSerialized = [self.breadcrumbs serialize];
    }
    
    if (nil == event.infoDict) {
        event.infoDict = [[NSBundle mainBundle] infoDictionary];
    }
    
    if (nil == event.threads && nil != self._snapshotThreads && nil != self._debugMeta) {
        event.threads = self._snapshotThreads;
        event.debugMeta = self._debugMeta;
        self._snapshotThreads = nil;
    }
}

#pragma mark Global properties

- (void)setTags:(NSDictionary<NSString *, NSString *> *_Nullable)tags {
    [self setCrashUserInfo:tags forKey:@"tags"];
    _tags = tags;
}

- (void)setExtra:(NSDictionary<NSString *, id> *_Nullable)extra {
    [self setCrashUserInfo:extra forKey:@"extra"];
    _extra = extra;
}

- (void)setUser:(SentryUser *_Nullable)user {
    [self setCrashUserInfo:[user serialize] forKey:@"user"];
    _user = user;
}

- (void)clearContext {
    [self setUser:nil];
    [self setExtra:[NSDictionary new]];
    [self setTags:[NSDictionary new]];
}

#pragma mark KSCrash

#if WITH_KSCRASH

- (BOOL)crashedLastLaunch {
    return KSCrash.sharedInstance.crashedLastLaunch;
}

- (void)setCrashUserInfo:(NSDictionary<NSString *, id <NSSecureCoding>> *_Nullable)dict forKey:(NSString *)key {
    if (nil == KSCrash.sharedInstance) {
        [SentryLog logWithMessage:@"KSCrash has not been initialized, call startCrashHandlerWithError" andLevel:kSentryLogLevelError];
        return;
    }
    NSMutableDictionary *userInfo = nil;
    if (nil != KSCrash.sharedInstance.userInfo) {
        userInfo = KSCrash.sharedInstance.userInfo.mutableCopy;
    } else {
        userInfo = [NSMutableDictionary new];
    }
    if (nil == dict) {
        [userInfo removeObjectForKey:key];
    } else {
        [userInfo setValue:dict forKey:key];
    }
    KSCrash.sharedInstance.userInfo = userInfo;
}

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
- (BOOL)startCrashHandlerWithError:(NSError *_Nullable *_Nullable)error {
    [SentryLog logWithMessage:@"KSCrashHandler started" andLevel:kSentryLogLevelDebug];
    static dispatch_once_t onceToken = 0;
    dispatch_once(&onceToken, ^{
        installation = [[SentryKSCrashInstallation alloc] init];
        [installation install];
        [installation sendAllReports];
    });
    return YES;
}
#pragma GCC diagnostic pop

- (void)crash {
    int* p = 0;
    *p = 0;
}

- (void)reportUserException:(NSString *)name
                     reason:(NSString *)reason
                   language:(NSString *)language
                 lineOfCode:(NSString *)lineOfCode
                 stackTrace:(NSArray *)stackTrace
              logAllThreads:(BOOL)logAllThreads
           terminateProgram:(BOOL)terminateProgram {
    if (nil == installation) {
        [SentryLog logWithMessage:@"KSCrash has not been initialized, call startCrashHandlerWithError" andLevel:kSentryLogLevelError];
        return;
    }
    [KSCrash.sharedInstance reportUserException:name
                                         reason:reason
                                       language:language
                                     lineOfCode:lineOfCode
                                     stackTrace:stackTrace
                                  logAllThreads:logAllThreads
                               terminateProgram:terminateProgram];
    [installation sendAllReports];
}

- (void)snapshotStacktrace:(void (^)(void))snapshotCompleted {
    if (nil == installation) {
        [SentryLog logWithMessage:@"KSCrash has not been initialized, call startCrashHandlerWithError" andLevel:kSentryLogLevelError];
        return;
    }
    [KSCrash.sharedInstance reportUserException:@"SENTRY_SNAPSHOT"
                                         reason:@"SENTRY_SNAPSHOT"
                                       language:@""
                                     lineOfCode:@""
                                     stackTrace:[NSArray new]
                                  logAllThreads:NO
                               terminateProgram:NO];
    [installation sendAllReportsWithCompletion:^(NSArray *filteredReports, BOOL completed, NSError *error) {
        snapshotCompleted();
    }];
}

#else

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"

- (void)reportUserException:(NSString *)name
                     reason:(NSString *)reason
                   language:(NSString *)language
                 lineOfCode:(NSString *)lineOfCode
                 stackTrace:(NSArray *)stackTrace
              logAllThreads:(BOOL)logAllThreads
           terminateProgram:(BOOL)terminateProgram {
    [SentryLog logWithMessage:@"Cannot report userException without KSCrash dependency" andLevel:kSentryLogLevelError];
}

- (void)setCrashUserInfo:(NSDictionary<NSString *, id <NSSecureCoding>> *_Nullable)dict forKey:(NSString *)key {
    // We need to do nothing here without KSCrash
}

#pragma GCC diagnostic pop

- (BOOL)startCrashHandlerWithError:(NSError *_Nullable *_Nullable)error {
    NSString *message = @"KSCrashHandler not started - Make sure you added KSCrash as a dependency";
    [SentryLog logWithMessage:message andLevel:kSentryLogLevelError];
    if (nil != error) {
        *error = NSErrorFromSentryError(kSentryErrorKSCrashNotInstalledError, message);
    }
    return NO;
}

- (void)crash {
    [SentryLog logWithMessage:@"Would have crashed - but since KSCrash is not linked we do nothing." andLevel:kSentryLogLevelError];
}

- (BOOL)crashedLastLaunch {
    [SentryLog logWithMessage:@"KSCrash is not linked we cannot tell if app crashed." andLevel:kSentryLogLevelError];
    return NO;
}

- (void)snapshotStacktrace:(void (^)(void))snapshotCompleted {
    [SentryLog logWithMessage:@"KSCrash is not linked snapshot the stacktrace." andLevel:kSentryLogLevelError];
    snapshotCompleted();
}

#endif

@end

NS_ASSUME_NONNULL_END
