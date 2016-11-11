import React from 'react';
import {
  ActivityIndicator,
  CameraRoll,
  Image,
  ListView,
  Platform,
  StyleSheet,
  View,
  groupByEveryN,
  logError,
} from 'react-native';

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
});

type GroupType = 'Album' | 'All' | 'Event' | 'Faces' | 'Library' | 'PhotoStream' | 'SavedPhotos';
type AssetType ='Photos' | 'Videos' | 'All';

export default class CameraRollView extends React.Component {

  props: {
    groupTypes: GroupType,
    batchSize: number,
    // renderImage: () => {},
    imagesPerRow: number,
    assetType: AssetType,
  }

  defaultProps: {
    groupTypes: 'SavedPhotos',
    batchSize: 5,
    imagesPerRow: 1,
    assetType: 'Photos',
  }

  constructor(props) {
    super(props);
    this.state = {
      assets: [],
      // groupTypes: GroupType,
      lastCursor: '',
      // assetType: AssetType,
      noMore: false,
      loadingMore: false,
      dataSource: new ListView.DataSource({ rowHasChanged: this.handleRowHasChanged }),
    };
  }

  rendererChanged = () => {
    const ds = new ListView.DataSource({ rowHasChanged: this.handleRowHasChanged });
    this.state.dataSource = ds.cloneWithRows(
      groupByEveryN(this.state.assets, this.props.imagesPerRow)
    );
  }

  componentDidMount = () => {
    this.fetch();
  }

  componentWillReceiveProps = (nextProps: {groupTypes?: string}) => {
    if (this.props.groupTypes !== nextProps.groupTypes) {
      this.fetch(true);
    }
  }

  fetch = (clear?: boolean) => {
    if (clear) {
      this.setState(this.getInitialState(), this.fetch);
      return;
    }

    const fetchParams: Object = {
      first: this.props.batchSize,
      groupTypes: this.props.groupTypes,
      assetType: this.props.assetType,
    };

    if (Platform.OS === 'android') {
      // not supported in android
      delete fetchParams.groupTypes;
    }
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor;
    }

    CameraRoll.getPhotos(fetchParams)
      .then((data) => this.appendAssets(data), (e) => logError(e));
  }

  fetch = (clear?: boolean) => {
    if (!this.state.loadingMore) {
      this.setState({ loadingMore: true }, () => { this.fetch(clear); });
    }
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

  renderFooterSpinner = () => {
    if (!this.state.noMore) {
      return <ActivityIndicator />;
    }
    return null;
  }

  // rowData is an array of images
  renderRow = (rowData: Array<Image>, sectionID: string, rowID: string) => {
    const images = rowData.map((image) => {
      if (image === null) {
        return null;
      }
      return (
        <Image
          source={image.node.image}
          style={styles.image}
        />
      );
    });

    return (
      <View style={styles.row}>
        {images}
      </View>
    );
  }

  appendAssets = (data: Object) => {
    const assets = data.edges;
    const newState: Object = { loadingMore: false };

    if (!data.page_info.has_next_page) {
      newState.noMore = true;
    }

    if (assets.length > 0) {
      newState.lastCursor = data.page_info.end_cursor;
      newState.assets = this.state.assets.concat(assets);
      newState.dataSource = this.state.dataSource.cloneWithRows(
        groupByEveryN(newState.assets, this.props.imagesPerRow)
      );
    }

    this.setState(newState);
  }

  onEndReached = () => {
    if (!this.state.noMore) {
      this.fetch();
    }
  }

  render() {
    return (
      <ListView
        renderRow={this.renderRow}
        renderFooter={this.renderFooterSpinner}
        onEndReached={this.onEndReached}
        style={styles.container}
        dataSource={this.state.dataSource}
      />
    );
  }
}
