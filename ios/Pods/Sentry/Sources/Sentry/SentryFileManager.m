//
//  SentryFileManager.m
//  Sentry
//
//  Created by Daniel Griesser on 23/05/2017.
//  Copyright © 2017 Sentry. All rights reserved.
//

#if __has_include(<Sentry/Sentry.h>)

#import <Sentry/SentryFileManager.h>
#import <Sentry/SentryError.h>
#import <Sentry/SentryLog.h>
#import <Sentry/SentryEvent.h>
#import <Sentry/SentryBreadcrumb.h>

#else
#import "SentryFileManager.h"
#import "SentryError.h"
#import "SentryLog.h"
#import "SentryEvent.h"
#import "SentryBreadcrumb.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@interface SentryFileManager ()

@property(nonatomic, copy) NSString *sentryPath;
@property(nonatomic, copy) NSString *breadcrumbsPath;
@property(nonatomic, copy) NSString *eventsPath;
@property(nonatomic, assign) NSUInteger currentFileCounter;

@end

@implementation SentryFileManager

- (_Nullable instancetype)initWithError:(NSError **)error {
    self = [super init];
    if (self) {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        NSString *cachePath = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES).firstObject;
        self.sentryPath = [cachePath stringByAppendingPathComponent:@"io.sentry"];
        if (![fileManager fileExistsAtPath:self.sentryPath]) {
            [self.class createDirectoryAtPath:self.sentryPath withError:error];
        }

        self.breadcrumbsPath = [self.sentryPath stringByAppendingPathComponent:@"breadcrumbs"];
        if (![fileManager fileExistsAtPath:self.breadcrumbsPath]) {
            [self.class createDirectoryAtPath:self.breadcrumbsPath withError:error];
        }

        self.eventsPath = [self.sentryPath stringByAppendingPathComponent:@"events"];
        if (![fileManager fileExistsAtPath:self.eventsPath]) {
            [self.class createDirectoryAtPath:self.eventsPath withError:error];
        }

        self.currentFileCounter = 0;
    }
    return self;
}

- (void)deleteAllFolders {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    [fileManager removeItemAtPath:self.breadcrumbsPath error:nil];
    [fileManager removeItemAtPath:self.eventsPath error:nil];
    [fileManager removeItemAtPath:self.sentryPath error:nil];
}

- (NSString *)uniqueAcendingJsonName {
    return [NSString stringWithFormat:@"%f-%lu-%@.json",
                                      [[NSDate date] timeIntervalSince1970],
                                      (unsigned long) self.currentFileCounter++,
                                      [NSUUID UUID].UUIDString];
}

- (NSArray<NSDictionary<NSString *, id> *> *)getAllStoredEvents {
    return [self allFilesContentInFolder:self.eventsPath];
}

- (NSArray<NSDictionary<NSString *, id> *> *)getAllStoredBreadcrumbs {
    return [self allFilesContentInFolder:self.breadcrumbsPath];
}

- (NSArray<NSDictionary<NSString *, id> *> *)allFilesContentInFolder:(NSString *)path {
    NSMutableArray *contents = [NSMutableArray new];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    for (NSString *filePath in [self allFilesInFolder:path]) {
        NSString *finalPath = [path stringByAppendingPathComponent:filePath];
        [contents addObject:@{@"path": finalPath, @"data": [fileManager contentsAtPath:finalPath]}];
    }
    return contents;
}

- (void)deleteAllStoredEvents {
    for (NSString *path in [self allFilesInFolder:self.eventsPath]) {
        [self removeFileAtPath:[self.eventsPath stringByAppendingPathComponent:path]];
    }
}

- (void)deleteAllStoredBreadcrumbs {
    for (NSString *path in [self allFilesInFolder:self.breadcrumbsPath]) {
        [self removeFileAtPath:[self.breadcrumbsPath stringByAppendingPathComponent:path]];
    }
}

- (NSArray<NSString *> *)allFilesInFolder:(NSString *)path {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;
    NSArray < NSString * > *storedEvents = [fileManager contentsOfDirectoryAtPath:path error:&error];
    if (nil != error) {
        [SentryLog logWithMessage:[NSString stringWithFormat:@"Couldn't load files in folder %@: %@", path, error] andLevel:kSentryLogLevelError];
        return [NSArray new];
    }
    return storedEvents;
}

- (BOOL)removeFileAtPath:(NSString *)path {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;
    @synchronized (self) {
        [fileManager removeItemAtPath:path error:&error];
        if (nil != error) {
            [SentryLog logWithMessage:[NSString stringWithFormat:@"Couldn't delete file %@: %@", path, error] andLevel:kSentryLogLevelError];
            return NO;
        }
    }
    return YES;
}

- (NSString *)storeEvent:(SentryEvent *)event {
    return [self storeDictionary:[event serialize] toPath:self.eventsPath];
}

- (NSString *)storeBreadcrumb:(SentryBreadcrumb *)crumb {
    return [self storeDictionary:[crumb serialize] toPath:self.breadcrumbsPath];
}

- (NSString *)storeDictionary:(NSDictionary *)dictionary toPath:(NSString *)path {
    if (![NSJSONSerialization isValidJSONObject:dictionary]) {
        return nil;
    }
    NSData *saveData = [NSJSONSerialization dataWithJSONObject:dictionary options:0 error:nil];
    @synchronized (self) {
        NSString *finalPath = [path stringByAppendingPathComponent:[self uniqueAcendingJsonName]];
        [SentryLog logWithMessage:[NSString stringWithFormat:@"Writing to file: %@", finalPath] andLevel:kSentryLogLevelDebug];
        [saveData writeToFile:finalPath options:NSDataWritingAtomic error:nil];
        return finalPath;
    }
}

+ (BOOL)createDirectoryAtPath:(NSString *)path withError:(NSError **)error {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    return [fileManager createDirectoryAtPath:path
                  withIntermediateDirectories:YES
                                   attributes:nil
                                        error:error];
}

@end

NS_ASSUME_NONNULL_END
