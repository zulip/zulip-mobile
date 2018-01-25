//
//  AnchorScrollView.h
//  ZulipMobile
//

#import <React/RCTScrollView.h>

@interface AnchorScrollView : RCTScrollView

@property (nonatomic, assign) BOOL autoScrollToBottom;
@property (nonatomic, assign) NSNumber* anchor;

@end
