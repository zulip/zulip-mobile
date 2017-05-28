/* @flow */
import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  LayoutAnimation,
  Alert,
  Platform,
} from 'react-native';

import { ErrorMsg } from '../common';
import ModalNavBar from '../nav/ModalNavBar';
import { writePermission } from '../permissions-android';
import { downloadFile } from '../api';
import share from './share';

const styles = StyleSheet.create({
  img: {
    height: 300,
    alignSelf: 'stretch',
  },
  imgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});

export default class LightBox extends Component {
  state = {
    error: null,
    fullViewMode: false,
  };

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  downloadImage = () => {
    const { fullUrl, auth } = this.props;
    if (Platform.OS === 'ios') {
      downloadFile(fullUrl.uri, auth)
        .then(res => Alert.alert('Success', 'Image saved.'))
        .catch(err => Alert.alert('Photos permission', 'Zulip requires access to photos.'));
    } else {
      writePermission(() =>
        downloadFile(fullUrl.uri, auth)
        .catch(err => console.warn(err))); // eslint-disable-line
    }
  };

  render() {
    const { error, fullViewMode } = this.state;
    const { fullUrl } = this.props;
    const backgroundStyle = {
      backgroundColor: fullViewMode ? 'black' : 'white',
    };
    return (
      <View style={[styles.container, backgroundStyle]}>
        <View style={styles.header}>
          {!fullViewMode &&
            <ModalNavBar
              title={fullUrl.uri.split('/').pop()}
              rightIcon={'ios-share-alt'}
              onRightPress={() => share(fullUrl.uri)}
            />}
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView
            contentContainerStyle={styles.imgContainer}
            centerContent
            maximumZoomScale={3}
            minimumZoomScale={1}
            onScroll={() => {
              this.setState({ fullViewMode: true });
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({ fullViewMode: !fullViewMode });
              }}
            >
              <Image source={fullUrl} style={styles.img} resizeMode={'contain'} />
            </TouchableWithoutFeedback>
          </ScrollView>
          {error && <ErrorMsg error={error} />}
        </View>
      </View>
    );
  }
}
