import React from 'react';
import {
  ActivityIndicator,
  Image,
  ListView,
  StyleSheet,
  View,
  groupByEveryN,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: 150,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  url: {
    fontSize: 9,
    marginBottom: 14,
  },
  image: {
    margin: 4,
    width: 150,
    height: 150,
  },
  info: {
    flex: 1,
  },
});

export default class CameraPhotoList extends React.Component {

  props: {
    noMoreData: boolean,
    dataSource: any,
    onEndReached: () => {},
  }

  defaultProps: {
    groupTypes: 'SavedPhotos',
    batchSize: 5,
    imagesPerRow: 1,
    assetType: 'Photos',
  }

  rendererChanged = () => {
    const ds = new ListView.DataSource({ rowHasChanged: this.handleRowHasChanged });
    this.state.dataSource = ds.cloneWithRows(
      groupByEveryN(this.state.assets, this.props.imagesPerRow)
    );
  }

  handleRowHasChanged = (r1: Array<Image>, r2: Array<Image>): boolean => {
    if (r1.length !== r2.length) {
      return true;
    }

    for (let i = 0; i < r1.length; i++) {
      if (r1[i] !== r2[i]) {
        return true;
      }
    }

    return false;
  }

  renderFooterSpinner = () =>
    (this.props.noMoreData ? null : <ActivityIndicator />);

  renderRow = (rowData: Array<Image>, sectionID: string, rowID: string) => (
    <View style={styles.row}>
      {rowData.map((image) => image &&
        <Image
          source={image.node.image}
          style={styles.image}
        />
      )}
    </View>
  );

  render() {
    const { dataSource, onEndReached } = this.props;

    return (
      <ListView
        renderRow={this.renderRow}
        renderFooter={this.renderFooterSpinner}
        onEndReached={onEndReached}
        style={styles.container}
        dataSource={dataSource}
      />
    );
  }
}
