//
//  SentryClient.h
//  Sentry
//
//  Created by Daniel Griesser on 02/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#import <Foundation/Foundation.h>

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryDefines.h>

#else
#import "SentryDefines.h"
#endif

@class SentryEvent, SentryBreadcrumbStore, SentryUser, SentryThread;

NS_ASSUME_NONNULL_BEGIN

NS_SWIFT_NAME(Client)
@interface SentryClient : NSObject

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

/**
 * Return a version string e.g: 1.2.3 (3)
 */
@property(nonatomic, class, readonly, copy) NSString *versionString;

/**
 * Return a string sentry-cocoa
 */
@property(nonatomic, class, readonly, copy) NSString *sdkName;

/**
 * Set logLevel for the current client default kSentryLogLevelError
 */
@property(nonatomic, class) SentryLogLevel logLevel;

/**
 * Set global user -> thus will be sent with every event
 */
@property(nonatomic, strong) SentryUser *_Nullable user;

/**
 * Set global tags -> these will be sent with every event
 */
@property(nonatomic, strong) NSDictionary<NSString *, NSString *> *_Nullable tags;

/**
 * Set global extra -> these will be sent with every event
 */
@property(nonatomic, strong) NSDictionary<NSString *, id> *_Nullable extra;

/**
 * Contains the last successfully sent event
 */
@property(nonatomic, strong) SentryEvent *_Nullable lastEvent;

/**
 * Contains the last successfully sent event
 */
@property(nonatomic, strong) SentryBreadcrumbStore *breadcrumbs;

/**
 * This block can be used to modify the event before it will be serialized and sent
 */
@property(nonatomic, copy) SentryBeforeSerializeEvent _Nullable beforeSerializeEvent;

/**
 * This block can be used to modify the request before its put on the request queue.
 * Can be used e.g. to set additional http headers before sending
 */
@property(nonatomic, copy) SentryBeforeSendRequest _Nullable beforeSendRequest;

/**
 * This block can be used to prevent the event from being sent.
 * @return BOOL
 */
@property(nonatomic, copy) SentryShouldSendEvent _Nullable shouldSendEvent;

/**
 * Returns the shared sentry client
 * @return sharedClient if it was set before
 */
@property(nonatomic, class) SentryClient *_Nullable sharedClient;

/**
 * Initializes a SentryClient. Pass your private DSN string.
 *
 * @param dsn DSN string of sentry
 * @param error NSError reference object
 * @return SentryClient
 */
- (_Nullable instancetype)initWithDsn:(NSString *)dsn
                     didFailWithError:(NSError *_Nullable *_Nullable)error;

/**
 * This automatically adds breadcrumbs for different user actions.
 */
- (void)enableAutomaticBreadcrumbTracking;

/**
 * Sends and event to sentry. Internally calls @selector(sendEvent:useClientProperties:withCompletionHandler:) with
 * useClientProperties: YES. CompletionHandler will be called if set.
 * @param event SentryEvent that should be sent
 * @param completionHandler SentryRequestFinished
 */
- (void)sendEvent:(SentryEvent *)event withCompletionHandler:(_Nullable SentryRequestFinished)completionHandler
NS_SWIFT_NAME(send(event:completion:));

/**
 * Clears all context related variables tags, extra and user
 */
- (void)clearContext;

/// KSCrash
/// Functions below will only do something if KSCrash is linked

/**
 * This forces a crash, useful to test the KSCrash integration
 *
 */
- (void)crash;

/**
 * This function tries to start the KSCrash handler, return YES if successfully started
 * otherwise it will return false and set error
 *
 * @param error if KSCrash is not available error will be set
 * @return successful
 */
- (BOOL)startCrashHandlerWithError:(NSError *_Nullable *_Nullable)error;

/** 
 * Report a custom, user defined exception. Only works if KSCrash is linked.
 * This can be useful when dealing with scripting languages.
 *
 * If terminateProgram is true, all sentries will be uninstalled and the application will
 * terminate with an abort().
 *
 * @param name The exception name (for namespacing exception types).
 * @param reason A description of why the exception occurred.
 * @param language A unique language identifier.
 * @param lineOfCode A copy of the offending line of code (nil = ignore).
 * @param stackTrace An array of frames (dictionaries or strings) representing the call stack leading to the exception (nil = ignore).
 * @param logAllThreads If YES, suspend all threads and log their state. Note that this incurs a
 *                      performance penalty, so it's best to use only on fatal errors.
 * @param terminateProgram If YES, do not return from this function call. Terminate the program instead.
 */
- (void)reportUserException:(NSString *)name
                     reason:(NSString *)reason
                   language:(NSString *)language
                 lineOfCode:(NSString *)lineOfCode
                 stackTrace:(NSArray *)stackTrace
              logAllThreads:(BOOL)logAllThreads
           terminateProgram:(BOOL)terminateProgram;

/**
 * Returns true if the app crashed before launching now
 */
- (BOOL)crashedLastLaunch;

/**
 * This will snapshot the whole stacktrace at the time when its called. This stacktrace will be attached with the next sent event.
 */
- (void)snapshotStacktrace:(void (^)(void))snapshotCompleted;

@end

NS_ASSUME_NONNULL_END
