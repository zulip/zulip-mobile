import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Share,
  TouchableWithoutFeedback,
  LayoutAnimation,
} from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import { ErrorMsg } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

const styles = StyleSheet.create({
  img: {
    height: 300,
    alignSelf: 'stretch'
  },
  imgContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    zIndex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  }
});

class LightBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      fullViewMode: false,
    };
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  shareLink = () => {
    Share.share(
      {
        url: this.props.fullUrl.uri,
        title: 'Share via Zulip'
      },
      {
        dialogTitle: 'Share via Zulip',
        excludedActivityTypes: ['com.apple.UIKit.activity.PostToTwitter'],
        tintColor: BRAND_COLOR
      }
    )
    .then(() => this.setState({ error: null }))
    .catch(error => this.setState({ error: error.message }));
  }

  render() {
    const { container, img, imgContainer, bodyContainer, header } = styles;
    const { error, fullViewMode } = this.state;
    const { fullUrl } = this.props;
    const backgroundStyle = {
      backgroundColor: fullViewMode ? 'black' : 'white'
    };
    return (
      <View
        style={[container, backgroundStyle]}
      >
        <View style={header}>
          {!fullViewMode && <ModalNavBar
            title={fullUrl.uri.split('/').pop()}
            rightIcon={'ios-share-alt'}
            onRightPress={this.shareLink}
          />}
        </View>
        <View style={bodyContainer}>
          <ScrollView
            contentContainerStyle={imgContainer}
            centerContent
            maximumZoomScale={3}
            minimumZoomScale={1}
            onScroll={() => { this.setState({ fullViewMode: true }); }}
          >
            <TouchableWithoutFeedback
              onPress={() => { this.setState({ fullViewMode: !fullViewMode }); }}
            >
              <Image
                source={fullUrl}
                style={img}
                resizeMode={'contain'}
              />
            </TouchableWithoutFeedback>
          </ScrollView>
          {error && <ErrorMsg error={error} />}
        </View>
      </View>
    );
  }
}

export default LightBox;
