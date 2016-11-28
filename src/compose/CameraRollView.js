import React from 'react';
import {
  CameraRoll,
  Image,
  ListView,
  groupByEveryN,
} from 'react-native';

import CameraPhotoList from './CameraPhotoList';

type AssetType = 'Photos' | 'Videos' | 'All';

export default class CameraRollView extends React.Component {

  props: {
    batchSize: number,
    // renderImage: () => {},
    imagesPerRow: number,
    assetType: AssetType,
  }

  static defaultProps = {
    groupTypes: 'SavedPhotos',
    batchSize: 5,
    imagesPerRow: 1,
    assetType: 'Photos',
  }

  constructor(props) {
    super(props);
    this.state = {
      assets: [],
      groupTypes: 'All',
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
    this.fetchPhotos();
  }

  componentWillReceiveProps = (nextProps: {groupTypes?: string}) => {
    if (this.props.groupTypes !== nextProps.groupTypes) {
      this.setState(this.getInitialState(), this.fetchPhotos);
    }
  }

  fetchPhotos = async () => {
    const data = await CameraRoll.getPhotos({
      first: this.props.batchSize,
      groupTypes: 'All', // not supported in android, do not include? Platform.OS === 'android'
      assetType: this.props.assetType,
      after: this.state.lastCursor,
    });
    this.appendAssets(data);
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
      this.fetchPhotos();
    }
  }

  render() {
    const { dataSource } = this.state;

    return (
      <CameraPhotoList
        noMoreData={this.state.noMore}
        dataSource={dataSource}
        onEndReached={this.onEndReached}
      />
    );
  }
}
