//
//  RCTView+Tag.m
//  ZulipMobile
//

#import "UIView+Tag.h"

#import <objc/runtime.h>

@implementation UIView (Tag)

- (NSString *) tagID
{
  return objc_getAssociatedObject(self, _cmd);
}

- (void) setTagID:(NSString *)tagID
{
  objc_setAssociatedObject(self, @selector(tagID), tagID, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

@end
