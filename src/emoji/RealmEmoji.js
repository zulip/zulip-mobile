import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux';
import { getAuth } from '../account/accountSelectors';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

class RealmEmoji extends React.PureComponent {

  render() {
    const { name, realmEmoji, auth } = this.props;

    return (
      <Image
        style={styles.image}
        source={{ uri: auth.realm.concat(realmEmoji[name].source_url) }}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  realmEmoji: state.realmEmoji.realm_emoji,
});

export default connect(mapStateToProps)(RealmEmoji);
