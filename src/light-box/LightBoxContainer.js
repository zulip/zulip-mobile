/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { connect } from 'react-redux';
import PhotoView from 'react-native-photo-view';

import boundActions from '../boundActions';
import share from './share'; // eslint-disable-line
import { downloadFile } from '../api'; // eslint-disable-line
import Header from './Header';
import Footer from './Footer';
import NavButton from '../nav/NavButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  header: {
    flex: 0,
    backgroundColor: 'black',
    borderColor: 'black',
  },
  footer: {
    flex: 0,
  },
  img: {
    height: 300,
    alignSelf: 'stretch',
    flex: 1,
  },
});

class LightBoxContainer extends Component {
  handleAvatarPress = () => {
    const { pushRoute, popRoute, message } = this.props;
    popRoute();
    pushRoute('account-details', message.sender_email);
  }

  getFooter = () => {
    const { message } = this.props;
    return message.type === 'stream'
      ? `Shared in #${message.display_recipient}`
      : 'Shared with you';
  };

  downloadImage = () => {
    const { fullUrl, auth } = this.props;
    if (Platform.OS === 'ios') {
      downloadFile(fullUrl.uri, auth)
        .then(res => Alert.alert('Download complete', 'Image saved.'))
        .catch(err => Alert.alert('Photos permission', 'Zulip requires access to photos.'));
    } else {
      downloadFile(fullUrl.uri, auth).catch(err => console.warn(err)); // eslint-disable-line
    }
  };

  render() {
    const { fullUrl, auth, message, popRoute } = this.props;
    const fileName = fullUrl.uri.split('/').pop();
    return (
      <View style={styles.container}>
        <Header
          avatarUrl={message.avatar_url}
          realm={auth.realm}
          senderName={message.sender_short_name}
          style={styles.header}
          popRoute={popRoute}
          handleAvatarPress={this.handleAvatarPress}
        >
          <NavButton name="md-share-alt" color="white" onPress={() => share(fullUrl.uri)} />
          <NavButton
            name="md-download"
            color="white"
            onPress={this.downloadImage}
          />
        </Header>
        <PhotoView centerContent maximumZoomScale={3} minimumZoomScale={1} source={fullUrl} resizeMode={'contain'} style={styles.img} />
        <View style={styles.footer}>
          <Footer fileName={fileName} timestamp={message.timestamp} message={this.getFooter()} />
        </View>
      </View>
    );
  }
}

export default connect(null, boundActions)(LightBoxContainer);
